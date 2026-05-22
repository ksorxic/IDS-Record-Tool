export function toInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function toTimestampMs(epochString) {
  if (!epochString) return Date.now();
  const num = Number(epochString);
  if (!Number.isFinite(num)) return Date.now();
  return Math.floor(num * 1000);
}

export function isoFromEpoch(epochString) {
  return new Date(toTimestampMs(epochString)).toISOString();
}

export function cleanupOldTimestamps(arr, minTs) {
  while (arr.length > 0 && arr[0] < minTs) {
    arr.shift();
  }
}

export function sumRecentEntries(entries, minTs) {
  let total = 0;
  while (entries.length > 0 && entries[0].ts < minTs) {
    entries.shift();
  }
  for (const entry of entries) {
    total += entry.value;
  }
  return total;
}