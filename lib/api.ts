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

// ─── Stock Verification ───────────────────────────────────────────────────────

export const stockApi = {
  getZones: () =>
    request<{ success: boolean; data: any[] }>("/stock/zones"),

  getStates: (zoneId?: number | string) =>
    request<{ success: boolean; data: any[] }>(
      `/stock/states${zoneId ? `?zone_id=${zoneId}` : ""}`
    ),

  getDepartments: (stateId?: number | string) =>
    request<{ success: boolean; data: any[] }>(
      `/stock/departments${stateId ? `?state_id=${stateId}` : ""}`
    ),

  getUnits: (departmentId?: number | string) =>
    request<{ success: boolean; data: any[] }>(
      `/stock/units${departmentId ? `?department_id=${departmentId}` : ""}`
    ),

  getAssets: (stateId?: number | string, unitId?: number | string) => {
    const params = new URLSearchParams();
    if (stateId) params.set("state_id", String(stateId));
    if (unitId)  params.set("unit_id",  String(unitId));
    const qs = params.toString();
    return request<{ success: boolean; data: any[] }>(`/stock/assets${qs ? `?${qs}` : ""}`);
  },

  createAsset: (payload: any) =>
    request<{ success: boolean; data: any }>("/stock/assets", {
      method: "POST", body: JSON.stringify(payload),
    }),

  updateAsset: (id: number | string, payload: any) =>
    request<{ success: boolean; data: any }>(`/stock/assets/${id}`, {
      method: "PUT", body: JSON.stringify(payload),
    }),

  deleteAsset: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/stock/assets/${id}`, {
      method: "DELETE",
    }),

  listVerifications: (filters?: { zone_id?: string; state_id?: string; status?: string; type?: string }) => {
    const params = new URLSearchParams(
      Object.entries(filters || {}).filter(([, v]) => !!v) as [string, string][]
    ).toString();
    return request<{ success: boolean; data: any[] }>(
      `/stock/verifications${params ? `?${params}` : ""}`
    );
  },

  getVerification: (id: number | string) =>
    request<{ success: boolean; data: any }>(`/stock/verifications/${id}`),

  createVerification: (payload: any) =>
    request<{ success: boolean; data: any }>("/stock/verifications", {
      method: "POST", body: JSON.stringify(payload),
    }),

  updateVerification: (id: number | string, payload: any) =>
    request<{ success: boolean; data: any }>(`/stock/verifications/${id}`, {
      method: "PUT", body: JSON.stringify(payload),
    }),

  updateStatus: (id: number | string, status: string) =>
    request<{ success: boolean; data: any }>(`/stock/verifications/${id}/status`, {
      method: "PATCH", body: JSON.stringify({ status }),
    }),
};

// ─── Monthly Reports ──────────────────────────────────────────────────────────

export type MonthlyDept = "finance" | "programmes" | "sqa";

const monthlyBase = (dept: MonthlyDept) => `/monthly/${dept}`;

const makeDeptApi = (dept: MonthlyDept) => ({
  list: (filters?: { state_id?: string; year?: string; month?: string; status?: string; section?: string }) => {
    const p = new URLSearchParams(Object.entries(filters || {}).filter(([,v]) => !!v) as [string,string][]).toString();
    return request<{ success: boolean; data: any[] }>(`${monthlyBase(dept)}${p ? `?${p}` : ""}`);
  },
  aggregate: (state_id: string, year: string) =>
    request<{ success: boolean; data: any[] }>(`${monthlyBase(dept)}/aggregate?state_id=${state_id}&year=${year}`),
  get: (id: number | string) =>
    request<{ success: boolean; data: any }>(`${monthlyBase(dept)}/${id}`),
  create: (payload: any) =>
    request<{ success: boolean; data: any }>(monthlyBase(dept), { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number | string, payload: any) =>
    request<{ success: boolean; data: any }>(`${monthlyBase(dept)}/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  updateStatus: (id: number | string, status: string) =>
    request<{ success: boolean; data: any }>(`${monthlyBase(dept)}/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
});

export const monthlyApi = {
  finance:    makeDeptApi("finance"),
  programmes: makeDeptApi("programmes"),
  sqa:        makeDeptApi("sqa"),
};
