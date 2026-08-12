import React, { useState, useEffect } from "react";
import PageLayout from "@/src/modules/store_management/components/PageLayout";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { storeManagementApi } from "@/src/services/storeManagementApi";
import { ArrowLeft, ClipboardCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-slate-500 mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-slate-900 break-words">{children ?? "—"}</div>
    </div>
  );
}

export function AssetDetailView() {
  const { id: rawId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const pathname = location.pathname;
  const detailPrefix = "/store-management/assets/detail/";
  let extractedId = rawId ? decodeURIComponent(rawId) : "";
  if (pathname.includes(detailPrefix)) {
    const tail = pathname.substring(pathname.indexOf(detailPrefix) + detailPrefix.length);
    if (tail) extractedId = decodeURIComponent(tail);
  }

  useEffect(() => {
    if (!extractedId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await storeManagementApi.getAssetById(extractedId);
        if (!cancelled) setAsset(res?.data || res || null);
      } catch {
        if (!cancelled) setAsset(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [extractedId]);

  if (loading) {
    return (
      <PageLayout title="Asset" description="Loading…">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 rounded-lg border border-slate-200 bg-slate-50 animate-pulse" />
          ))}
        </div>
      </PageLayout>
    );
  }

  if (!asset) {
    return (
      <PageLayout
        title="Asset not found"
        description="This record is not in the master register"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Back
          </Button>
        }
      >
        <p className="text-sm text-slate-700">No asset for reference {extractedId || "—"}.</p>
      </PageLayout>
    );
  }

  const tag = asset.assetId || asset.assetNumber || asset.nhiaTagNumber || `AST-${asset.id}`;
  const cost = Number(asset.acquisitionCost || asset.acquisitionValue || 0);
  const accum = Number(asset.accumulatedDepreciation || 0);
  const nbv = Number(asset.netBookValue || asset.currentValue || Math.max(0, cost - accum));
  const attrs = Object.entries(asset.categoryAttributes || {});
  const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

  return (
    <PageLayout
      title={asset.name || "Asset"}
      description={tag}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Back
          </Button>
          <Button
            size="sm"
            onClick={() =>
              navigate(`/store-management/verification/verify/asset/${encodeURIComponent(String(asset.id))}`)
            }
            className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs font-semibold"
          >
            <ClipboardCheck className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Verify
          </Button>
        </div>
      }
    >
      <div className="w-full space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-[#145c3f]" translate="no">
            {tag}
          </span>
          <span className="rounded-md bg-[#e8f5ee] px-2 py-0.5 text-[11px] font-semibold text-[#0f3d2e]">
            {asset.operationalStatus || asset.status || "Active"}
          </span>
          {asset.verificationStatus ? (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800">
              {asset.verificationStatus}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <section className="lg:col-span-4 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 text-balance">Identity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name">{asset.name}</Field>
              <Field label="Category">{asset.primaryCategory || asset.category || "—"}</Field>
              <Field label="Subcategory">{asset.subCategory || "—"}</Field>
              <Field label="NHIA tag">{asset.nhiaTagNumber || asset.barcodeQrCode || tag}</Field>
            </div>
          </section>

          <section className="lg:col-span-4 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 text-balance">Custody &amp; location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Custodian">{asset.assignedCustodian || asset.custodian || "Unassigned"}</Field>
              <Field label="Facility">{asset.facilitySite || asset.officeName || "—"}</Field>
              <Field label="Department / unit">{asset.officeDeptUnit || asset.department || "—"}</Field>
              <Field label="Room / spot">{asset.specificLocation || asset.location || "—"}</Field>
            </div>
          </section>

          <section className="lg:col-span-4 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 text-balance">Valuation</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Acquisition">{naira.format(cost)}</Field>
              <Field label="Accum. dep.">{naira.format(accum)}</Field>
              <Field label="Net book value">{naira.format(nbv)}</Field>
              <Field label="Useful life">{asset.usefulLifeYears || 5} yrs</Field>
              <Field label="Acquired">{asset.acquisitionDate || asset.date || asset.purchaseDate || "—"}</Field>
              <Field label="Method">{asset.depreciationMethod || "Straight-Line"}</Field>
              <Field label="Condition">{asset.physicalCondition || "—"}</Field>
              <Field label="Last verified">{asset.lastVerificationDate || "Never"}</Field>
            </div>
          </section>

          {attrs.length > 0 && (
            <section className="lg:col-span-12 rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-4 text-balance">Attributes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {attrs.map(([key, val]) => (
                  <Field key={key} label={key.replace(/([A-Z])/g, " $1").trim()}>
                    {String(val)}
                  </Field>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default AssetDetailView;
