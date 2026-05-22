import type { CollectorStatusResponse, DashboardData } from "@/lib/admin-types";

type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function assertSuccessfulResponse(
  response: Response
): Promise<void> {
  const payload = (await response.json()) as ApiResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Request failed");
  }
}

export async function fetchDashboardSnapshot(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard", {
    cache: "no-store"
  });
  const payload = (await response.json()) as ApiResponse<DashboardData>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Failed to fetch dashboard");
  }

  return payload.data;
}

export async function fetchCollectorStatusSnapshot(): Promise<CollectorStatusResponse> {
  const response = await fetch("/api/collector/status", {
    cache: "no-store"
  });
  const payload = (await response.json()) as ApiResponse<CollectorStatusResponse>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Failed to fetch collector status");
  }

  return payload.data;
}

export async function controlCollectorAction(
  action: "start" | "stop" | "restart"
): Promise<void> {
  const response = await fetch("/api/collector/control", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ action })
  });

  await assertSuccessfulResponse(response);
}
