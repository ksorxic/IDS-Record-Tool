export function logInfo(message, data = null) {
  console.log(
    JSON.stringify({
      level: "info",
      at: new Date().toISOString(),
      message,
      data
    })
  );
}

export function logError(message, data = null) {
  console.error(
    JSON.stringify({
      level: "error",
      at: new Date().toISOString(),
      message,
      data
    })
  );
}

export function logEvent(event) {
  console.log(JSON.stringify(event));
}