import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { stockApi } from "@/lib/api";
import CustomTable, { CustomTableField } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { Eye, PackageCheck } from "lucide-react";
import PageLayout from "../components/PageLayout";

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
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fields: CustomTableField[] = [
    {
      title: "Code",
      value: "itemCode",
      custom: true,
      component: (item) => (
        <span className="font-mono text-sm font-semibold text-[#145c3f]">{item.itemCode}</span>
      ),
    },
    { title: "Item", value: "name", className: "font-medium text-slate-900" },
    { title: "Category", value: "category", className: "text-slate-600" },
    { title: "Unit", value: "unitOfMeasure", className: "text-slate-600" },
    {
      title: "Qty",
      value: "quantityInStock",
      custom: true,
      component: (item) => (
        <span className="font-mono font-semibold text-slate-900">{item.quantityInStock ?? 0}</span>
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
          className="h-8 px-2 text-[11px] font-semibold text-[#145c3f] hover:bg-[#e8f5ee]"
          onClick={() => navigate(`/store-management/inventory/items/${item.id}`)}
        >
          <Eye className="w-3.5 h-3.5 mr-1" /> View
        </Button>
      ),
    },
  ];

  return (
    <PageLayout
      title="Inventory Catalog"
      description="Store stock posted from Verification of Supply"
      actions={
        <Button
          size="sm"
          className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs h-9 font-semibold"
          onClick={() => navigate("/store-management/verification/supply/new")}
        >
          <PackageCheck className="w-4 h-4 mr-1.5" /> Receive stock
        </Button>
      }
    >
      <CustomTable
        data={items}
        fields={fields}
        filter={true}
        loading={loading}
        pageSize={15}
        message="No inventory yet — receive stock via Verification of Supply"
      />
    </PageLayout>
  );
}
