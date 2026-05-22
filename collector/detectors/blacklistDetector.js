export function detectBlacklistHit(event, state) {
  const blacklistSet = state.runtimeConfig.blacklistSet || new Set();

  const hitSrc = event.srcIp && blacklistSet.has(event.srcIp);
  const hitDst = event.dstIp && blacklistSet.has(event.dstIp);

  if (!hitSrc && !hitDst) return null;

  const matchedIp = hitSrc ? event.srcIp : event.dstIp;
  const alertKey = `blacklist:${matchedIp}`;
  if (!state.canEmitAlert(alertKey, event.tsMs, 60000)) {
    return null;
  }

  return {
    type: "SECURITY_ALERT",
    timestamp: new Date(event.tsMs).toISOString(),
    alertType: "BLACKLIST_IP",
    severity: "critical",
    status: "open",
    srcIp: event.srcIp,
    dstIp: event.dstIp,
    title: "Επικοινωνία με blacklisted IP",
    description: `Εντοπίστηκε επικοινωνία με blacklisted IP: ${matchedIp}.`,
    metadata: {
      matchedIp
    }
  };
}