import { getGeoScopeDefaults } from "./reportScopeAccess";

export function getMonthlyReportContext(role: string, user?: {
  state_id?: number;
  zone_id?: number;
  role_config?: { report_scope?: string; can_create_monthly?: boolean };
} | null) {
  const geo = getGeoScopeDefaults(role, user);
  const canCreate = user?.role_config?.can_create_monthly
    ?? ["state-officer", "state-coordinator", "department-officer", "admin"].includes(role);
  return {
    defaultStateId: geo.defaultStateId,
    defaultZoneId: geo.defaultZoneId,
    reportScope: geo.reportScope,
    canCreateMonthly: canCreate,
  };
}

export function getStateOfficeContext(role: string, user?: {
  state_id?: number;
  zone_id?: number;
  role_config?: { report_scope?: string };
} | null) {
  return getGeoScopeDefaults(role, user);
}
