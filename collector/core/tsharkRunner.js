import { spawn, spawnSync } from "child_process";
import { tsharkPath, interfaceIndex } from "../config.js";
import { logInfo, logError } from "../utils/logger.js";

function classifyTsharkStderr(message) {
  const normalized = message.trim();

  if (!normalized) {
    return "ignore";
  }

  const informationalPrefixes = [
    "Capturing on",
    "File:",
    "Packets:",
    "Capture started",
    "Running as user"
  ];

  if (informationalPrefixes.some((prefix) => normalized.startsWith(prefix))) {
    return "info";
  }

  return "error";
}

function parseInterfaces(rawOutput) {
  return rawOutput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\.\s+([^\(]+?)(?:\s+\((.+)\))?$/);

      if (!match) {
        return null;
      }

      return {
        index: match[1],
        device: match[2].trim(),
        label: (match[3] || "").trim()
      };
    })
    .filter(Boolean);
}

function isPreferredPhysicalLabel(label) {
  return /(ethernet|wi-?fi|wlan|802\.11)/i.test(label);
}

function isLikelyVirtualLabel(label) {
  return /(τοπική σύνδεση\*|local connection\*|vethernet|loopback|bluetooth|etw)/i.test(
    label
  );
}

function resolveCaptureInterface() {
  const configuredValue = String(interfaceIndex || "").trim();
  const listResult = spawnSync(tsharkPath, ["-D"], {
    encoding: "utf8",
    windowsHide: true
  });

  if (listResult.error) {
    logError("Failed to list tshark interfaces", {
      message: listResult.error.message
    });
    return {
      target: configuredValue || "1",
      label: null
    };
  }

  const interfaces = parseInterfaces(listResult.stdout || "");
  const preferredPhysical = interfaces.find((item) =>
    isPreferredPhysicalLabel(item.label || item.device)
  );

  if (!configuredValue || configuredValue.toLowerCase() === "auto") {
    return {
      target: preferredPhysical?.index || "1",
      label: preferredPhysical?.label || preferredPhysical?.device || null
    };
  }

  const configuredInterface =
    interfaces.find((item) => item.index === configuredValue) ||
    interfaces.find(
      (item) =>
        item.device === configuredValue ||
        item.label === configuredValue
    );

  if (
    configuredInterface &&
    isLikelyVirtualLabel(configuredInterface.label || configuredInterface.device) &&
    preferredPhysical
  ) {
    logInfo("Configured tshark interface looks virtual, using physical fallback", {
      configuredValue,
      configuredLabel: configuredInterface.label || configuredInterface.device,
      fallbackIndex: preferredPhysical.index,
      fallbackLabel: preferredPhysical.label || preferredPhysical.device
    });

    return {
      target: preferredPhysical.index,
      label: preferredPhysical.label || preferredPhysical.device
    };
  }

  return {
    target: configuredValue,
    label: configuredInterface?.label || configuredInterface?.device || null
  };
}

export function startTshark(onLine) {
  const resolvedInterface = resolveCaptureInterface();
  const args = [
    "-l",
    "-n",
    "-i",
    resolvedInterface.target,
    "-f",
    "ip and (tcp or udp)",
    "-T",
    "fields",
    "-E",
    "separator=\t",
    "-e",
    "frame.time_epoch",
    "-e",
    "ip.src",
    "-e",
    "ip.dst",
    "-e",
    "tcp.srcport",
    "-e",
    "tcp.dstport",
    "-e",
    "udp.srcport",
    "-e",
    "udp.dstport",
    "-e",
    "_ws.col.Protocol",
    "-e",
    "frame.len",
    "-e",
    "tcp.flags.syn",
    "-e",
    "tcp.flags.ack",
    "-e",
    "tcp.flags.reset"
  ];

  logInfo("Starting tshark", {
    tsharkPath,
    interfaceIndex,
    resolvedInterface,
    args
  });

  const proc = spawn(tsharkPath, args);
  let buffer = "";

  proc.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) onLine(line);
    }
  });

  proc.stderr.on("data", (data) => {
    const message = data.toString().trim();
    if (message) {
      const severity = classifyTsharkStderr(message);

      if (severity === "info") {
        logInfo("tshark status", { message });
        return;
      }

      if (severity === "error") {
        logError("tshark stderr", { message });
      }
    }
  });

  proc.on("close", (code) => {
    logError("tshark closed", { code });
    setTimeout(() => startTshark(onLine), 5000);
  });

  proc.on("error", (error) => {
    logError("tshark spawn error", { message: error.message });
  });

  return proc;
}
