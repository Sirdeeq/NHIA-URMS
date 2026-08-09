import React, { useEffect, useState } from "react";
import { storeManagementApi } from "@/src/services/storeManagementApi";
import { useNavigate } from "react-router-dom";
import CustomTable, { CustomTableField } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import PageLayout from "../components/PageLayout";

function statusLabel(item: any) {
  const st = String(item.operationalStatus || item.status || "Active");
  return st;
}

export default function AssetListView({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fields: CustomTableField[] = [
    {
      title: "Tag",
      value: "assetId",
      custom: true,
      component: (item) => (
        <span className="font-mono text-sm font-semibold text-[#145c3f]">
          {item.assetId || item.assetNumber || item.nhiaTagNumber || `AST-${item.id}`}
        </span>
      ),
    },
    { title: "Name", value: "name", className: "font-medium text-slate-900" },
    {
      title: "Category",
      value: "primaryCategory",
      custom: true,
      component: (item) => (
        <span className="text-slate-600">{item.primaryCategory || item.category || "—"}</span>
      ),
    },
    {
      title: "Custodian",
      value: "assignedCustodian",
      custom: true,
      component: (item) => (
        <span className="text-slate-700">{item.assignedCustodian || item.custodian || "—"}</span>
      ),
    },
    {
      title: "Location",
      value: "officeDeptUnit",
      custom: true,
      component: (item) => (
        <span className="text-slate-600 text-sm">
          {item.officeDeptUnit || item.department || item.location || "—"}
        </span>
      ),
    },
    {
      title: "Status",
      value: "operationalStatus",
      custom: true,
      component: (item) => {
        const st = statusLabel(item);
        const muted =
          st.toLowerCase().includes("repair") ||
          st.toLowerCase().includes("damaged") ||
          st.toLowerCase().includes("disposed");
        return (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
              muted ? "bg-slate-100 text-slate-700" : "bg-[#e8f5ee] text-[#0f3d2e]"
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/store-management/assets/detail/${encodeURIComponent(String(id))}`)}
            className="h-8 px-2 text-[11px] font-semibold text-[#145c3f] hover:bg-[#e8f5ee]"
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> View
          </Button>
        );
      },
    },
  ];

  return (
    <PageLayout
      title="Asset Master Register"
      description="Tagged capital assets and custody records"
      actions={
        <Button
          size="sm"
          onClick={() => {
            if (onNavigate) onNavigate("store-assets-register");
            else navigate("/store-management/assets/register");
          }}
          className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs h-9 font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Register Asset
        </Button>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}

      <CustomTable
        data={assets}
        fields={fields}
        filter={true}
        loading={loading}
        pageSize={15}
        message="No assets registered yet"
      />
    </PageLayout>
  );
}
