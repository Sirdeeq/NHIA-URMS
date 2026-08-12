import React, { useEffect, useMemo, useState } from "react";
import { storeManagementApi } from "@/src/services/storeManagementApi";
import { useNavigate } from "react-router-dom";
import CustomTable, { CustomTableField } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { Plus, Eye, ClipboardCheck } from "lucide-react";
import PageLayout from "../../components/PageLayout";
import ListSearchBar from "../../components/ListSearchBar";

export default function PhysicalAssetVerificationListView() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await storeManagementApi.getAssets();
      if (res.success && Array.isArray(res.data)) setAssets(res.data);
      else if (Array.isArray(res)) setAssets(res);
      else setAssets([]);
    } catch (err: any) {
      setError(err.message || "Failed to load assets");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) =>
      [a.assetId, a.assetNumber, a.nhiaTagNumber, a.name, a.assignedCustodian, a.custodian, a.officeDeptUnit, a.primaryCategory]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [assets, query]);

  const fields: CustomTableField[] = [
    {
      title: "Tag",
      value: "assetId",
      custom: true,
      component: (item) => (
        <span className="font-mono text-sm font-semibold tabular-nums text-[#145c3f]">
          {item.assetId || item.assetNumber || item.nhiaTagNumber || `AST-${item.id}`}
        </span>
      ),
    },
    { title: "Name", value: "name", className: "font-medium text-slate-900 min-w-[180px]" },
    {
      title: "Category",
      value: "primaryCategory",
      custom: true,
      component: (item) => (
        <span className="text-slate-700">{item.primaryCategory || item.category || "—"}</span>
      ),
    },
    {
      title: "Custodian",
      value: "assignedCustodian",
      custom: true,
      component: (item) => (
        <span className="text-slate-800">{item.assignedCustodian || item.custodian || "—"}</span>
      ),
    },
    {
      title: "Location",
      value: "officeDeptUnit",
      custom: true,
      component: (item) => (
        <span className="text-slate-700">
          {item.officeDeptUnit || item.department || item.location || "—"}
        </span>
      ),
    },
    {
      title: "Condition",
      value: "physicalCondition",
      custom: true,
      component: (item) => <span className="text-slate-800">{item.physicalCondition || "—"}</span>,
    },
    {
      title: "Last verified",
      value: "lastVerificationDate",
      custom: true,
      component: (item) => (
        <span className="text-slate-700 tabular-nums">{item.lastVerificationDate || "Never"}</span>
      ),
    },
    {
      title: "Status",
      value: "verificationStatus",
      custom: true,
      component: (item) => {
        const st = String(item.verificationStatus || item.operationalStatus || "Active");
        const exception = /exception|missing|failed/i.test(st);
        return (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
              exception ? "bg-amber-50 text-amber-900" : "bg-[#e8f5ee] text-[#0f3d2e]"
            }`}
          >
            {st}
          </span>
        );
      },
    },
    {
      title: "",
      value: "id",
      custom: true,
      component: (item) => {
        const id = item.id || item.assetId || item.assetNumber;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              aria-label={`View ${item.name || "asset"}`}
              onClick={() => navigate(`/store-management/assets/detail/${encodeURIComponent(String(id))}`)}
              className="h-8 px-2.5 text-[11px] font-semibold border-slate-200"
            >
              <Eye className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> View
            </Button>
            <Button
              size="sm"
              aria-label={`Verify ${item.name || "asset"}`}
              onClick={() =>
                navigate(`/store-management/verification/verify/asset/${encodeURIComponent(String(item.id))}`)
              }
              className="h-8 px-2.5 text-[11px] font-semibold bg-[#145c3f] hover:bg-[#0f3d2e] text-white"
            >
              <ClipboardCheck className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Verify
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <PageLayout
      title="Physical Asset Verification"
      description="All tagged assets — view the record or verify condition and count"
      actions={
        <Button
          size="sm"
          onClick={() => navigate("/store-management/assets/register")}
          className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs h-9 font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Register Asset
        </Button>
      }
      contentClassName="gap-3"
    >
      {error && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}

      <ListSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search tag, name, custodian…"
        id="verify-search"
      />

      <div className="min-w-0 w-full flex-1">
        <CustomTable
          data={filtered}
          fields={fields}
          filter={false}
          loading={loading}
          pageSize={20}
          message="No assets registered yet — add an asset first"
        />
      </div>
    </PageLayout>
  );
}
