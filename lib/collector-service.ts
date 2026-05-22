import "server-only";

import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

type ManagedCollectorState = {
  state: "idle" | "starting" | "running" | "stopping" | "stopped" | "error";
  child: ChildProcess | null;
  startedAt: string | null;
  lastExitAt: string | null;
  lastError: string | null;
  lastLogLine: string | null;
  overrideUntil: string | null;
};

declare global {
  var __collectorManagerState: ManagedCollectorState | undefined;
}

function getCollectorState(): ManagedCollectorState {
  if (!global.__collectorManagerState) {
    global.__collectorManagerState = {
      state: "idle",
      child: null,
      startedAt: null,
      lastExitAt: null,
      lastError: null,
      lastLogLine: null,
      overrideUntil: null
    };
  }

  return global.__collectorManagerState;
}

function collectorWorkingDirectory(): string {
  return path.join(process.cwd(), "collector");
}

function updateFromStreamLine(line: string) {
  const state = getCollectorState();
  state.lastLogLine = line;

  try {
    const parsed = JSON.parse(line) as {
      level?: string;
      message?: string;
      data?: { message?: string };
    };

    if (parsed.level === "error") {
      state.state = "error";
      state.lastError = parsed.data?.message ?? parsed.message ?? line;
    }
  } catch {
    state.lastLogLine = line;
  }
}

function setManagedOverrideWindow(durationMs: number) {
  const state = getCollectorState();
  state.overrideUntil = new Date(Date.now() + durationMs).toISOString();
}

function hasActiveOverride(overrideUntil: string | null): boolean {
  if (!overrideUntil) {
    return false;
  }

  return new Date(overrideUntil).getTime() > Date.now();
}

function wireStream(stream: NodeJS.ReadableStream) {
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.trim()) {
        updateFromStreamLine(line.trim());
      }
    }
  });
}

export function getManagedCollectorStatus() {
  const state = getCollectorState();
  const running = state.state === "running" || state.state === "starting";

  return {
    state: state.state,
    running,
    pid: state.child?.pid ?? null,
    startedAt: state.startedAt,
    lastExitAt: state.lastExitAt,
    lastError: state.lastError,
    lastLogLine: state.lastLogLine,
    overrideActive: hasActiveOverride(state.overrideUntil)
  };
}

export function startManagedCollector() {
  const state = getCollectorState();
  if (state.child && !state.child.killed && state.state !== "stopping") {
    return getManagedCollectorStatus();
  }

  state.state = "starting";
  state.overrideUntil = null;

  const child = spawn(process.execPath, ["index.js"], {
    cwd: collectorWorkingDirectory(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });

  state.child = child;
  state.state = "running";
  state.startedAt = new Date().toISOString();
  state.lastExitAt = null;
  state.lastError = null;
  state.lastLogLine = null;

  wireStream(child.stdout);
  wireStream(child.stderr);

  child.on("close", (code, signal) => {
    const currentState = getCollectorState();
    currentState.lastExitAt = new Date().toISOString();
    currentState.lastLogLine = `collector exited with code ${code ?? "null"} signal ${signal ?? "null"}`;
    currentState.state =
      currentState.state === "stopping" || code === 0 ? "stopped" : "error";
    currentState.child = null;
    setManagedOverrideWindow(20_000);
  });

  child.on("error", (error) => {
    const currentState = getCollectorState();
    currentState.state = "error";
    currentState.lastError = error.message;
    currentState.lastLogLine = `collector spawn error: ${error.message}`;
    currentState.child = null;
    setManagedOverrideWindow(20_000);
  });

  return getManagedCollectorStatus();
}

export async function stopManagedCollector() {
  const state = getCollectorState();
  const child = state.child;

  if (!child) {
    state.state = "stopped";
    state.lastExitAt = new Date().toISOString();
    setManagedOverrideWindow(20_000);
    return getManagedCollectorStatus();
  }

  state.state = "stopping";
  setManagedOverrideWindow(20_000);

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (state.child) {
        try {
          state.child.kill("SIGKILL");
        } catch {
          // no-op
        }
      }
      resolve();
    }, 5000);

    child.once("close", () => {
      clearTimeout(timeout);
      resolve();
    });

    try {
      child.kill("SIGTERM");
    } catch {
      clearTimeout(timeout);
      resolve();
    }
  });

  state.child = null;
  state.state = "stopped";
  state.lastExitAt = new Date().toISOString();
  setManagedOverrideWindow(20_000);

  return getManagedCollectorStatus();
}
