import * as React from "react";
import {
  ArrowLeft, Plus, Loader2, Save, Send, CheckCircle2, Trash2,
  ChevronRight, Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildReportingYearOptions } from "../monthly/reportingYears";
import AccreditedProviderSelect from "../stateOffice/AccreditedProviderSelect";
import {
  OWNERSHIP_OPTIONS, FACILITY_TYPE_OPTIONS, COMPLAINT_CATEGORIES,
  ESCALATION_OPTIONS, ENFORCEMENT_ACTIONS, COMPLIANCE_SECTIONS,
  COMPLIANCE_RATINGS, CONFIRMATION_OPTIONS,
  quarterFromWeek, ratingLabel,
  COMPLIANCE_LIFECYCLE, getComplianceStepCompletion, complianceStepLabel,
  type ComplianceFormStep,
} from "./complianceConstants";

export type FormStep = ComplianceFormStep;
export const FORM_STEPS = COMPLIANCE_LIFECYCLE;

const inputCls = "h-10 rounded-xl border-[#d4e8dc] bg-[#f4f7f5] text-sm w-full";
const readOnlyCls = `${inputCls} bg-slate-50 text-slate-700`;

function ReqLabel({ children }: { children: React.ReactNode }) {
  return <Label className="text-xs">{children} <span className="text-red-500">*</span></Label>;
}

export type Finding = { _key: string; section: string; indicator: string; status: string; remarks: string };
export type Violation = { _key: string; nature_of_violation: string; nhia_act_section: string; occurrences: string; action_taken: string };
export type Enforcement = { _key: string; enforcement_action: string; details: string };

const STAGE_HINTS: Partial<Record<FormStep, string>> = {
  findings: "Record each compliance observation as a separate finding. At least one finding is required before final submission.",
  complaints: "Summarize complaints received at this facility during the reporting period.",
  violations: "Record any NHIA Act or guideline violations observed (optional).",
  enforcement: "Record enforcement actions taken and complete the final review before submitting the report.",
};

const STAGE_SAVE_LABEL: Record<FormStep, string> = {
  header: "",
  findings: "Save & Continue",
  complaints: "Save & Continue",
  violations: "Save & Continue",
  enforcement: "Save Enforcement",
};

export interface ComplianceReportFormProps {
  refId: string | null;
  reportRegistered: boolean;
  reportStatus: string;
  reportWeek: string;
  formStep: FormStep;
  setFormStep: (s: FormStep) => void;
  saving: boolean;
  lockZone: boolean;
  lockState: boolean;
  zones: { id: number; label: string }[];
  stateOpts: { id: number; label: string }[];
  zoneId: string;
  stateId: string;
  zoneDisplay: string;
  stateDisplay: string;
  onZoneChange: (v: string) => void;
  onStateChange: (v: string) => void;
  reportYear: string;
  setReportYear: (v: string) => void;
  officerName: string;
  setOfficerName: (v: string) => void;
  officerStaffId: string;
  setOfficerStaffId: (v: string) => void;
  submitDate: string;
  setSubmitDate: (v: string) => void;
  statusConfirmed: string;
  setStatusConfirmed: (v: string) => void;
  followUp: boolean;
  setFollowUp: (v: boolean) => void;
  certification: string;
  setCertification: (v: string) => void;
  facilityProviderId: string;
  onFacilitySelect: (p: { id: string; name: string; code: string; address?: string | null; facility_type?: string | null } | null) => void;
  facilityName: string;
  facilityCode: string;
  facilityType: string;
  setFacilityType: (v: string) => void;
  ownership: string;
  setOwnership: (v: string) => void;
  facilityAddress: string;
  setFacilityAddress: (v: string) => void;
  findings: Finding[];
  setFindings: React.Dispatch<React.SetStateAction<Finding[]>>;
  findingDraft: { section: string; indicator: string; status: string; remarks: string };
  setFindingDraft: React.Dispatch<React.SetStateAction<{ section: string; indicator: string; status: string; remarks: string }>>;
  sectionIndicators: string[];
  complaintsReceived: string;
  setComplaintsReceived: (v: string) => void;
  resolvedAtFacility: string;
  setResolvedAtFacility: (v: string) => void;
  complaintCategories: string[];
  toggleCategory: (cat: string) => void;
  escalatedTo: string;
  setEscalatedTo: (v: string) => void;
  complaintSummary: string;
  setComplaintSummary: (v: string) => void;
  violations: Violation[];
  setViolations: React.Dispatch<React.SetStateAction<Violation[]>>;
  violationDraft: Violation;
  setViolationDraft: React.Dispatch<React.SetStateAction<Violation>>;
  enforcements: Enforcement[];
  setEnforcements: React.Dispatch<React.SetStateAction<Enforcement[]>>;
  enforcementDraft: { enforcement_action: string; details: string };
  setEnforcementDraft: React.Dispatch<React.SetStateAction<{ enforcement_action: string; details: string }>>;
  stateRemarks: string;
  setStateRemarks: (v: string) => void;
  reviewedBy: string;
  setReviewedBy: (v: string) => void;
  onCancel: () => void;
  onValidateStep: (step: FormStep) => string | null;
  onSaveAndContinue: () => void;
  onSaveStage: () => void;
  onSubmit: () => void;
  uid: () => string;
  statusBadge?: React.ReactNode;
}

export default function ComplianceReportForm(props: ComplianceReportFormProps) {
  const {
    refId, reportRegistered, reportStatus, reportWeek, formStep, setFormStep, saving, lockZone, lockState,
    zones, stateOpts, zoneId, stateId, zoneDisplay, stateDisplay,
    onZoneChange, onStateChange, reportYear, setReportYear,
    officerName, setOfficerName, officerStaffId, setOfficerStaffId,
    submitDate, setSubmitDate, statusConfirmed, setStatusConfirmed,
    followUp, setFollowUp, certification, setCertification,
    facilityProviderId, onFacilitySelect, facilityName, facilityCode,
    facilityType, setFacilityType, ownership, setOwnership,
    facilityAddress, setFacilityAddress,
    findings, setFindings, findingDraft, setFindingDraft, sectionIndicators,
    complaintsReceived, setComplaintsReceived, resolvedAtFacility, setResolvedAtFacility,
    complaintCategories, toggleCategory, escalatedTo, setEscalatedTo,
    complaintSummary, setComplaintSummary,
    violations, setViolations, violationDraft, setViolationDraft,
    enforcements, setEnforcements, enforcementDraft, setEnforcementDraft,
    stateRemarks, setStateRemarks, reviewedBy, setReviewedBy,
    onCancel, onSaveAndContinue, onSaveStage, onSubmit, uid, statusBadge,
  } = props;

  const completion = getComplianceStepCompletion({
    refId,
    registered: reportRegistered,
    findingsCount: findings.length,
    complaintsReceived,
    complaintSummary,
    complaintCategoriesCount: complaintCategories.length,
    violationsCount: violations.length,
    enforcementsCount: enforcements.length,
    reviewedBy,
    stateRemarks,
  });

  const renderLifecycleStepper = () => (
    <Card className="rounded-2xl border-[#d4e8dc] shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-[#d4e8dc]">
          {COMPLIANCE_LIFECYCLE.map((stage) => {
            const done = completion[stage.id];
            const isActive = formStep === stage.id;
            const isCurrent = !done && COMPLIANCE_LIFECYCLE.find(s => !completion[s.id])?.id === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setFormStep(stage.id)}
                className={`flex items-start gap-3 p-4 text-left transition-colors ${
                  isActive ? "bg-[#e8f5ee]" : "bg-white hover:bg-[#f8fbf9]"
                }`}
              >
                <div className={`mt-0.5 shrink-0 ${done ? "text-[#25a872]" : isCurrent ? "text-amber-600" : "text-slate-300"}`}>
                  {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${isActive ? "text-[#145c3f]" : "text-slate-700"}`}>{stage.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{stage.description}</p>
                  {isCurrent && (
                    <Badge variant="outline" className="mt-1.5 text-[9px]">Current stage</Badge>
                  )}
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-[#25a872] ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-[#d4e8dc] bg-[#f8fbf9] flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-500">Report ID:</span>
          <span className="text-xs font-mono font-bold text-primary">{refId}</span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500">Status:</span>
          {statusBadge ?? (
            <Badge variant="outline" className="text-[10px] capitalize">{reportStatus}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderHeaderSection = (readOnly: boolean) => (
    <Card className="rounded-2xl border-[#d4e8dc] w-full">
      <CardHeader>
        <CardTitle className="text-base">Report Header</CardTitle>
        <CardDescription>Q{quarterFromWeek(Number(reportWeek))} · {reportYear}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          {readOnly ? <Label className="text-xs">Zone</Label> : <ReqLabel>Zone</ReqLabel>}
          {readOnly ? (
            <Input className={readOnlyCls} value={zoneDisplay} readOnly />
          ) : (
            <Select value={zoneId} onValueChange={onZoneChange} disabled={lockZone}>
              <SelectTrigger className={inputCls} displayValue={zoneDisplay}>
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>{zones.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.label}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-1.5">
          {readOnly ? <Label className="text-xs">State</Label> : <ReqLabel>State</ReqLabel>}
          {readOnly ? (
            <Input className={readOnlyCls} value={stateDisplay} readOnly />
          ) : (
            <Select value={stateId} onValueChange={onStateChange} disabled={lockState || !zoneId}>
              <SelectTrigger className={inputCls} displayValue={stateDisplay}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>{stateOpts.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-1.5">
          {readOnly ? <Label className="text-xs">Reporting Year</Label> : <ReqLabel>Reporting Year</ReqLabel>}
          {readOnly ? (
            <Input className={readOnlyCls} value={reportYear} readOnly />
          ) : (
            <Select value={reportYear} onValueChange={setReportYear}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent>{buildReportingYearOptions().map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-1.5">
          {readOnly ? <Label className="text-xs">Compliance Officer</Label> : <ReqLabel>Compliance Officer</ReqLabel>}
          <Input className={readOnly ? readOnlyCls : inputCls} value={officerName}
            onChange={e => setOfficerName(e.target.value)} readOnly={readOnly} />
        </div>
        <div className="space-y-1.5">
          {readOnly ? <Label className="text-xs">Staff ID</Label> : <ReqLabel>Staff ID</ReqLabel>}
          <Input className={readOnly ? readOnlyCls : inputCls} value={officerStaffId}
            onChange={e => setOfficerStaffId(e.target.value)} readOnly={readOnly} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Date Submitted</Label>
          <Input className={readOnly ? readOnlyCls : inputCls} type="date" value={submitDate}
            onChange={e => setSubmitDate(e.target.value)} readOnly={readOnly} />
        </div>
      </CardContent>
    </Card>
  );

  const renderFacilitySection = (readOnly: boolean) => (
    <Card className="rounded-2xl border-[#d4e8dc] w-full">
      <CardHeader>
        <CardTitle className="text-base">Facility Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
          {readOnly ? <Label className="text-xs">Facility Name</Label> : <ReqLabel>Facility Name</ReqLabel>}
          {readOnly ? (
            <Input className={readOnlyCls} value={facilityName} readOnly />
          ) : (
            <>
              <AccreditedProviderSelect
                key={`hcp-${stateId}`}
                type="hcp"
                stateId={stateId}
                value={facilityProviderId}
                placeholder="Select facility"
                onChange={onFacilitySelect}
                disabled={!stateId}
              />
              {!facilityProviderId && facilityName && (
                <p className="text-xs text-amber-700">Saved facility: {facilityName}. Select from the list to refresh details.</p>
              )}
            </>
          )}
        </div>
        <div className="space-y-1.5">
          <ReqLabel>Facility Code</ReqLabel>
          <Input className={`${readOnlyCls} font-mono`} value={facilityCode} readOnly placeholder="NHIA provider code" />
        </div>
        <div className="space-y-1.5">
          {readOnly ? <Label className="text-xs">Facility Type</Label> : <ReqLabel>Facility Type</ReqLabel>}
          {readOnly ? (
            <Input className={readOnlyCls} value={facilityType} readOnly />
          ) : (
            <Select value={facilityType} onValueChange={setFacilityType}>
              <SelectTrigger className={inputCls}><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{FACILITY_TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-1.5">
          {readOnly ? <Label className="text-xs">Ownership</Label> : <ReqLabel>Ownership</ReqLabel>}
          {readOnly ? (
            <Input className={readOnlyCls} value={ownership} readOnly />
          ) : (
            <Select value={ownership} onValueChange={setOwnership}>
              <SelectTrigger className={inputCls}><SelectValue placeholder="Select ownership" /></SelectTrigger>
              <SelectContent>{OWNERSHIP_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
          <Label className="text-xs">Facility Address</Label>
          <Input className={readOnly ? readOnlyCls : inputCls} value={facilityAddress}
            onChange={e => setFacilityAddress(e.target.value)} readOnly={readOnly}
            placeholder="Address from NHIA list or enter manually" />
        </div>
      </CardContent>
    </Card>
  );

  const renderFindingsSection = () => (
    <Card className="rounded-2xl border-[#d4e8dc] w-full">
      <CardHeader>
        <CardTitle className="text-base">Compliance Findings</CardTitle>
        <CardDescription>Each finding is a separate observation — at least one required before submission</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-[#f4f7f5] border border-[#d4e8dc]">
          <Select value={findingDraft.section} onValueChange={v => setFindingDraft(d => ({ ...d, section: v, indicator: "" }))}>
            <SelectTrigger className={inputCls}><SelectValue placeholder="Section" /></SelectTrigger>
            <SelectContent>{Object.keys(COMPLIANCE_SECTIONS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={findingDraft.indicator} onValueChange={v => setFindingDraft(d => ({ ...d, indicator: v }))}>
            <SelectTrigger className={inputCls}><SelectValue placeholder="Indicator" /></SelectTrigger>
            <SelectContent>{sectionIndicators.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={findingDraft.status} onValueChange={v => setFindingDraft(d => ({ ...d, status: v }))}>
            <SelectTrigger className={inputCls}><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{COMPLIANCE_RATINGS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
          <Input className={inputCls} placeholder="Remarks" value={findingDraft.remarks}
            onChange={e => setFindingDraft(d => ({ ...d, remarks: e.target.value }))} />
          <Button type="button" variant="outline" className="md:col-span-2" onClick={() => {
            if (!findingDraft.section || !findingDraft.indicator) return;
            setFindings(p => [...p, { _key: uid(), ...findingDraft }]);
            setFindingDraft({ section: "", indicator: "", status: "fully_compliant", remarks: "" });
          }}><Plus className="w-4 h-4 mr-1" /> Add Finding</Button>
        </div>
        {findings.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No findings recorded.</p>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Section</TableHead><TableHead>Indicator</TableHead>
              <TableHead>Status</TableHead><TableHead>Remarks</TableHead><TableHead />
            </TableRow></TableHeader>
            <TableBody>
              {findings.map(f => (
                <TableRow key={f._key}>
                  <TableCell className="text-xs">{f.section}</TableCell>
                  <TableCell className="text-xs max-w-[200px]">{f.indicator}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{ratingLabel(f.status)}</Badge></TableCell>
                  <TableCell className="text-xs">{f.remarks || "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setFindings(p => p.filter(x => x._key !== f._key))}>
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const renderComplaintsSection = () => (
    <Card className="rounded-2xl border-[#d4e8dc] w-full">
      <CardHeader><CardTitle className="text-base">Complaint Summary</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Complaints Received</Label>
          <Input className={inputCls} type="number" min={0} value={complaintsReceived}
            onChange={e => setComplaintsReceived(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Resolved at Facility</Label>
          <Input className={inputCls} type="number" min={0} value={resolvedAtFacility}
            onChange={e => setResolvedAtFacility(e.target.value)} />
        </div>
        <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
          <Label className="text-xs">Complaint Categories</Label>
          <div className="flex flex-wrap gap-2">
            {COMPLAINT_CATEGORIES.map(cat => (
              <label key={cat} className="flex items-center gap-1.5 text-xs border rounded-lg px-2 py-1 bg-white">
                <input type="checkbox" checked={complaintCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="w-3.5 h-3.5 accent-[#145c3f]" />
                {cat}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
          <Label className="text-xs">Escalated to</Label>
          <Select value={escalatedTo} onValueChange={setEscalatedTo}>
            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
            <SelectContent>{ESCALATION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
          <Label className="text-xs">Summary of major complaints and actions taken</Label>
          <Input className={inputCls} value={complaintSummary} onChange={e => setComplaintSummary(e.target.value)} />
        </div>
      </CardContent>
    </Card>
  );

  const renderViolationsSection = () => (
    <Card className="rounded-2xl border-[#d4e8dc] w-full">
      <CardHeader><CardTitle className="text-base">Violations Observed</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-[#f4f7f5] border border-[#d4e8dc]">
          <Input className={inputCls} placeholder="Nature of violation" value={violationDraft.nature_of_violation}
            onChange={e => setViolationDraft(d => ({ ...d, nature_of_violation: e.target.value }))} />
          <Input className={inputCls} placeholder="NHIA Act / Guideline section" value={violationDraft.nhia_act_section}
            onChange={e => setViolationDraft(d => ({ ...d, nhia_act_section: e.target.value }))} />
          <Input className={inputCls} type="number" placeholder="Occurrences" value={violationDraft.occurrences}
            onChange={e => setViolationDraft(d => ({ ...d, occurrences: e.target.value }))} />
          <Input className={inputCls} placeholder="Action taken" value={violationDraft.action_taken}
            onChange={e => setViolationDraft(d => ({ ...d, action_taken: e.target.value }))} />
          <Button type="button" variant="outline" className="md:col-span-2" onClick={() => {
            if (!violationDraft.nature_of_violation.trim()) return;
            setViolations(p => [...p, { _key: uid(), ...violationDraft }]);
            setViolationDraft({ nature_of_violation: "", nhia_act_section: "", occurrences: "", action_taken: "" });
          }}><Plus className="w-4 h-4 mr-1" /> Add Violation</Button>
        </div>
        {violations.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No violations recorded (optional).</p>
        ) : violations.map(v => (
          <div key={v._key} className="flex gap-2 items-start text-sm border rounded-xl p-3">
            <div className="flex-1">
              <p className="font-medium">{v.nature_of_violation}</p>
              <p className="text-xs text-muted-foreground">{v.nhia_act_section || "—"} · {v.occurrences || 0} occurrence(s)</p>
              <p className="text-xs mt-1">{v.action_taken || "—"}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setViolations(p => p.filter(x => x._key !== v._key))}>
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderEnforcementSection = () => (
    <Card className="rounded-2xl border-[#d4e8dc] w-full">
      <CardHeader><CardTitle className="text-base">Enforcement Actions &amp; Review</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-[#f4f7f5] border border-[#d4e8dc]">
          <Select value={enforcementDraft.enforcement_action}
            onValueChange={v => setEnforcementDraft(d => ({ ...d, enforcement_action: v }))}>
            <SelectTrigger className={inputCls}><SelectValue placeholder="Enforcement action" /></SelectTrigger>
            <SelectContent>{ENFORCEMENT_ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
          <Input className={inputCls} placeholder="Details" value={enforcementDraft.details}
            onChange={e => setEnforcementDraft(d => ({ ...d, details: e.target.value }))} />
          <Button type="button" variant="outline" className="md:col-span-2" onClick={() => {
            if (!enforcementDraft.enforcement_action) return;
            setEnforcements(p => [...p, { _key: uid(), ...enforcementDraft }]);
            setEnforcementDraft({ enforcement_action: "", details: "" });
          }}><Plus className="w-4 h-4 mr-1" /> Add Action</Button>
        </div>
        {enforcements.map(e => (
          <div key={e._key} className="flex gap-2 items-start text-sm border rounded-xl p-3">
            <div className="flex-1">
              <p className="font-medium">{e.enforcement_action}</p>
              <p className="text-xs text-muted-foreground">{e.details || "—"}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEnforcements(p => p.filter(x => x._key !== e._key))}>
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            </Button>
          </div>
        ))}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">State Office Remarks</Label>
            <Input className={inputCls} value={stateRemarks} onChange={e => setStateRemarks(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Report Reviewed By</Label>
            <Input className={inputCls} value={reviewedBy} onChange={e => setReviewedBy(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Compliance Status Confirmed</Label>
            <Select value={statusConfirmed} onValueChange={setStatusConfirmed}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent>{CONFIRMATION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Certification</Label>
            <Input className={inputCls} value={certification} onChange={e => setCertification(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" checked={followUp} onChange={e => setFollowUp(e.target.checked)}
              id="follow-up" className="w-4 h-4 accent-[#145c3f]" />
            <Label htmlFor="follow-up" className="text-sm">Follow-up Required</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStageContent = () => {
    if (formStep === "header") {
      return (
        <>
          {renderHeaderSection(true)}
          {renderFacilitySection(true)}
        </>
      );
    }
    if (formStep === "findings") return renderFindingsSection();
    if (formStep === "complaints") return renderComplaintsSection();
    if (formStep === "violations") return renderViolationsSection();
    return renderEnforcementSection();
  };

  /* ── Step 1 only — no lifecycle stepper until registered ── */
  if (!reportRegistered) {
    return (
      <div className="flex flex-col h-full bg-slate-50/30">
        <div className="bg-white border-b border-border/50 px-4 md:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight">Facility Compliance Report</h2>
            <p className="text-xs text-muted-foreground truncate">
              Step 1 — Report &amp; facility (findings follow after registration)
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="w-full px-4 md:px-6 py-4 pb-24 space-y-4">
            <Card className="rounded-2xl border-[#d4e8dc] bg-[#f8fbf9]/50">
              <CardContent className="py-3 px-5 flex items-center gap-3">
                <Badge className="bg-[#25a872]">1</Badge>
                <p className="text-xs text-slate-600">
                  Register the report header and facility first. Findings, complaints, violations, and enforcement are recorded separately after this.
                </p>
              </CardContent>
            </Card>
            {renderHeaderSection(false)}
            {renderFacilitySection(false)}
          </div>
        </ScrollArea>

        <div className="sticky bottom-0 z-30 bg-white border-t px-4 md:px-6 py-3 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="bg-[#145c3f] hover:bg-[#0f3d2e] gap-2" onClick={onSaveAndContinue} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save &amp; Continue
          </Button>
        </div>
      </div>
    );
  }

  /* ── Lifecycle tracking — after step 1 is saved ── */
  const canSaveStage = formStep !== "header";
  const stageHint = STAGE_HINTS[formStep];

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="bg-white border-b border-border/50 px-4 md:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight">Compliance Management</h2>
          <p className="text-xs text-muted-foreground truncate">{refId} — lifecycle tracking</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="w-full px-4 md:px-6 py-4 pb-24 space-y-4">
          {renderLifecycleStepper()}
          {stageHint && formStep !== "header" && (
            <Card className="rounded-2xl border-[#d4e8dc] bg-[#f8fbf9]/50">
              <CardContent className="py-3 px-5 text-xs text-slate-600">{stageHint}</CardContent>
            </Card>
          )}
          {renderStageContent()}
        </div>
      </ScrollArea>

      {canSaveStage && (
        <div className="sticky bottom-0 z-30 bg-white border-t px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 hidden sm:block">
            Saving updates only the <strong>{complianceStepLabel(formStep)}</strong> stage
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="outline" onClick={onCancel}>Back to List</Button>
            <Button variant="outline" onClick={onSaveStage} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {STAGE_SAVE_LABEL[formStep]}
            </Button>
            {formStep === "enforcement" && (
              <Button className="bg-[#145c3f] hover:bg-[#0f3d2e] gap-2" onClick={onSubmit} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Report
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
