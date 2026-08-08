export type ReportScope = "national" | "zonal" | "state" | "none";

const NATIONAL_ROLES = new Set(["admin", "sdo", "hq-department", "dg-ceo"]);

/** Uses role.report_scope from login (roles table). */
export function resolveReportScope(
  role: string,
  user?: { role_config?: { report_scope?: string } } | null,
): ReportScope {
  const fromDb = user?.role_config?.report_scope;
  if (fromDb === "national" || fromDb === "zonal" || fromDb === "state") {
    return fromDb;
  }
  if (NATIONAL_ROLES.has(role)) return "national";
  // Stale session without role_config — infer from role key
  if (["state-coordinator", "state-officer", "department-officer"].includes(role)) return "state";
  if (["zonal-coordinator", "zonal-officer"].includes(role)) return "zonal";
  return "none";
}

function userGeoIds(user?: {
  state_id?: number;
  zone_id?: number;
  state?: { id?: number; zonal_id?: number };
  zone?: { id?: number };
} | null) {
  const stateId = user?.state_id ?? user?.state?.id ?? null;
  const zoneId = user?.zone_id ?? user?.zone?.id ?? user?.state?.zonal_id ?? null;
  return { stateId, zoneId };
}

/** Zone/state defaults for locked dropdowns and list filters. */
export function getGeoScopeDefaults(
  role: string,
  user?: {
    state_id?: number;
    zone_id?: number;
    state?: { id?: number; zonal_id?: number };
    zone?: { id?: number };
    role_config?: { report_scope?: string };
  } | null,
) {
  const reportScope = resolveReportScope(role, user);
  const { stateId, zoneId } = userGeoIds(user);

  if (reportScope === "state" && stateId) {
    return {
      reportScope,
      defaultStateId: String(stateId),
      defaultZoneId: zoneId ? String(zoneId) : null,
    };
  }

  if (reportScope === "zonal" && zoneId) {
    return {
      reportScope,
      defaultStateId: null,
      defaultZoneId: String(zoneId),
    };
  }

  return {
    reportScope,
    defaultStateId: null,
    defaultZoneId: null,
  };
}

/** Shared props for zone/state dropdowns on list and form pages. */
export type GeoScopeProps = {
  defaultZoneId?: string | null;
  defaultStateId?: string | null;
  reportScope?: ReportScope;
};
