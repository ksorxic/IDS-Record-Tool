import { connectMongo, getDb } from "./core/mongo.js";
import { startSettingsRefresh } from "./core/settingsLoader.js";
import { startTshark } from "./core/tsharkRunner.js";
import { normalizePacket } from "./core/parser.js";
import { CollectorState } from "./core/state.js";
import { BufferedWriter } from "./core/bufferedWriter.js";
import { TopTalkersScheduler } from "./core/topTalkersScheduler.js";
import { RuntimeMonitor } from "./core/runtimeMonitor.js";
import { eventMatchesMonitoredRanges } from "./core/monitoredRanges.js";
import { logEvent, logInfo, logError } from "./utils/logger.js";

import { detectRequestFlood } from "./detectors/requestFloodDetector.js";
import { detectFailedConnections } from "./detectors/failedConnectionDetector.js";
import { detectSuspiciousPort } from "./detectors/suspiciousPortDetector.js";
import { detectTrafficSpike } from "./detectors/trafficSpikeDetector.js";
import { detectBlacklistHit } from "./detectors/blacklistDetector.js";
import { registerTopTalkerTraffic } from "./detectors/topTalkers.js";

const state = new CollectorState();
const writer = new BufferedWriter();
const topTalkersScheduler = new TopTalkersScheduler(state, writer);
const runtimeMonitor = new RuntimeMonitor(state);

async function processTrafficEvent(event) {
  runtimeMonitor.recordTrafficEvent(event);
  logEvent(event);
  await writer.addTrafficEvent(event);

  registerTopTalkerTraffic(event, state);

  const alerts = [
    detectRequestFlood(event, state),
    detectFailedConnections(event, state),
    detectSuspiciousPort(event, state),
    detectTrafficSpike(event, state),
    detectBlacklistHit(event, state)
  ].filter(Boolean);

  for (const alertEvent of alerts) {
    runtimeMonitor.recordAlert(alertEvent);
    logEvent(alertEvent);
    await writer.addSecurityAlert(alertEvent);
  }
}

function handleLine(line) {
  try {
    const fields = line.split("\t");
    const event = normalizePacket(fields);

    if (!event.srcIp || !event.dstIp) return;
    if (!eventMatchesMonitoredRanges(event, state.runtimeConfig.monitoredRanges)) {
      return;
    }

    processTrafficEvent(event).catch((error) => {
      logError("processTrafficEvent failed", { message: error.message });
    });
  } catch (error) {
    logError("Failed to parse tshark line", {
      message: error.message,
      raw: line
    });
  }
}

async function main() {
  logInfo("Collector booting");

  await connectMongo();

  writer.start();
  topTalkersScheduler.start();
  await runtimeMonitor.start();

  await startSettingsRefresh(state, getDb(), async () => {
    topTalkersScheduler.rescheduleIfNeeded();
  });

  startTshark(handleLine);

  process.on("SIGINT", async () => {
    logInfo("SIGINT received, flushing buffers");
    await topTalkersScheduler.stop();
    await writer.flushAll();
    await runtimeMonitor.stop("stopped");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    logInfo("SIGTERM received, flushing buffers");
    await topTalkersScheduler.stop();
    await writer.flushAll();
    await runtimeMonitor.stop("stopped");
    process.exit(0);
  });
}

main().catch((error) => {
  runtimeMonitor.fail(error.message).catch(() => {
    // no-op
  });
  logError("Collector startup failed", { message: error.message });
});
