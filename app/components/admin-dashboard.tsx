"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { LayoutDashboard } from "lucide-react";
import type { CollectorStatusResponse, DashboardData } from "@/lib/admin-types";
import { useAppToast } from "@/app/components/app-toast-provider";
import TrafficCompositionHelper from "@/app/components/modals/traffic-composition-helper";
import SummaryCards from "./sections/dashboard/summaryCards";
import CollectorControlSection from "./sections/dashboard/collector-control-section";
import LiveMaliciousFindings from "./sections/dashboard/live-malicious-findings";
import SettingsShortcutCard from "./sections/dashboard/settings-shortcut-card";
import NetworkOverviewCards from "./sections/dashboard/network-overview-cards";
import LiveThroughputSection from "./sections/dashboard/live-throughput-section";
import SeverityMixSection from "./sections/dashboard/severity-mix-section";
import TrafficCompositionSection from "./sections/dashboard/traffic-composition-section";
import LatestAlertsSection from "./sections/dashboard/latest-alerts-section";
import RecentFlowsSection from "./sections/dashboard/recent-flows-section";
import TopTalkersSection from "./sections/dashboard/top-talkers-section";
import {
  buildHealthyStateLabel,
  buildNetworkOverview,
  countActiveAlerts,
  formatTimestamp,
  isCollectorActuallyRunning,
  type BrowserNotificationPermissionState,
  type CollectorActionState
} from "@/lib/dashboard-client";
import {
  controlCollectorAction,
  fetchCollectorStatusSnapshot,
  fetchDashboardSnapshot
} from "@/lib/calls/dashboard";

type AdminDashboardProps = {
  initialData: DashboardData;
};

export default function AdminDashboard({ initialData }: AdminDashboardProps) {
  const [dashboard, setDashboard] = useState(initialData);
  const [collectorStatus, setCollectorStatus] =
    useState<CollectorStatusResponse | null>(null);
  const [isTrafficHelpOpen, setIsTrafficHelpOpen] = useState(false);
  const [collectorActionState, setCollectorActionState] =
    useState<CollectorActionState>("idle");
  const [isPending, runTransition] = useTransition();
  const liveAlertIdRef = useRef<string | null>(null);
  const collectorErrorRef = useRef<string | null>(null);
  const { showToast } = useAppToast();
  const hasMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const notificationsSupported = useSyncExternalStore(
    () => () => undefined,
    () => (typeof window !== "undefined" ? "Notification" in window : false),
    () => false
  );

  const collectorRunning = useMemo(
    () => isCollectorActuallyRunning(collectorStatus),
    [collectorStatus]
  );
  const latestMaliciousAlert = collectorStatus?.latestMaliciousAlert ?? null;
  const liveTraffic = dashboard.liveTraffic;
  const effectiveNotificationPermission: BrowserNotificationPermissionState =
    notificationsSupported &&
    typeof window !== "undefined" &&
    "Notification" in window
      ? Notification.permission
      : "unsupported";

  const healthyStateLabel = useMemo(
    () => buildHealthyStateLabel(dashboard.connectionStatus),
    [dashboard.connectionStatus]
  );
  const activeAlertCount = useMemo(
    () => countActiveAlerts(dashboard.alerts),
    [dashboard.alerts]
  );
  const networkOverview = useMemo(
    () => buildNetworkOverview(dashboard),
    [dashboard]
  );
  const collectorVisualState = useMemo(() => {
    if (collectorActionState === "stopping") {
      return "stopping";
    }

    if (
      collectorActionState === "starting" ||
      collectorActionState === "restarting"
    ) {
      return "starting";
    }

    return collectorStatus?.managedProcess.state ??
      (collectorRunning ? "running" : "stopped");
  }, [collectorActionState, collectorRunning, collectorStatus?.managedProcess.state]);
  const collectorStateLabel = useMemo(() => {
    switch (collectorVisualState) {
      case "starting":
        return "starting";
      case "stopping":
        return "stopping";
      case "running":
        return "running";
      case "error":
        return "error";
      default:
        return "stopped";
    }
  }, [collectorVisualState]);

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboardData() {
      try {
        const data = await fetchDashboardSnapshot();

        if (!isCancelled) {
          setDashboard(data);
        }
      } catch {
        // no-op
      }
    }

    async function loadCollectorStatus() {
      try {
        const data = await fetchCollectorStatusSnapshot();

        if (!isCancelled) {
          const nextAlert = data.latestMaliciousAlert;
          if (nextAlert?.timestamp) {
            const nextAlertId = [
              nextAlert.alertType,
              nextAlert.srcIp,
              nextAlert.dstIp,
              nextAlert.timestamp
            ].join(":");

            if (liveAlertIdRef.current !== nextAlertId) {
              liveAlertIdRef.current = nextAlertId;
              showToast(
                "warning",
                `New malicious alert: ${nextAlert.alertType ?? "UNKNOWN"} at ${formatTimestamp(nextAlert.timestamp)}.`
              );

              if (
                notificationsSupported &&
                effectiveNotificationPermission === "granted" &&
                "Notification" in window
              ) {
                const notification = new Notification(
                  nextAlert.title ?? "New malicious alert",
                  {
                    body:
                      nextAlert.description ??
                      `${nextAlert.srcIp ?? "unknown"} -> ${nextAlert.dstIp ?? "unknown"}`
                  }
                );

                window.setTimeout(() => notification.close(), 6000);
              }
            }
          }

          setCollectorActionState("idle");
          setCollectorStatus(data);
        }
      } catch {
        if (!isCancelled) {
          setCollectorActionState("idle");
          setCollectorStatus(null);
        }
      }
    }

    void loadDashboardData();
    void loadCollectorStatus();
    const dashboardInterval = window.setInterval(() => {
      void loadDashboardData();
    }, 2000);
    const collectorInterval = window.setInterval(() => {
      void loadCollectorStatus();
    }, 2000);

    return () => {
      isCancelled = true;
      window.clearInterval(dashboardInterval);
      window.clearInterval(collectorInterval);
    };
  }, [effectiveNotificationPermission, notificationsSupported, showToast]);

  async function controlCollector(action: "start" | "stop" | "restart") {
    setCollectorActionState(
      action === "restart"
        ? "restarting"
        : action === "stop"
          ? "stopping"
          : "starting"
    );

    if (action === "stop") {
      showToast(
        "info",
        "The scan has stopped. Awaiting termination confirmation from the collector..."
      );
    }

    await controlCollectorAction(action);
    const status = await fetchCollectorStatusSnapshot();
    setCollectorStatus(status);
    setCollectorActionState("idle");

    if (action === "start") {
      showToast("success", "The scan has started.");
    } else if (action === "stop") {
      showToast("success", "The scan has stopped.");
    } else {
      showToast("success", "The collector has been restarted.");
    }
  }

  function handleAsync(action: () => Promise<void>) {
    runTransition(() => {
      void action().catch((cause) => {
        setCollectorActionState("idle");
        showToast(
          "error",
          cause instanceof Error
            ? cause.message
            : "An error occurred while saving."
        );
      });
    });
  }

  useEffect(() => {
    const nextError = collectorStatus?.managedProcess.lastError ?? null;

    if (!nextError || collectorErrorRef.current === nextError) {
      return;
    }

    collectorErrorRef.current = nextError;
    showToast("error", `Collector error: ${nextError}`);
  }, [collectorStatus?.managedProcess.lastError, showToast]);

  return (
    <main className="flex-1 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {isTrafficHelpOpen && (
          <TrafficCompositionHelper
            closeModal={() => setIsTrafficHelpOpen(false)}
          />
        )}

        <section className="px-1 py-2 sm:px-0 sm:py-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-600">
            <LayoutDashboard className="h-4 w-4" />
            IDS Dashboard
          </div>
        </section>

        <SummaryCards {...dashboard} />

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <CollectorControlSection
            collectorActionState={collectorActionState}
            collectorRunning={collectorRunning}
            collectorStateLabel={collectorStateLabel}
            collectorVisualState={collectorVisualState}
            collectorStatus={collectorStatus}
            activeAlertCount={activeAlertCount}
            dashboardConnectionStatus={dashboard.connectionStatus}
            healthyStateLabel={healthyStateLabel}
            appliedRangesCount={
              collectorStatus?.runtime?.monitoredRangeCount ??
              dashboard.monitoredRanges.filter((item) => item.enabled).length
            }
            isPending={isPending}
            onStart={() => handleAsync(() => controlCollector("start"))}
            onStop={() => handleAsync(() => controlCollector("stop"))}
            onRestart={() => handleAsync(() => controlCollector("restart"))}
          />

          <div className="grid gap-6">
            <LiveMaliciousFindings latestMaliciousAlert={latestMaliciousAlert} />
            <SettingsShortcutCard />
          </div>
        </section>

        <NetworkOverviewCards networkOverview={networkOverview} />

        <section id="reports" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <LiveThroughputSection
            hasMounted={hasMounted}
            isCollectorActive={collectorVisualState === "running"}
            liveTraffic={liveTraffic}
          />
          <SeverityMixSection
            alertsBySeverity={dashboard.alertsBySeverity}
            hasMounted={hasMounted}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <TrafficCompositionSection
            trafficByProtocol={dashboard.trafficByProtocol}
            onOpenHelp={() => setIsTrafficHelpOpen(true)}
          />
          <LatestAlertsSection alerts={dashboard.alerts} />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <RecentFlowsSection trafficEvents={dashboard.trafficEvents} />
          <TopTalkersSection topTalkers={dashboard.topTalkers} />
        </section>
      </div>
    </main>
  );
}
