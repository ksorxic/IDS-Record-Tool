export function registerTopTalkerTraffic(event, state) {
  if (!event.srcIp) return;
  state.incrementTotalBytes(event.srcIp, event.bytes || 0);
}

export function createTopTalkersSnapshot(state) {
  const limit = state.runtimeConfig.topTalkers?.limit || 10;

  const items = Array.from(state.totalBytesByIp.entries())
    .map(([ip, totalBytes]) => ({ ip, totalBytes }))
    .sort((a, b) => b.totalBytes - a.totalBytes)
    .slice(0, limit);

  return {
    type: "TOP_TALKER_SNAPSHOT",
    timestamp: new Date().toISOString(),
    title: "Top talkers snapshot",
    metadata: {
      intervalSec: state.runtimeConfig.topTalkers?.intervalSec || 30,
      limit,
      items
    }
  };
}