import axios from "axios";
import { apiEnabled, apiUrl } from "../config.js";
import { logError } from "../utils/logger.js";

export async function sendEvent(event) {
  if (!apiEnabled) return;

  try {
    await axios.post(apiUrl, event, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000
    });
  } catch (error) {
    logError("API send failed", {
      message: error.message,
      eventType: event.type,
      srcIp: event.srcIp,
      dstIp: event.dstIp
    });
  }
}