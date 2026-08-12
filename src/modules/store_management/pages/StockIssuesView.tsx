import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { stockApi } from "@/lib/api";
import CustomTable, { CustomTableField } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { Send, Plus, Tag } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { toast } from "sonner";
import { matchesStore, storeNameFromState, SELECT_CLS, LABEL_CLS } from "../lib/storeOptions";
import ListSearchBar from "../components/ListSearchBar";

type Option = { id: number; label: string };

export default function StockIssuesView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "capitalise" ? "capitalise" : "issue";
  const zoneFilter = searchParams.get("zone") || "";
  const stateFilter = searchParams.get("state") || "";
  const q = searchParams.get("q") || "";
  const [rows, setRows] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [issuesRes, convRes] = await Promise.all([
        stockApi.getStockIssues(),
        stockApi.getConversions().catch(() => ({ data: [] })),
      ]);
      setRows(Array.isArray(issuesRes.data) ? issuesRes.data : []);
      setConversions(Array.isArray(convRes.data) ? convRes.data : []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load records");
      setRows([]);
      setConversions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const setParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const issueFiltered = useMemo(() => {
    let list = rows;
    if (storeLabel) list = list.filter((r) => matchesStore(r.fromLocation, storeLabel));
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((r) =>
        [r.issueNumber, r.department, r.recipientName, r.fromLocation, r.issuedBy]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }
    return list;
  }, [rows, storeLabel, q]);

  const convFiltered = useMemo(() => {
    let list = conversions;
    if (storeLabel) list = list.filter((r) => matchesStore(r.storeLocation, storeLabel));
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((r) =>
        [r.conversionRef, r.itemName, r.itemCode, r.assetNumber, r.storeLocation, r.convertedBy]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }
    return list;
  }, [conversions, storeLabel, q]);

  const issueFields: CustomTableField[] = [
    {
      title: "Voucher No",
      value: "issueNumber",
      custom: true,
      component: (item) => (
        <span className="font-mono text-sm font-semibold tabular-nums text-[#145c3f]" translate="no">
          {item.issueNumber}
        </span>
      ),
    },
    { title: "Store", value: "fromLocation", className: "text-slate-800" },
    { title: "To / Department", value: "department", className: "text-slate-800" },
    { title: "Recipient", value: "recipientName", className: "text-slate-800" },
    {
      title: "Items",
      value: "lineItems",
      custom: true,
      component: (item) => {
        const lines = Array.isArray(item.lineItems) ? item.lineItems : [];
        const qty = lines.reduce((s: number, l: any) => s + Number(l.quantity || 0), 0);
        return (
          <span className="text-sm text-slate-800 tabular-nums">
            {lines.length} item{lines.length === 1 ? "" : "s"}
            {qty ? <span className="text-slate-500 font-mono ml-1">({qty})</span> : null}
          </span>
        );
      },
    },
    { title: "Date", value: "issueDate", className: "text-slate-700 tabular-nums" },
    { title: "Issued By", value: "issuedBy", className: "text-slate-700" },
    {
      title: "Status",
      value: "status",
      custom: true,
      component: (item) => (
        <span className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold bg-[#e8f5ee] text-[#0f3d2e]">
          {item.status || "APPROVED"}
        </span>
      ),
    },
  ];

  const convFields: CustomTableField[] = [
    {
      title: "Conversion Ref",
      value: "conversionRef",
      custom: true,
      component: (item) => (
        <span className="font-mono text-sm font-semibold text-[#145c3f]" translate="no">{item.conversionRef}</span>
      ),
    },
    { title: "Item", value: "itemName", className: "font-medium text-slate-900" },
    { title: "Qty", value: "quantity", className: "tabular-nums font-semibold" },
    { title: "Store", value: "storeLocation", className: "text-slate-800" },
    {
      title: "Asset tag",
      value: "assetNumber",
      custom: true,
      component: (item) => (
        <span className="font-mono text-sm font-semibold text-slate-900">{item.assetNumber || "—"}</span>
      ),
    },
    { title: "Date", value: "conversionDate", className: "tabular-nums text-slate-700" },
    { title: "Officer", value: "convertedBy", className: "text-slate-700" },
  ];

  return (
    <PageLayout
      title={
        <span className="flex items-center gap-2">
          <Send className="w-5 h-5 text-[#25a872]" aria-hidden="true" /> Capitalisation &amp; Issuance
        </span>
      }
      description="Issue store stock to departments, or capitalise store items into the asset register"
      actions={
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-9 font-semibold"
            onClick={() => navigate("/store-management/conversion/new")}
          >
            <Tag className="w-4 h-4 mr-1.5" aria-hidden="true" /> Capitalise to Asset
          </Button>
          <Button
            size="sm"
            className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs h-9 font-semibold"
            onClick={() => navigate("/store-management/transfers/new")}
          >
            <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> New Issue
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            type="button"
            className={`h-9 px-3 text-xs font-semibold ${tab === "issue" ? "bg-[#145c3f] text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
            onClick={() => setParam("tab", "")}
          >
            Issuance
          </button>
          <button
            type="button"
            className={`h-9 px-3 text-xs font-semibold border-l border-slate-200 ${tab === "capitalise" ? "bg-[#145c3f] text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
            onClick={() => setParam("tab", "capitalise")}
          >
            Capitalisation
          </button>
        </div>
        <ListSearchBar
          value={q}
          onChange={(v) => setParam("q", v)}
          placeholder={tab === "capitalise" ? "Search conversion, item, tag…" : "Search voucher, department, recipient…"}
        />
        <div className="w-44">
          <label htmlFor="issue-zone" className={LABEL_CLS}>Zone</label>
          <select
            id="issue-zone"
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
        <div className="w-56">
          <label htmlFor="issue-state" className={LABEL_CLS}>State office store</label>
          <select
            id="issue-state"
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
      </div>

      <div className="min-w-0 w-full flex-1">
        {tab === "issue" ? (
          <CustomTable
            data={issueFiltered}
            fields={issueFields}
            filter={false}
            loading={loading}
            pageSize={15}
            message="No stock issues yet — issue inventory from the catalog"
          />
        ) : (
          <CustomTable
            data={convFiltered}
            fields={convFields}
            filter={false}
            loading={loading}
            pageSize={15}
            message="No capitalisations yet — convert store stock into a tagged asset"
          />
        )}
      </div>
    </PageLayout>
  );
}
