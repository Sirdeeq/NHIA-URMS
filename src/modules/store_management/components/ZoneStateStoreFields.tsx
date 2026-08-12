import React, { useEffect, useState } from "react";
import { stockApi } from "@/lib/api";
import { LABEL_CLS, SELECT_CLS, storeNameFromState } from "../lib/storeOptions";

export type OfficeOption = { id: number; label: string };

type Props = {
  zoneId: string;
  stateId: string;
  onZoneChange: (zoneId: string, zoneName: string) => void;
  onStateChange: (stateId: string, stateName: string, storeName: string) => void;
  required?: boolean;
  idPrefix?: string;
  zoneEmptyLabel?: string;
};

export default function ZoneStateStoreFields({
  zoneId,
  stateId,
  onZoneChange,
  onStateChange,
  required = false,
  idPrefix = "office",
  zoneEmptyLabel,
}: Props) {
  const [zones, setZones] = useState<OfficeOption[]>([]);
  const [states, setStates] = useState<OfficeOption[]>([]);

  useEffect(() => {
    stockApi
      .getZones()
      .then((r) => setZones((r.data || []).map((z: any) => ({ id: z.id, label: z.description }))))
      .catch(() => setZones([]));
  }, []);

  useEffect(() => {
    if (!zoneId) {
      setStates([]);
      return;
    }
    let cancelled = false;
    stockApi
      .getStates(zoneId)
      .then((r) => {
        if (!cancelled) {
          setStates((r.data || []).map((s: any) => ({ id: s.id, label: s.description })));
        }
      })
      .catch(() => {
        if (!cancelled) setStates([]);
      });
    return () => {
      cancelled = true;
    };
  }, [zoneId]);

  const stateLabel = states.find((s) => String(s.id) === String(stateId))?.label || "";
  const storeName = storeNameFromState(stateLabel);

  return (
    <>
      <div>
        <label className={LABEL_CLS} htmlFor={`${idPrefix}-zone`}>
          Zone {required ? <span className="text-rose-500">*</span> : null}
        </label>
        <select
          id={`${idPrefix}-zone`}
          name="zone_id"
          className={SELECT_CLS}
          value={zoneId}
          required={required}
          onChange={(e) => {
            const id = e.target.value;
            const name = zones.find((z) => String(z.id) === id)?.label || "";
            onZoneChange(id, name);
          }}
        >
          <option value="">{zoneEmptyLabel || (required ? "Select zone…" : "All zones")}</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={LABEL_CLS} htmlFor={`${idPrefix}-state`}>
          State office store {required ? <span className="text-rose-500">*</span> : null}
        </label>
        <select
          id={`${idPrefix}-state`}
          name="state_id"
          className={SELECT_CLS}
          value={stateId}
          required={required}
          disabled={!zoneId}
          onChange={(e) => {
            const id = e.target.value;
            const name = states.find((s) => String(s.id) === id)?.label || "";
            onStateChange(id, name, storeNameFromState(name));
          }}
        >
          <option value="">{zoneId ? "Select state…" : "Select zone first"}</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {storeNameFromState(s.label)}
            </option>
          ))}
        </select>
        {storeName ? (
          <p className="mt-1.5 text-[11px] text-slate-600">Stock is held at this state office store.</p>
        ) : null}
      </div>
    </>
  );
}
