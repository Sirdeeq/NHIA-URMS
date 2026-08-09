import React, { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { storeManagementApi } from "@/src/services/storeManagementApi";
import { ArrowLeft, Loader2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-slate-500 mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-slate-900 break-words">{children ?? "—"}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-slate-200 py-5 last:border-b-0">
      <h3 className="text-sm font-bold text-slate-900 mb-3 text-balance">{title}</h3>
      {children}
    </section>
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
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading asset…
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
            onClick={() => navigate("/store-management/assets/list")}
            className="text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
        }
      >
        <p className="text-sm text-slate-600">No asset for reference {extractedId || "—"}.</p>
      </PageLayout>
    );
  }

  const tag = asset.assetId || asset.assetNumber || asset.nhiaTagNumber || `AST-${asset.id}`;
  const cost = Number(asset.acquisitionCost || asset.acquisitionValue || 0);
  const accum = Number(asset.accumulatedDepreciation || 0);
  const nbv = Number(asset.netBookValue || asset.currentValue || Math.max(0, cost - accum));
  const attrs = Object.entries(asset.categoryAttributes || {});

  return (
    <PageLayout
      title={asset.name || "Asset"}
      description={tag}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/store-management/assets/list")}
            className="text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/store-management/transfers/new")}
            className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs font-semibold"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" /> Transfer
          </Button>
        </div>
      }
    >
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="font-mono text-sm font-bold text-[#145c3f]">{tag}</span>
          <span className="rounded-md bg-[#e8f5ee] px-2 py-0.5 text-[11px] font-semibold text-[#0f3d2e]">
            {asset.operationalStatus || asset.status || "Active"}
          </span>
        </div>

        <Section title="Identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name">{asset.name}</Field>
            <Field label="Category">{asset.primaryCategory || asset.category || "—"}</Field>
            <Field label="Subcategory">{asset.subCategory || "—"}</Field>
            <Field label="NHIA tag">{asset.nhiaTagNumber || asset.barcodeQrCode || tag}</Field>
          </div>
        </Section>

        <Section title="Custody & location">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Custodian">{asset.assignedCustodian || asset.custodian || "Unassigned"}</Field>
            <Field label="Facility">{asset.facilitySite || asset.officeName || "—"}</Field>
            <Field label="Department / unit">{asset.officeDeptUnit || asset.department || "—"}</Field>
            <Field label="Room / spot">{asset.specificLocation || asset.location || "—"}</Field>
          </div>
        </Section>

        <Section title="Valuation">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Acquisition">₦{cost.toLocaleString()}</Field>
            <Field label="Accum. dep.">₦{accum.toLocaleString()}</Field>
            <Field label="Net book value">₦{nbv.toLocaleString()}</Field>
            <Field label="Useful life">{asset.usefulLifeYears || 5} yrs</Field>
            <Field label="Acquired">{asset.acquisitionDate || asset.date || asset.purchaseDate || "—"}</Field>
            <Field label="Method">{asset.depreciationMethod || "Straight-Line"}</Field>
            <Field label="Condition">{asset.physicalCondition || "—"}</Field>
            <Field label="Verification">{asset.verificationStatus || "—"}</Field>
          </div>
        </Section>

        {attrs.length > 0 && (
          <Section title="Attributes">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attrs.map(([key, val]) => (
                <Field key={key} label={key.replace(/([A-Z])/g, " $1").trim()}>
                  {String(val)}
                </Field>
              ))}
            </div>
          </Section>
        )}
      </div>
    </PageLayout>
  );
}

export default AssetDetailView;
