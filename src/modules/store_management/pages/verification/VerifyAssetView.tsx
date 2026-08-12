import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/src/store/store";
import { storeManagementApi } from "@/src/services/storeManagementApi";
import { stockApi } from "@/lib/api";
import PageLayout from "../../components/PageLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ClipboardCheck,
  Loader2,
  Tag,
  ListOrdered,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PHYSICAL_CONDITIONS } from "../../lib/storeOptions";

const VERIFY_CONDITIONS = [...PHYSICAL_CONDITIONS, "Damaged", "Missing"] as const;
const VERIFY_STATUSES = ["Verified & Passed", "Partial Pass", "Exception"];

const STEPS = [
  { id: 1, title: "Identity", icon: Tag },
  { id: 2, title: "Count & condition", icon: ListOrdered },
  { id: 3, title: "Sign-off", icon: User },
];

export default function VerifyAssetView() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  const [asset, setAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    physicalCondition: "Good",
    verificationStatus: "Verified & Passed",
    physicalCount: 1,
    bookBalance: 1,
    verificationDate: new Date().toISOString().slice(0, 10),
    remarks: "",
  });

  useEffect(() => {
    if (!assetId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await storeManagementApi.getAssetById(assetId);
        const data = res?.data || res || null;
        if (cancelled) return;
        setAsset(data);
        if (data) {
          setForm((p) => ({
            ...p,
            physicalCondition: data.physicalCondition || "Good",
            verificationStatus: data.verificationStatus || "Verified & Passed",
          }));
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to load asset");
        if (!cancelled) setAsset(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assetId]);

  const variance = Number(form.bookBalance || 0) - Number(form.physicalCount || 0);
  const hasException =
    form.physicalCondition === "Missing" || Number(form.physicalCount) === 0 || variance !== 0;

  const validateStep = (step: number) => {
    setError(null);
    if (step === 2) {
      if (form.physicalCount < 0 || form.bookBalance < 0) {
        setError("Counts cannot be negative.");
        return false;
      }
    }
    if (step === 3 && hasException && !form.remarks.trim()) {
      setError("Record a remark for the variance or exception before sign-off.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!asset?.id) return;
    if (!validateStep(3)) return;
    setSaving(true);
    try {
      const status = hasException ? "Exception" : form.verificationStatus || "Verified & Passed";

      await storeManagementApi.updateAsset(asset.id, {
        physicalCondition: form.physicalCondition,
        lastVerificationDate: form.verificationDate,
        verificationStatus: status,
      });

      await stockApi.createPhysicalVerification({
        stocktakingType: "periodic",
        verificationDate: form.verificationDate,
        storeKeeper: user?.name || "Officer",
        auditOfficer: "",
        remarks: form.remarks,
        status: "SUBMITTED",
        items: [
          {
            assetId: asset.id,
            assetNumber: asset.assetId || asset.assetNumber || asset.nhiaTagNumber,
            assetName: asset.name,
            category: asset.primaryCategory || asset.category,
            custodian: asset.assignedCustodian || asset.custodian,
            bookBalance: Number(form.bookBalance) || 1,
            physicalCount: Number(form.physicalCount) || 0,
            condition:
              form.physicalCondition === "Missing"
                ? "MISSING"
                : form.physicalCondition === "Damaged"
                  ? "DAMAGED"
                  : form.physicalCondition === "Poor"
                    ? "POOR"
                    : form.physicalCondition === "Fair"
                      ? "FAIR"
                      : "GOOD",
            remarks: form.remarks,
          },
        ],
      });

      toast.success(hasException ? "Verification saved with exception" : "Asset verification saved");
      navigate("/store-management/verification/verify");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save verification");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25a872]/40 disabled:bg-slate-50";
  const labelCls = "block text-[11px] font-semibold text-slate-600 mb-1.5";

  if (loading) {
    return (
      <PageLayout title="Verify Asset" description="Loading…">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-lg border border-slate-200 bg-slate-50 animate-pulse" />
          ))}
        </div>
      </PageLayout>
    );
  }

  if (!asset) {
    return (
      <PageLayout
        title="Asset not found"
        description="Cannot verify this record"
        actions={
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/store-management/verification/verify")}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Back
          </Button>
        }
      >
        <p className="text-sm text-slate-700">No asset for reference {assetId}.</p>
      </PageLayout>
    );
  }

  const tag = asset.assetId || asset.assetNumber || asset.nhiaTagNumber || `AST-${asset.id}`;

  return (
    <PageLayout
      title="Verify Asset"
      description={`${tag} · ${asset.name || ""}`}
      actions={
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => navigate("/store-management/verification/verify")}
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Back to list
        </Button>
      }
    >
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden w-full">
        <div className="bg-[#145c3f] text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight">Physical inspection</h2>
            <p className="text-xs text-emerald-100/90">Confirm identity, count, and condition against the register</p>
          </div>
          <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-white/10 text-emerald-200 border border-white/20" translate="no">
            {tag}
          </span>
        </div>

        <div className="bg-[#f4f7f5] border-b border-slate-200 flex overflow-x-auto">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep || validateStep(currentStep)) setCurrentStep(step.id);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-r border-slate-200 ${
                  isActive ? "bg-white text-[#145c3f] border-b-2 border-b-[#145c3f]" : isDone ? "text-[#145c3f]" : "text-slate-600"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive || isDone ? "text-[#25a872]" : "text-slate-400"}`} aria-hidden="true" />
                {step.id}. {step.title}
              </button>
            );
          })}
        </div>

        {error && (
          <div role="alert" className="m-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (currentStep < 3) {
              if (validateStep(currentStep)) setCurrentStep((s) => s + 1);
            } else handleSubmit();
          }}
          className="p-6 space-y-5"
        >
          {currentStep === 1 && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div className="min-w-0">
                <dt className={labelCls}>Name</dt>
                <dd className="font-semibold text-slate-900 break-words">{asset.name}</dd>
              </div>
              <div className="min-w-0">
                <dt className={labelCls}>Tag</dt>
                <dd className="font-mono font-semibold text-[#145c3f]">{tag}</dd>
              </div>
              <div className="min-w-0">
                <dt className={labelCls}>Category</dt>
                <dd className="font-medium text-slate-900">{asset.primaryCategory || asset.category || "—"}</dd>
              </div>
              <div className="min-w-0">
                <dt className={labelCls}>Custodian</dt>
                <dd className="font-medium text-slate-900">{asset.assignedCustodian || asset.custodian || "—"}</dd>
              </div>
              <div className="sm:col-span-2 min-w-0">
                <dt className={labelCls}>Location</dt>
                <dd className="font-medium text-slate-900">
                  {asset.officeDeptUnit || asset.department || asset.location || "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className={labelCls}>Last verified</dt>
                <dd className="font-medium text-slate-900 tabular-nums">{asset.lastVerificationDate || "Never"}</dd>
              </div>
              <div className="min-w-0">
                <dt className={labelCls}>Current status</dt>
                <dd className="font-medium text-slate-900">{asset.verificationStatus || asset.operationalStatus || "—"}</dd>
              </div>
            </dl>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <label className={labelCls} htmlFor="book-balance">Book balance</label>
                <input
                  id="book-balance"
                  name="bookBalance"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className={`${inputCls} tabular-nums`}
                  value={form.bookBalance}
                  onChange={(e) => setForm((p) => ({ ...p, bookBalance: Number(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="physical-count">Physical count found</label>
                <input
                  id="physical-count"
                  name="physicalCount"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className={`${inputCls} tabular-nums`}
                  value={form.physicalCount}
                  onChange={(e) => setForm((p) => ({ ...p, physicalCount: Number(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className={labelCls}>Variance</label>
                <p className={`h-10 flex items-center px-3 rounded-lg border text-sm font-semibold tabular-nums ${
                  variance !== 0 ? "border-amber-200 bg-amber-50 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-700"
                }`}>
                  {variance}
                </p>
              </div>
              <div>
                <label className={labelCls} htmlFor="condition">Condition</label>
                <select
                  id="condition"
                  name="physicalCondition"
                  className={inputCls}
                  value={form.physicalCondition}
                  onChange={(e) => setForm((p) => ({ ...p, physicalCondition: e.target.value }))}
                >
                  {VERIFY_CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hasException && (
                <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                  Variance or missing count will be recorded as an exception. Add a remark before sign-off.
                </div>
              )}
              <div>
                <label className={labelCls} htmlFor="verify-status">Verification status</label>
                <select
                  id="verify-status"
                  name="verificationStatus"
                  className={inputCls}
                  value={hasException ? "Exception" : form.verificationStatus}
                  disabled={hasException}
                  onChange={(e) => setForm((p) => ({ ...p, verificationStatus: e.target.value }))}
                >
                  {VERIFY_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="verify-date">Verification date</label>
                <input
                  id="verify-date"
                  name="verificationDate"
                  type="date"
                  className={inputCls}
                  value={form.verificationDate}
                  onChange={(e) => setForm((p) => ({ ...p, verificationDate: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="remarks">
                  Remarks {hasException ? <span className="text-rose-500">*</span> : null}
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  className={`${inputCls} h-28 py-2.5`}
                  value={form.remarks}
                  onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
                  placeholder="Condition notes, location changes, missing parts…"
                />
              </div>
              <div>
                <p className={labelCls}>Inspecting officer</p>
                <p className="h-10 flex items-center px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">
                  {user?.name || "Officer"}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" className="text-xs" disabled={currentStep === 1} onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}>
              <ChevronLeft className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Previous
            </Button>
            {currentStep < 3 ? (
              <Button type="submit" className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs font-bold">
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
              </Button>
            ) : (
              <Button type="submit" disabled={saving} className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs font-bold min-w-[180px]">
                {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : <ClipboardCheck className="h-4 w-4 mr-1.5" aria-hidden="true" />}
                {saving ? "Saving…" : "Save verification"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
