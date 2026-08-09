import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { stockApi } from "@/lib/api";
import PageLayout from "../../components/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Loader2,
  PackageCheck,
  Printer,
  Building2,
  ShieldCheck,
  ListOrdered,
  User,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

function verdictBadge(verdict?: string) {
  if (verdict === "VERIFIED_PASSED") {
    return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Verified & Passed</Badge>;
  }
  if (verdict === "PARTIAL_PASS") {
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Partial Pass</Badge>;
  }
  return <Badge className="bg-rose-100 text-rose-800 border-rose-200">{verdict || "Failed"}</Badge>;
}

function approvalBadge(status?: string) {
  if (status === "APPROVED") {
    return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Approved</Badge>;
  }
  if (status === "REJECTED") {
    return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Rejected</Badge>;
  }
  return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-slate-900 break-words">{children || "—"}</div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 print:shadow-none print:break-inside-avoid">
      <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm border-b border-slate-100 pb-2">
        <Icon className="h-4 w-4 text-[#145c3f]" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function SupplyVerificationDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = Boolean((location.state as any)?.justCreated);
  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await stockApi.getSupplyVerification(id);
        if (!cancelled) setRecord(res.data || null);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load certificate");
        if (!cancelled) setRecord(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const lineItems: any[] = Array.isArray(record?.lineItems)
    ? record.lineItems
    : record?.suppliedItemName
      ? [
          {
            description: record.suppliedItemName,
            quantityDelivered: record.suppliedQuantity,
            unitPrice: 0,
          },
        ]
      : [];

  const lineTotal = lineItems.reduce(
    (sum, row) => sum + Number(row.quantityDelivered || 0) * Number(row.unitPrice || 0),
    0
  );

  if (loading) {
    return (
      <PageLayout title="Supply Verification Certificate" description="Loading…">
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading certificate…
        </div>
      </PageLayout>
    );
  }

  if (!record) {
    return (
      <PageLayout
        title="Certificate Not Found"
        description="This supply verification could not be loaded"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/store-management/verification/supply")}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to list
          </Button>
        }
      >
        <p className="text-sm text-slate-500">No certificate found for reference <span className="font-mono">{id}</span>.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={
        <span className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#25a872]" />
          Certificate {record.supplyRefNo}
        </span>
      }
      description="Stock Verification Certificate of Completion for Supply / Works / Services"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => navigate("/store-management/verification/supply")}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
          <Button
            size="sm"
            className="text-xs bg-[#145c3f] hover:bg-[#0f3d2e] text-white"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5 mr-1" /> Print
          </Button>
          {record.classification === "ASSET_REGISTER" && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() =>
                navigate("/store-management/assets/register", {
                  state: {
                    fromSupplyVerification: record,
                    prefill: {
                      name: lineItems[0]?.description || record.suppliedItemName,
                      primaryCategory: record.goodsCategory,
                      acquisitionCost: lineItems[0]?.unitPrice,
                      zone_id: record.zone_id,
                      state_id: record.state_id,
                      department_id: record.department_id,
                      unit_id: record.unit_id,
                    },
                  },
                })
              }
            >
              Continue to Asset Register
            </Button>
          )}
          {record.classification === "STORE_INVENTORY" && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => navigate("/store-management/inventory/items")}
            >
              View Inventory Catalog
            </Button>
          )}
        </div>
      }
    >
      <div className="w-full space-y-4 print:space-y-3">
        {justCreated && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex flex-wrap items-center gap-3 print:hidden">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-900">Certificate saved successfully</p>
              <p className="text-xs text-emerald-800/80">
                Review the full certificate below. You can print it, then continue to{" "}
                {record.classification === "STORE_INVENTORY" ? "Inventory Catalog" : "Asset Register"}.
              </p>
            </div>
          </div>
        )}

        {/* Header strip */}
        <div className="rounded-xl border border-[#145c3f]/20 bg-[#e8f5ee] p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#145c3f]/70">Control Number</p>
            <p className="font-mono text-lg font-black text-[#145c3f]">{record.supplyRefNo}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {verdictBadge(record.verdict)}
            {approvalBadge(record.approvalStatus)}
            <Badge className="bg-slate-100 text-slate-700 border-slate-200">
              {record.classification === "STORE_INVENTORY" ? "Store Inventory" : "Asset Register"}
            </Badge>
          </div>
        </div>

        <Section icon={PackageCheck} title="Goods Classification">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Goods Category">{record.goodsCategory}</Field>
            <Field label="Store Subcategory">{record.storeSubcategory}</Field>
            <Field label="Certificate Date">{record.certificateDate}</Field>
          </div>
        </Section>

        <Section icon={MapPin} title="Location">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Zone ID">{record.zone_id}</Field>
            <Field label="State ID">{record.state_id}</Field>
            <Field label="Department ID">{record.department_id}</Field>
            <Field label="Unit ID">{record.unit_id}</Field>
          </div>
        </Section>

        <Section icon={FileText} title="1. Identification">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Control Number (PK)">{record.supplyRefNo}</Field>
            <Field label="Certificate Date">{record.certificateDate}</Field>
          </div>
        </Section>

        <Section icon={Building2} title="2. Transaction & Contract Details">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Instrument of Procurement">{record.procurementInstrument}</Field>
            <Field label="Procurement Date">{record.procurementDate}</Field>
            <Field label="Purchase Order Ref">{record.purchaseOrderRef}</Field>
            <Field label="Contractor Name">{record.supplierName}</Field>
            <Field label="Contractor Address">{record.contractorAddress}</Field>
            <Field label="SRV No.">{record.srvNo}</Field>
            <Field label="SRV Date">{record.srvDate}</Field>
          </div>
        </Section>

        <Section icon={ShieldCheck} title="3. Verification & Compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Physical Condition">{record.physicalCondition}</Field>
            <Field label="Verification Status">{verdictBadge(record.verdict)}</Field>
            <Field label="Specification Conformity">
              {record.specificationMatch === false ? "No" : "Yes"}
            </Field>
            <Field label="Price Conformance">
              {record.priceConformance === false ? "No" : "Yes"}
            </Field>
          </div>
        </Section>

        <Section icon={ListOrdered} title="4. Line Items / Deliverables">
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-600">
                <tr>
                  <th className="p-3">Control No. (FK)</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-right">Qty Delivered</th>
                  <th className="p-3 text-right">Unit Price (₦)</th>
                  <th className="p-3 text-right">Line Total (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      No line items recorded
                    </td>
                  </tr>
                )}
                {lineItems.map((row, i) => {
                  const qty = Number(row.quantityDelivered || 0);
                  const price = Number(row.unitPrice || 0);
                  return (
                    <tr key={i}>
                      <td className="p-3 font-mono text-slate-500">{record.supplyRefNo}</td>
                      <td className="p-3 font-semibold text-slate-900">{row.description}</td>
                      <td className="p-3 text-right font-mono font-bold">{qty}</td>
                      <td className="p-3 text-right font-mono">₦{price.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold">
                        ₦{(qty * price).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {lineItems.length > 0 && (
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-bold text-slate-600">
                      Total
                    </td>
                    <td className="p-3 text-right font-mono font-black text-[#145c3f]">
                      ₦{lineTotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Section>

        <Section icon={User} title="5. Sign-off & Signature Record">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Verifying Officer">{record.verifiedBy}</Field>
            <Field label="Officer Designation">{record.officerDesignation}</Field>
            <Field label="Sign-off Date">{record.signOffDate}</Field>
            <Field label="Approval Status">{approvalBadge(record.approvalStatus)}</Field>
            <div className="md:col-span-2 lg:col-span-4">
              <Field label="Remarks">{record.remarks || "—"}</Field>
            </div>
          </div>
        </Section>
      </div>
    </PageLayout>
  );
}
