import { sumRecentEntries } from "../utils/helpers.js";

export function detectTrafficSpike(event, state) {
  const config = state.runtimeConfig.trafficSpikeRule;

  if (!config?.enabled) return null;
  if (!event.srcIp || !event.tsMs) return null;

  const window = state.getBytesWindow(event.srcIp);
  const minTs = event.tsMs - config.windowSec * 1000;

  window.push({ ts: event.tsMs, value: event.bytes || 0 });
  const totalBytes = sumRecentEntries(window, minTs);

  if (totalBytes > config.bytesThreshold) {
    const alertKey = `traffic-spike:${event.srcIp}`;
    if (!state.canEmitAlert(alertKey, event.tsMs, 30000)) {
      return null;
    }

    return {
      type: "SECURITY_ALERT",
      timestamp: new Date(event.tsMs).toISOString(),
      alertType: "TRAFFIC_SPIKE",
      severity: "high",
      status: "open",
      srcIp: event.srcIp,
      dstIp: event.dstIp,
      title: "Sudden increase in network traffic",
      description: `IP ${event.srcIp} generated ${totalBytes} bytes in ${config.windowSec} seconds.`,
      metadata: {
        bytes: totalBytes,
        windowSec: config.windowSec,
        threshold: config.bytesThreshold
      }
    };
  }

  return null;
}