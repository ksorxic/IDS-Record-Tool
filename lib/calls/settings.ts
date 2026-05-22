import type {
  BlacklistEntry,
  DashboardData,
  DetectionRule,
  MonitoredRange
} from "@/lib/admin-types";
import type {
  BlacklistForm,
  MonitoredRangeForm,
  RuleForm
} from "@/lib/settings-forms";

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

export async function saveMonitoredRange(
  form: MonitoredRangeForm
): Promise<MonitoredRange> {
  const payload = {
    name: form.name,
    startIp: form.startIp,
    endIp: form.endIp,
    description: form.description,
    protocolScope: form.protocolScope,
    inspectionProfile: form.inspectionProfile,
    enabled: form.enabled
  };
  const endpoint = form.id
    ? `/api/monitored-ranges/${form.id}`
    : "/api/monitored-ranges";
  const method = form.id ? "PUT" : "POST";

  const response = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  await assertSuccessfulResponse(response);

  const now = new Date().toISOString();

  return {
    _id: form.id ?? crypto.randomUUID(),
    ...payload,
    createdAt: now,
    updatedAt: now
  };
}

export async function deleteMonitoredRange(id: string): Promise<void> {
  const response = await fetch(`/api/monitored-ranges/${id}`, {
    method: "DELETE"
  });

  await assertSuccessfulResponse(response);
}

export async function saveBlacklistEntry(
  form: BlacklistForm
): Promise<BlacklistEntry> {
  const payload = {
    ip: form.ip,
    reason: form.reason,
    source: form.source,
    active: form.active
  };
  const endpoint = form.id ? `/api/blacklist-ips/${form.id}` : "/api/blacklist-ips";
  const method = form.id ? "PUT" : "POST";

  const response = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  await assertSuccessfulResponse(response);

  const now = new Date().toISOString();

  return {
    _id: form.id ?? crypto.randomUUID(),
    ...payload,
    createdAt: now,
    updatedAt: now
  };
}

export async function deleteBlacklistEntry(id: string): Promise<void> {
  const response = await fetch(`/api/blacklist-ips/${id}`, {
    method: "DELETE"
  });

  await assertSuccessfulResponse(response);
}

export async function saveDetectionRule(form: RuleForm): Promise<DetectionRule> {
  const payload = {
    name: form.name,
    type: form.type,
    description: form.description,
    threshold: form.threshold ? Number(form.threshold) : undefined,
    windowMinutes: form.windowMinutes
      ? Number(form.windowMinutes)
      : undefined,
    enabled: form.enabled
  };
  const endpoint = form.id ? `/api/rules/${form.id}` : "/api/rules";
  const method = form.id ? "PUT" : "POST";

  const response = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  await assertSuccessfulResponse(response);

  const now = new Date().toISOString();

  return {
    _id: form.id ?? crypto.randomUUID(),
    name: payload.name,
    type: payload.type,
    description: payload.description,
    threshold: payload.threshold,
    windowMinutes: payload.windowMinutes,
    enabled: payload.enabled,
    createdAt: now,
    updatedAt: now
  };
}

export async function deleteDetectionRule(id: string): Promise<void> {
  const response = await fetch(`/api/rules/${id}`, {
    method: "DELETE"
  });

  await assertSuccessfulResponse(response);
}
