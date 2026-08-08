import * as React from "react";
import { stockApi } from "@/lib/api";
import type { ReportScope } from "@/src/access/reportScopeAccess";

export const ALL_GEO = "all";

export type GeoZone = { id: number; description: string; zonal_code?: string };
export type GeoState = { id: number; description: string };

export interface UseGeoFiltersOptions {
  defaultZoneId?: string | null;
  defaultStateId?: string | null;
  reportScope?: ReportScope;
  /** Filter lists: allow "All zones/states". Forms: require explicit selection. */
  filterMode?: boolean;
}

export function useGeoFilters({
  defaultZoneId,
  defaultStateId,
  reportScope = "national",
  filterMode = true,
}: UseGeoFiltersOptions) {
  const lockZone = reportScope === "zonal" || reportScope === "state";
  const lockState = reportScope === "state";

  const initialZone = lockZone && defaultZoneId ? defaultZoneId : (defaultZoneId ?? ALL_GEO);
  const initialState = lockState && defaultStateId ? defaultStateId : (defaultStateId ?? ALL_GEO);

  const [zones, setZones] = React.useState<GeoZone[]>([]);
  const [states, setStates] = React.useState<GeoState[]>([]);
  const [zoneId, setZoneId] = React.useState(
    filterMode ? initialZone : (defaultZoneId ?? ""),
  );
  const [stateId, setStateId] = React.useState(
    filterMode ? initialState : (defaultStateId ?? ""),
  );

  React.useEffect(() => {
    stockApi.getZones().then((r) => setZones(r.data)).catch(() => setZones([]));
  }, []);

  const statesQueryZone = React.useMemo(() => {
    if (lockZone && defaultZoneId) return defaultZoneId;
    if (zoneId && zoneId !== ALL_GEO) return zoneId;
    if (!filterMode && defaultZoneId) return defaultZoneId;
    return undefined;
  }, [lockZone, defaultZoneId, zoneId, filterMode]);

  React.useEffect(() => {
    if (statesQueryZone) {
      stockApi.getStates(statesQueryZone).then((r) => setStates(r.data)).catch(() => setStates([]));
      return;
    }
    if (filterMode && !lockZone) {
      stockApi.getStates().then((r) => setStates(r.data)).catch(() => setStates([]));
      return;
    }
    setStates([]);
  }, [statesQueryZone, filterMode, lockZone]);

  React.useEffect(() => {
    if (defaultZoneId) setZoneId(filterMode && lockZone ? defaultZoneId : defaultZoneId);
  }, [defaultZoneId, filterMode, lockZone]);

  React.useEffect(() => {
    if (defaultStateId) setStateId(filterMode && lockState ? defaultStateId : defaultStateId);
  }, [defaultStateId, filterMode, lockState]);

  const handleZoneChange = React.useCallback((value: string) => {
    setZoneId(value);
    if (value === ALL_GEO) {
      if (!lockState) setStateId(ALL_GEO);
      return;
    }
    if (!lockState && stateId !== ALL_GEO) {
      stockApi.getStates(value).then((r) => {
        if (!r.data.some((s: GeoState) => String(s.id) === stateId)) {
          setStateId(ALL_GEO);
        }
      }).catch(() => {});
    }
  }, [lockState, stateId]);

  const apiZoneId = React.useMemo(() => {
    if (lockZone && defaultZoneId) return defaultZoneId;
    if (zoneId !== ALL_GEO && zoneId) return zoneId;
    return undefined;
  }, [lockZone, defaultZoneId, zoneId]);

  const apiStateId = React.useMemo(() => {
    if (lockState && defaultStateId) return defaultStateId;
    if (stateId !== ALL_GEO && stateId) return stateId;
    return undefined;
  }, [lockState, defaultStateId, stateId]);

  return {
    zones,
    states,
    zoneId,
    setZoneId,
    stateId,
    setStateId,
    lockZone,
    lockState,
    allowAllZones: filterMode && !lockZone,
    allowAllStates: filterMode && !lockState,
    apiZoneId,
    apiStateId,
    initialZone,
    initialState,
    handleZoneChange,
    statesQueryZone,
  };
}
