import dotenv from "dotenv";

dotenv.config();

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const tsharkPath = process.env.TSHARK_PATH || "tshark";
export const interfaceIndex = process.env.INTERFACE_INDEX || "1";

export const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
export const mongoDbName = process.env.MONGODB_DB || "ids_record_tool";

export const settingsRefreshIntervalSec = toNumber(
  process.env.SETTINGS_REFRESH_INTERVAL_SEC,
  30
);

export const defaultRequestWindowSec = toNumber(process.env.REQUEST_WINDOW_SEC, 60);
export const defaultRequestThreshold = toNumber(process.env.REQUEST_THRESHOLD, 100);

export const defaultFailedConnectionWindowSec = toNumber(
  process.env.FAILED_CONNECTION_WINDOW_SEC,
  60
);
export const defaultFailedConnectionThreshold = toNumber(
  process.env.FAILED_CONNECTION_THRESHOLD,
  10
);

export const defaultSpikeWindowSec = toNumber(process.env.SPIKE_WINDOW_SEC, 60);
export const defaultSpikeBytesThreshold = toNumber(
  process.env.SPIKE_BYTES_THRESHOLD,
  5000000
);

export const defaultTopTalkersIntervalSec = toNumber(
  process.env.TOP_TALKERS_INTERVAL_SEC,
  30
);

export const defaultTopTalkersLimit = toNumber(
  process.env.TOP_TALKERS_LIMIT,
  10
);
