export function detectSuspiciousPort(event, state) {
  const suspiciousPorts = state.runtimeConfig.suspiciousPorts || [];

  if (!event.dstPort) return null;
  if (!suspiciousPorts.includes(event.dstPort)) return null;

  const alertKey = `suspicious-port:${event.srcIp || "unknown"}:${event.dstPort}`;
  if (!state.canEmitAlert(alertKey, event.tsMs, 60000)) {
    return null;
  }

  return {
    type: "SECURITY_ALERT",
    timestamp: new Date(event.tsMs).toISOString(),
    alertType: "SUSPICIOUS_PORT",
    severity: "medium",
    status: "open",
    srcIp: event.srcIp,
    dstIp: event.dstIp,
    title: "Ύποπτη χρήση θύρας",
    description: `Εντοπίστηκε επικοινωνία προς ύποπτη θύρα ${event.dstPort} από ${event.srcIp}.`,
    metadata: {
      dstPort: event.dstPort,
      protocol: event.protocol
    }
  };
}