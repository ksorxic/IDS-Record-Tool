import { cleanupOldTimestamps } from "../utils/helpers.js";

const CONNECTION_ATTEMPT_TIMEOUT_MS = 10_000;

function isTcpEvent(event) {
  return (event.protocol ?? "").toUpperCase() === "TCP";
}

export function detectFailedConnections(event, state) {
  const config = state.runtimeConfig.failedConnectionRule;

  if (!config?.enabled) return null;
  if (!event.tsMs || !event.srcIp || !event.dstIp) return null;
  if (!event.srcPort || !event.dstPort || !isTcpEvent(event)) return null;

  state.cleanupPendingConnections(event.tsMs - CONNECTION_ATTEMPT_TIMEOUT_MS);

  const flags = event.tcpFlags ?? {
    syn: false,
    ack: false,
    rst: false
  };

  if (flags.syn && !flags.ack && !flags.rst) {
    const attemptKey = state.buildConnectionAttemptKey(
      event.srcIp,
      event.srcPort,
      event.dstIp,
      event.dstPort
    );
    state.setPendingConnection(attemptKey, {
      tsMs: event.tsMs,
      srcIp: event.srcIp,
      srcPort: event.srcPort,
      dstIp: event.dstIp,
      dstPort: event.dstPort
    });
    return null;
  }

  const reverseAttemptKey = state.buildConnectionAttemptKey(
    event.dstIp,
    event.dstPort,
    event.srcIp,
    event.srcPort
  );
  const pendingAttempt = state.getPendingConnection(reverseAttemptKey);

  if (!pendingAttempt) {
    return null;
  }

  if (flags.syn && flags.ack && !flags.rst) {
    state.clearPendingConnection(reverseAttemptKey);
    return null;
  }

  if (!flags.rst) {
    return null;
  }

  state.clearPendingConnection(reverseAttemptKey);

  const failedWindow = state.getFailedConnectionWindow(pendingAttempt.srcIp);
  const minTs = event.tsMs - config.windowSec * 1000;

  failedWindow.push(event.tsMs);
  cleanupOldTimestamps(failedWindow, minTs);

  if (failedWindow.length <= config.threshold) {
    return null;
  }

  const alertKey = `failed-connections:${pendingAttempt.srcIp}`;
  if (!state.canEmitAlert(alertKey, event.tsMs, 30_000)) {
    return null;
  }

  return {
    type: "SECURITY_ALERT",
    timestamp: new Date(event.tsMs).toISOString(),
    alertType: "FAILED_CONNECTIONS",
    severity: "high",
    status: "open",
    srcIp: pendingAttempt.srcIp,
    dstIp: pendingAttempt.dstIp,
    title: "Πολλαπλές αποτυχημένες συνδέσεις",
    description: `Η IP ${pendingAttempt.srcIp} προκάλεσε ${failedWindow.length} αποτυχημένες TCP συνδέσεις προς ${pendingAttempt.dstIp}:${pendingAttempt.dstPort} σε ${config.windowSec} δευτερόλεπτα.`,
    metadata: {
      count: failedWindow.length,
      windowSec: config.windowSec,
      threshold: config.threshold,
      dstPort: pendingAttempt.dstPort
    }
  };
}
