function isValidIpv4(ip) {
  return /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(
    String(ip || "").trim()
  );
}

function ipv4ToNumber(ip) {
  if (!isValidIpv4(ip)) {
    return null;
  }

  return ip
    .trim()
    .split(".")
    .reduce((acc, segment) => (acc << 8) + Number(segment), 0) >>> 0;
}

export function normalizeMonitoredRanges(docs) {
  return docs
    .map((doc) => {
      const startIp = String(doc.startIp || "").trim();
      const endIp = String(doc.endIp || "").trim();
      const startIpNumber = ipv4ToNumber(startIp);
      const endIpNumber = ipv4ToNumber(endIp);

      if (
        startIpNumber === null ||
        endIpNumber === null ||
        startIpNumber > endIpNumber
      ) {
        return null;
      }

      return {
        name: doc.name || "Unnamed range",
        startIp,
        endIp,
        startIpNumber,
        endIpNumber
      };
    })
    .filter(Boolean);
}

function ipMatchesRanges(ip, ranges) {
  const ipNumber = ipv4ToNumber(ip);
  if (ipNumber === null) {
    return false;
  }

  return ranges.some(
    (range) => ipNumber >= range.startIpNumber && ipNumber <= range.endIpNumber
  );
}

export function eventMatchesMonitoredRanges(event, ranges) {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return true;
  }

  return (
    (event.srcIp && ipMatchesRanges(event.srcIp, ranges)) ||
    (event.dstIp && ipMatchesRanges(event.dstIp, ranges))
  );
}
