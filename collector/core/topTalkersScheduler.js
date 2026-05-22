import { logInfo, logError, logEvent } from "../utils/logger.js";
import { createTopTalkersSnapshot } from "../detectors/topTalkers.js";

export class TopTalkersScheduler {
  constructor(state, writer) {
    this.state = state;
    this.writer = writer;
    this.timer = null;
    this.currentIntervalSec = null;
  }

  start() {
    this.rescheduleIfNeeded();
  }

  async emitSnapshot() {
    try {
      const snapshot = createTopTalkersSnapshot(this.state);
      logEvent(snapshot);
      await this.writer.addTopTalkerSnapshot(snapshot);
      this.state.resetTopTalkersTotals();
    } catch (error) {
      logError("Top talkers snapshot failed", {
        message: error.message
      });
    }
  }

  rescheduleIfNeeded() {
    const nextIntervalSec = this.state.runtimeConfig.topTalkers?.intervalSec || 30;

    if (this.currentIntervalSec === nextIntervalSec && this.timer) {
      return;
    }

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.currentIntervalSec = nextIntervalSec;

    this.timer = setInterval(() => {
      this.emitSnapshot().catch((error) => {
        logError("Top talkers scheduled emit failed", {
          message: error.message
        });
      });
    }, nextIntervalSec * 1000);

    logInfo("TopTalkersScheduler rescheduled", {
      intervalSec: nextIntervalSec
    });
  }

  async stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    await this.emitSnapshot();
  }
}