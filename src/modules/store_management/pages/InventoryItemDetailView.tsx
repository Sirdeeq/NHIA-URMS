import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { stockApi } from "@/lib/api";
import PageLayout from "../components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, PackageCheck } from "lucide-react";
import { toast } from "sonner";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-slate-500 mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-slate-900 break-words">{children ?? "—"}</div>
    </div>
  );
}

function stockMeta(item: any) {
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

export default function InventoryItemDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await stockApi.getInventoryItem(id);
        if (!cancelled) setItem(res.data || null);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load inventory item");
        if (!cancelled) setItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PageLayout title="Inventory item" description="Loading…">
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
        </div>
      </PageLayout>
    );
  }

  if (!item) {
    return (
      <PageLayout
        title="Item not found"
        description="This catalog entry could not be loaded"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => navigate("/store-management/inventory/items")}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
        }
      >
        <p className="text-sm text-slate-600">No inventory item for reference {id}.</p>
      </PageLayout>
    );
  }

  const tone = stockMeta(item);
  const unitPrice = Number(item.unitPrice || 0);
  const qty = Number(item.quantityInStock || 0);
  const stockValue = unitPrice * qty;

  return (
    <PageLayout
      title={item.name}
      description={item.itemCode}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => navigate("/store-management/inventory/items")}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
          <Button
            size="sm"
            className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs font-semibold"
            onClick={() => navigate("/store-management/verification/supply/new")}
          >
            <PackageCheck className="h-3.5 w-3.5 mr-1" /> Receive more
          </Button>
        </div>
      }
    >
      <div className="max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-[#145c3f]">{item.itemCode}</span>
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${tone.className}`}>
            {tone.label}
          </span>
        </div>

        <section className="border-b border-slate-200 pb-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Item</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Description">{item.name}</Field>
            <Field label="Category">{item.category}</Field>
            <Field label="Unit of measure">{item.unitOfMeasure || "—"}</Field>
            <Field label="Store location">{item.storeLocation || "—"}</Field>
          </div>
        </section>

        <section className="border-b border-slate-200 pb-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Stock</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Quantity on hand">{qty}</Field>
            <Field label="Reorder level">{item.reorderLevel ?? "—"}</Field>
            <Field label="Unit price">₦{unitPrice.toLocaleString()}</Field>
            <Field label="Stock value">₦{stockValue.toLocaleString()}</Field>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Created">
              {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
            </Field>
            <Field label="Updated">
              {item.updated_at ? new Date(item.updated_at).toLocaleString() : "—"}
            </Field>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
