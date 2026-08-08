import * as React from "react";
import { stockApi } from "@/lib/api";
import type { ReportScope } from "@/src/access/reportScopeAccess";

export const ALL_STATES = "all";

export function useMonthlyStateFilter(
  defaultStateId?: string | null,
  defaultZoneId?: string | null,
  reportScope?: ReportScope,
) {
  const lockState = reportScope === "state" || !!defaultStateId;
  const [filterState, setFilterState] = React.useState(
    lockState && defaultStateId ? defaultStateId : (defaultStateId ?? ALL_STATES),
  );
  const [states, setStates] = React.useState<{ id: number; description: string }[]>([]);

  const showStateFilter = !lockState;

  React.useEffect(() => {
    if (defaultZoneId) {
      stockApi.getStates(defaultZoneId).then(r => setStates(r.data)).catch(() => setStates([]));
    } else {
      stockApi.getStates().then(r => setStates(r.data)).catch(() => setStates([]));
    }
  }, [defaultZoneId]);

  React.useEffect(() => {
    if (defaultStateId) setFilterState(defaultStateId);
  }, [defaultStateId]);

  const apiStateId = React.useMemo(() => {
    if (lockState) return defaultStateId!;
    if (filterState !== ALL_STATES) return filterState;
    return undefined;
  }, [lockState, defaultStateId, filterState]);

  return {
    showStateFilter,
    states,
    filterState,
    setFilterState,
    apiStateId,
    stateFilterActive: showStateFilter && filterState !== ALL_STATES,
  };
}
