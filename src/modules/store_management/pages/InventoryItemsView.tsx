import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { stockApi } from "@/lib/api";
import CustomTable, { CustomTableField } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { Eye, PackageCheck } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { matchesStore, storeNameFromState, SELECT_CLS, LABEL_CLS } from "../lib/storeOptions";
import ListSearchBar from "../components/ListSearchBar";

type Option = { id: number; label: string };

function stockTone(item: any) {
  const qty = Number(item.quantityInStock || 0);
  const reorder = Number(item.reorderLevel || 10);
  const status = item.status as string | undefined;
  if (status === "OUT_OF_STOCK" || qty <= 0) {
    return { label: "Out of stock", className: "bg-rose-50 text-rose-800" };
  }
  if (status === "LOW_STOCK" || qty <= reorder) {
    return { label: "Low stock", className: "bg-amber-50 text-amber-900" };
  }
  return { label: "In stock", className: "bg-[#e8f5ee] text-[#0f3d2e]" };
}

export default function InventoryItemsView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const zoneFilter = searchParams.get("zone") || "";
  const stateFilter = searchParams.get("state") || "";
  const q = searchParams.get("q") || "";
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await stockApi.getInventoryItems();
        if (!cancelled) setItems(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    stockApi.getZones().then((r) => setZones((r.data || []).map((z: any) => ({ id: z.id, label: z.description })))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!zoneFilter) { setStates([]); return; }
    stockApi.getStates(zoneFilter).then((r) => setStates((r.data || []).map((s: any) => ({ id: s.id, label: s.description })))).catch(() => setStates([]));
  }, [zoneFilter]);

  const storeLabel = useMemo(() => {
    const state = states.find((s) => String(s.id) === String(stateFilter));
    return state ? storeNameFromState(state.label) : "";
  }, [states, stateFilter]);

  const filtered = useMemo(() => {
    let list = items;
    if (storeLabel) list = list.filter((i) => matchesStore(i.storeLocation, storeLabel));
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((i) =>
        [i.itemCode, i.name, i.category, i.storeLocation, i.unitOfMeasure]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }
    return list;
  }, [items, storeLabel, q]);

  const setParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const fields: CustomTableField[] = [
    {
      title: "Code",
      value: "itemCode",
      custom: true,
      component: (item) => (
        <span className="font-mono text-sm font-semibold tabular-nums text-[#145c3f]" translate="no">
          {item.itemCode}
        </span>
      ),
    },
    { title: "Item", value: "name", className: "font-medium text-slate-900 min-w-[180px]" },
    { title: "Category", value: "category", className: "text-slate-700" },
    {
      title: "Store",
      value: "storeLocation",
      custom: true,
      component: (item) => <span className="text-slate-800">{item.storeLocation || "—"}</span>,
    },
    { title: "Unit", value: "unitOfMeasure", className: "text-slate-700" },
    {
      title: "Qty",
      value: "quantityInStock",
      custom: true,
      component: (item) => (
        <span className="font-mono font-semibold tabular-nums text-slate-900">{item.quantityInStock ?? 0}</span>
      ),
    },
    {
      title: "Status",
      value: "status",
      custom: true,
      component: (item) => {
        const tone = stockTone(item);
        return (
          <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${tone.className}`}>
            {tone.label}
          </span>
        );
      },
    },
    {
      title: "",
      value: "id",
      custom: true,
      component: (item) => (
        <Button
          size="sm"
          variant="ghost"
          aria-label={`View ${item.name || "item"}`}
          className="h-8 px-2 text-[11px] font-semibold text-[#145c3f] hover:bg-[#e8f5ee]"
          onClick={() => navigate(`/store-management/inventory/items/${item.id}`)}
        >
          <Eye className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> View
        </Button>
      ),
    },
  ];

  return (
    <PageLayout
      title="Inventory Register"
      description="Store stock posted from Verification of Supply"
      actions={
        <Button
          size="sm"
          className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs h-9 font-semibold"
          onClick={() => navigate("/store-management/verification/supply/new")}
        >
          <PackageCheck className="w-4 h-4 mr-1.5" aria-hidden="true" /> Receive stock
        </Button>
      }
    >
      <div className="flex flex-wrap items-end gap-4">
        <ListSearchBar
          value={q}
          onChange={(v) => setParam("q", v)}
          placeholder="Search code, item, category, store…"
          id="inv-search"
        />
        <div className="w-48">
          <label htmlFor="inv-zone" className={LABEL_CLS}>Zone</label>
          <select
            id="inv-zone"
            name="zone"
            className={SELECT_CLS}
            value={zoneFilter}
            onChange={(e) => { setParam("zone", e.target.value); setParam("state", ""); }}
          >
            <option value="">All zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.label}</option>
            ))}
          </select>
        </div>
        <div className="w-60">
          <label htmlFor="inv-state" className={LABEL_CLS}>State office store</label>
          <select
            id="inv-state"
            name="state"
            className={SELECT_CLS}
            value={stateFilter}
            disabled={!zoneFilter}
            onChange={(e) => setParam("state", e.target.value)}
          >
            <option value="">{zoneFilter ? "All state stores" : "Select zone first"}</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{storeNameFromState(s.label)}</option>
            ))}
          </select>
        </div>
        {storeLabel && (
          <div className="self-end pb-0.5">
            <p className="h-10 flex items-center px-3 rounded-lg border border-[#25a872]/40 bg-[#e8f5ee] text-[11px] font-semibold text-[#0f3d2e]">
              {storeLabel}
            </p>
          </div>
        )}
      </div>

      <div className="min-w-0 w-full flex-1">
        <CustomTable
          data={filtered}
          fields={fields}
          filter={false}
          loading={loading}
          pageSize={15}
          message={
            storeLabel
              ? "No stock in this store — receive via Verification of Supply"
              : "No inventory yet — receive stock via Verification of Supply"
          }
        />
      </div>
    </PageLayout>
  );
}
