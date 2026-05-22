import { toInt, isoFromEpoch, toTimestampMs } from "../utils/helpers.js";

export function normalizePacket(fields) {
  const [
    epoch,
    srcIp,
    dstIp,
    tcpSrcPort,
    tcpDstPort,
    udpSrcPort,
    udpDstPort,
    protocol,
    frameLen,
    tcpSyn,
    tcpAck,
    tcpReset
  ] = fields;

  const srcPort = toInt(tcpSrcPort) ?? toInt(udpSrcPort);
  const dstPort = toInt(tcpDstPort) ?? toInt(udpDstPort);
  const tsMs = toTimestampMs(epoch);

  return {
    type: "TRAFFIC_FLOW",
    timestamp: isoFromEpoch(epoch),
    tsMs,
    srcIp: srcIp || null,
    dstIp: dstIp || null,
    srcPort,
    dstPort,
    protocol: protocol || null,
    bytes: toInt(frameLen) || 0,
    tcpFlags: {
      syn: toInt(tcpSyn) === 1,
      ack: toInt(tcpAck) === 1,
      rst: toInt(tcpReset) === 1
    },
    metadata: {}
  };
}
