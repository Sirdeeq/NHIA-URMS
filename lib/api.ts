const BASE_URL = (process.env.VITE_API_URL as string) || "http://localhost:3001/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    const msg =
      json?.errors?.[0]?.msg || json?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json;
}

// ─── Annual Reports ───────────────────────────────────────────────────────────

export interface AnnualReportPayload {
  general: {
    year: string;
    state: string;
    staffNo: string;
    totalVehicles: string;
    totalHCF: string;
    totalAccreditedHCF2025: string;
    approvedBudget2025: string;
    totalAmountUtilized2025: string;
  };
  clinical: {
    totalAccreditedCEmONC: string;
    totalCEmONCBeneficiaries: string;
    totalAccreditedFFP: string;
    totalFFPBeneficiaries: string;
  };
  quarterly: Record<string, { q1: string; q2: string; q3: string; q4: string }>;
  status?: "draft" | "submitted";
  submitted_by?: string;
}

export const annualReportApi = {
  create: (payload: AnnualReportPayload) =>
    request<{ success: boolean; data: any }>("/annual-reports", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  saveDraft: (payload: AnnualReportPayload) =>
    request<{ success: boolean; data: any }>("/annual-reports", {
      method: "POST",
      body: JSON.stringify({ ...payload, status: "draft" }),
    }),

  update: (referenceId: string, payload: AnnualReportPayload) =>
    request<{ success: boolean; data: any }>(`/annual-reports/${referenceId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  list: (filters?: { state?: string; year?: string; status?: string }) => {
    const params = new URLSearchParams(
      Object.entries(filters || {}).filter(([, v]) => !!v) as [string, string][]
    ).toString();
    return request<{ success: boolean; data: any[] }>(
      `/annual-reports${params ? `?${params}` : ""}`
    );
  },

  get: (referenceId: string) =>
    request<{ success: boolean; data: any }>(`/annual-reports/${referenceId}`),

  updateStatus: (referenceId: string, status: string) =>
    request<{ success: boolean; data: any }>(`/annual-reports/${referenceId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  delete: (referenceId: string) =>
    request<{ success: boolean; message: string }>(`/annual-reports/${referenceId}`, {
      method: "DELETE",
    }),
};
