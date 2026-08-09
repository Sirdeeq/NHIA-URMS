import React, { useEffect, useState } from "react";
import PageLayout from "../../components/PageLayout";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/src/store/store";
import { stockApi } from "@/lib/api";
import {
  PackageCheck,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Building2,
  FileText,
  ListOrdered,
  User,
  Plus,
  Trash2,
  MapPin,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const GOODS_CATEGORIES = [
  "Office Furniture",
  "Office Equipment",
  "Computer Equipment",
  "Motor Vehicles",
];

const PHYSICAL_CONDITIONS = ["Excellent", "Good", "Fair", "Poor", "Defective"];

type LineItem = {
  description: string;
  quantityDelivered: number;
  unitPrice: number;
};

type Option = { id: number; label: string };

function nextControlNumber() {
  const y = new Date().getFullYear();
  const seq = String(Date.now()).slice(-4);
  return `SVC-${y}-${seq}`;
}

export function NewSupplyVerificationView() {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  const [zones, setZones] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [formData, setFormData] = useState({
    supplyRefNo: nextControlNumber(),
    certificateDate: new Date().toISOString().slice(0, 10),
    goodsCategory: "Office Equipment",
    storeSubcategory: "",
    procurementInstrument: "",
    procurementDate: new Date().toISOString().slice(0, 10),
    supplierName: "",
    contractorAddress: "",
    purchaseOrderRef: "",
    srvNo: "",
    srvDate: new Date().toISOString().slice(0, 10),
    physicalCondition: "Good",
    verdict: "VERIFIED_PASSED",
    specificationMatch: true,
    priceConformance: true,
    classification: "ASSET_REGISTER" as "ASSET_REGISTER" | "STORE_INVENTORY",
    zone_id: "",
    state_id: "",
    department_id: "",
    unit_id: "",
    verifiedBy: user?.name || "",
    officerDesignation: user?.role_label || user?.role?.replace(/-/g, " ") || "",
    signOffDate: new Date().toISOString().slice(0, 10),
    approvalStatus: "PENDING",
    remarks: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantityDelivered: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    stockApi.getZones().then((r) => {
      setZones((r.data || []).map((z: any) => ({ id: z.id, label: z.description })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.name) {
      setFormData((p) => ({ ...p, verifiedBy: p.verifiedBy || user.name }));
    }
  }, [user?.name]);

  const setField = (key: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleZoneChange = async (zoneId: string) => {
    setField("zone_id", zoneId);
    setField("state_id", "");
    setField("department_id", "");
    setField("unit_id", "");
    setStates([]);
    setDepartments([]);
    setUnits([]);
    if (!zoneId) return;
    try {
      const r = await stockApi.getStates(zoneId);
      setStates((r.data || []).map((s: any) => ({ id: s.id, label: s.description })));
    } catch {
      setStates([]);
    }
  };

  const handleStateChange = async (stateId: string) => {
    setField("state_id", stateId);
    setField("department_id", "");
    setField("unit_id", "");
    setDepartments([]);
    setUnits([]);
    if (!stateId) return;
    try {
      const r = await stockApi.getDepartments(stateId);
      setDepartments((r.data || []).map((d: any) => ({ id: d.id, label: d.name })));
    } catch {
      setDepartments([]);
    }
  };

  const handleDeptChange = async (deptId: string) => {
    setField("department_id", deptId);
    setField("unit_id", "");
    setUnits([]);
    if (!deptId) return;
    try {
      const r = await stockApi.getUnits(deptId);
      setUnits((r.data || []).map((u: any) => ({ id: u.id, label: u.name })));
    } catch {
      setUnits([]);
    }
  };

  const updateLine = (index: number, key: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = lineItems.filter((l) => l.description.trim());
    if (validLines.length === 0) {
      toast.error("Add at least one line item");
      return;
    }
    if (!formData.supplierName.trim()) {
      toast.error("Contractor / supplier name is required");
      return;
    }

    setSaving(true);
    try {
      const first = validLines[0];
      const payload = {
        ...formData,
        zone_id: formData.zone_id ? Number(formData.zone_id) : null,
        state_id: formData.state_id ? Number(formData.state_id) : null,
        department_id: formData.department_id ? Number(formData.department_id) : null,
        unit_id: formData.unit_id ? Number(formData.unit_id) : null,
        physicalCondition: formData.physicalCondition.toUpperCase(),
        lineItems: validLines,
        expectedItemName: first.description,
        suppliedItemName: first.description,
        expectedQuantity: validLines.reduce((s, l) => s + Number(l.quantityDelivered || 0), 0),
        suppliedQuantity: validLines.reduce((s, l) => s + Number(l.quantityDelivered || 0), 0),
      };

      const res = await stockApi.createSupplyVerification(payload);
      if (!res.success) throw new Error("Save failed");

      setSuccessMsg(true);
      const posted = (res as any).inventoryPosted?.length || 0;
      const savedId = res.data?.id;
      toast.success(
        formData.classification === "STORE_INVENTORY"
          ? `Saved — ${posted} item(s) posted to Inventory Catalog`
          : "Supply verification saved"
      );

      // Always open the certificate first so the officer can review/print it
      setTimeout(() => {
        if (savedId) {
          navigate(`/store-management/verification/supply/${savedId}`, {
            state: {
              justCreated: true,
              classification: formData.classification,
              prefill:
                formData.classification === "ASSET_REGISTER"
                  ? {
                      name: first.description,
                      primaryCategory: formData.goodsCategory,
                      acquisitionCost: first.unitPrice,
                      zone_id: formData.zone_id,
                      state_id: formData.state_id,
                      department_id: formData.department_id,
                      unit_id: formData.unit_id,
                    }
                  : undefined,
            },
          });
        } else if (formData.classification === "ASSET_REGISTER") {
          navigate("/store-management/assets/register");
        } else {
          navigate("/store-management/inventory/items");
        }
      }, 700);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save verification");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#145c3f]/30 focus:border-[#145c3f]";
  const labelCls = "block text-xs font-bold text-slate-700 mb-1";
  const sectionCls = "rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm";

  return (
    <PageLayout
      title="Stock Verification Certificate of Completion"
      description="Certificate of completion for supply / works / services — inspect before asset register or store inventory posting"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/store-management/verification/supply")}
          className="text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Supply Verifications
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="w-full space-y-5 text-sm">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            Verification submitted. Routing to{" "}
            {formData.classification === "ASSET_REGISTER"
              ? "Asset Register"
              : "Store Inventory"}
            …
          </div>
        )}

        {/* Classification */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <PackageCheck className="h-4 w-4 text-[#145c3f]" />
            Goods Classification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Goods Category</label>
              <select
                className={inputCls}
                value={formData.goodsCategory}
                onChange={(e) => setField("goodsCategory", e.target.value)}
              >
                {GOODS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Store subcategory</label>
              <input
                className={inputCls}
                placeholder="e.g. Stationeries, tissue"
                value={formData.storeSubcategory}
                onChange={(e) => setField("storeSubcategory", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Post-verification route</label>
              <select
                className={inputCls}
                value={formData.classification}
                onChange={(e) => setField("classification", e.target.value)}
              >
                <option value="ASSET_REGISTER">Asset Register (capital / tagged)</option>
                <option value="STORE_INVENTORY">Store Inventory (consumables)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-sky-600" />
            Location (Zone / State / Department / Unit)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Zone</label>
              <select className={inputCls} value={formData.zone_id} onChange={(e) => handleZoneChange(e.target.value)}>
                <option value="">Select zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>State</label>
              <select className={inputCls} value={formData.state_id} onChange={(e) => handleStateChange(e.target.value)} disabled={!formData.zone_id}>
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Department</label>
              <select className={inputCls} value={formData.department_id} onChange={(e) => handleDeptChange(e.target.value)} disabled={!formData.state_id}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <select className={inputCls} value={formData.unit_id} onChange={(e) => setField("unit_id", e.target.value)} disabled={!formData.department_id}>
                <option value="">Select unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 1. Identification */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-[#145c3f]" />
            1. Identification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Control Number (PK)</label>
              <input className={`${inputCls} font-mono`} required value={formData.supplyRefNo} onChange={(e) => setField("supplyRefNo", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Certificate Date</label>
              <input type="date" className={inputCls} required value={formData.certificateDate} onChange={(e) => setField("certificateDate", e.target.value)} />
            </div>
          </div>
        </div>

        {/* 2. Transaction */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-sky-600" />
            2. Transaction & Contract Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Ref: Instrument of Procurement</label>
              <input className={inputCls} value={formData.procurementInstrument} onChange={(e) => setField("procurementInstrument", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Procurement Date</label>
              <input type="date" className={inputCls} value={formData.procurementDate} onChange={(e) => setField("procurementDate", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Purchase Order Ref</label>
              <input className={`${inputCls} font-mono`} value={formData.purchaseOrderRef} onChange={(e) => setField("purchaseOrderRef", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Contractor Name *</label>
              <input className={inputCls} required value={formData.supplierName} onChange={(e) => setField("supplierName", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Contractor Address</label>
              <input className={inputCls} value={formData.contractorAddress} onChange={(e) => setField("contractorAddress", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Store Receipt Voucher (SRV) No.</label>
              <input className={`${inputCls} font-mono`} value={formData.srvNo} onChange={(e) => setField("srvNo", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>SRV Date</label>
              <input type="date" className={inputCls} value={formData.srvDate} onChange={(e) => setField("srvDate", e.target.value)} />
            </div>
          </div>
        </div>

        {/* 3. Compliance */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            3. Verification & Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Physical Condition</label>
              <select className={inputCls} value={formData.physicalCondition} onChange={(e) => setField("physicalCondition", e.target.value)}>
                {PHYSICAL_CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Verification Status</label>
              <select className={inputCls} value={formData.verdict} onChange={(e) => setField("verdict", e.target.value)}>
                <option value="VERIFIED_PASSED">Verified & Passed</option>
                <option value="PARTIAL_PASS">Partial Pass</option>
                <option value="FAILED">Failed / Rejected</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Specification Conformity</label>
              <select
                className={inputCls}
                value={formData.specificationMatch ? "Yes" : "No"}
                onChange={(e) => setField("specificationMatch", e.target.value === "Yes")}
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Price Conformance</label>
              <select
                className={inputCls}
                value={formData.priceConformance ? "Yes" : "No"}
                onChange={(e) => setField("priceConformance", e.target.value === "Yes")}
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Line items */}
        <div className={sectionCls}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <ListOrdered className="h-4 w-4 text-amber-600" />
              4. Line Items / Deliverables
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() =>
                setLineItems((p) => [...p, { description: "", quantityDelivered: 1, unitPrice: 0 }])
              }
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add line
            </Button>
          </div>
          <p className="text-[11px] text-slate-500">
            Control Number <span className="font-mono font-bold">{formData.supplyRefNo}</span> links each line (FK) to this certificate.
          </p>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-600">
                <tr>
                  <th className="p-3 w-28">Control No.</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 w-28">Qty Delivered</th>
                  <th className="p-3 w-36">Unit Price (₦)</th>
                  <th className="p-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((row, i) => (
                  <tr key={i}>
                    <td className="p-2 font-mono text-slate-500">{formData.supplyRefNo}</td>
                    <td className="p-2">
                      <input
                        className={inputCls}
                        required={i === 0}
                        placeholder="Item description"
                        value={row.description}
                        onChange={(e) => updateLine(i, "description", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        value={row.quantityDelivered}
                        onChange={(e) => updateLine(i, "quantityDelivered", Number(e.target.value))}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={inputCls}
                        value={row.unitPrice}
                        onChange={(e) => updateLine(i, "unitPrice", Number(e.target.value))}
                      />
                    </td>
                    <td className="p-2">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                          onClick={() => setLineItems((p) => p.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Sign-off */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-slate-600" />
            5. Sign-off & Signature Record
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Verifying Officer Name</label>
              <input className={inputCls} required value={formData.verifiedBy} onChange={(e) => setField("verifiedBy", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Officer Designation</label>
              <input className={inputCls} value={formData.officerDesignation} onChange={(e) => setField("officerDesignation", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Sign-off Date</label>
              <input type="date" className={inputCls} value={formData.signOffDate} onChange={(e) => setField("signOffDate", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Approval Status</label>
              <select className={inputCls} value={formData.approvalStatus} onChange={(e) => setField("approvalStatus", e.target.value)}>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className={labelCls}>Remarks</label>
              <textarea
                className={`${inputCls} min-h-[80px]`}
                value={formData.remarks}
                onChange={(e) => setField("remarks", e.target.value)}
                placeholder="Optional notes from inspection"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 pb-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white font-bold text-xs min-w-[220px]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <PackageCheck className="h-4 w-4 mr-1.5" />
            )}
            Submit Certificate & Route Item
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}

export default NewSupplyVerificationView;
