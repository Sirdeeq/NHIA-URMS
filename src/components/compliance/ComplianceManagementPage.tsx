import * as React from "react";
import {
  ArrowLeft, Plus, Loader2, RefreshCw, Eye, Save, Send,
  FileText, CheckCircle2, Clock, Trash2, XCircle, Pencil,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { complianceApi, stockApi } from "@/lib/api";
import { useAppSelector } from "@/src/store/hooks";
import { buildReportingYearOptions } from "../monthly/reportingYears";
import { ALL_STATES, useMonthlyStateFilter } from "../monthly/useMonthlyStateFilter";
import {
  OWNERSHIP_OPTIONS, FACILITY_TYPE_OPTIONS, COMPLAINT_CATEGORIES,
  ESCALATION_OPTIONS, ENFORCEMENT_ACTIONS, COMPLIANCE_SECTIONS,
  COMPLIANCE_RATINGS, CONFIRMATION_OPTIONS,
  currentISOWeek, quarterFromWeek, ratingLabel,
} from "./complianceConstants";
import { labelOf, formatCount } from "../stateOffice/constants";

const uid = () => Math.random().toString(36).slice(2);

function pickGeoLabel(
  options: { id: number; label?: string; description?: string }[],
  value: string,
  fallback: string,
) {
  if (!value) return fallback;
  const match = options.find(o => String(o.id) === value);
  return match?.description ?? match?.label ?? fallback;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
    </div>
  );
}

const STATUS_CFG = {
  draft:     { label: "Draft",     cls: "bg-slate-100 text-slate-600 border-slate-200",       icon: <FileText className="w-3 h-3" /> },
  submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-700 border-blue-200",          icon: <Clock className="w-3 h-3" /> },
  approved:  { label: "Approved",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
};

interface Props {
  onBack: () => void;
  defaultZoneId?: string | null;
  defaultStateId?: string | null;
}

type Finding = { _key: string; section: string; indicator: string; status: string; remarks: string };
type Violation = { _key: string; nature_of_violation: string; nhia_act_section: string; occurrences: string; action_taken: string };
type Enforcement = { _key: string; enforcement_action: string; details: string };

const inputCls = "h-10 rounded-xl border-[#d4e8dc] bg-[#f4f7f5] text-sm";

export default function ComplianceManagementPage({ onBack, defaultZoneId, defaultStateId }: Props) {
  const authUser = useAppSelector(s => s.auth.user);
  const [mode, setMode] = React.useState<"list" | "form" | "view">("list");
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [refId, setRefId] = React.useState<string | null>(null);
  const [viewReport, setViewReport] = React.useState<any>(null);

  const {
    showStateFilter, filterState, setFilterState, apiStateId, stateFilterActive,
  } = useMonthlyStateFilter(defaultStateId, defaultZoneId);

  const zoneLocked = !!defaultZoneId;
  const stateLocked = !!defaultStateId;
  const [filterZone, setFilterZone] = React.useState(defaultZoneId ?? "all");
  const [dashboardStates, setDashboardStates] = React.useState<{ id: number; description: string }[]>([]);
  const [filterYear, setFilterYear] = React.useState(String(new Date().getFullYear()));
  const [filterStatus, setFilterStatus] = React.useState("all");

  const [zones, setZones] = React.useState<{ id: number; label: string }[]>([]);
  const [stateOpts, setStateOpts] = React.useState<{ id: number; label: string }[]>([]);
  const [zoneLabel, setZoneLabel] = React.useState("");
  const [stateLabel, setStateLabel] = React.useState("");
  const [zoneId, setZoneId] = React.useState(defaultZoneId ?? "");
  const [stateId, setStateId] = React.useState(defaultStateId ?? "");
  const [reportYear, setReportYear] = React.useState(String(new Date().getFullYear()));
  const [reportWeek, setReportWeek] = React.useState(String(currentISOWeek()));

  const [officerName, setOfficerName] = React.useState(authUser?.name ?? "");
  const [officerStaffId, setOfficerStaffId] = React.useState(authUser?.staff_id ?? "");
  const [submitDate, setSubmitDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [reviewedBy, setReviewedBy] = React.useState("");
  const [statusConfirmed, setStatusConfirmed] = React.useState("pending");
  const [followUp, setFollowUp] = React.useState(false);
  const [certification, setCertification] = React.useState("");
  const [stateRemarks, setStateRemarks] = React.useState("");

  const [facilityName, setFacilityName] = React.useState("");
  const [facilityCode, setFacilityCode] = React.useState("");
  const [facilityType, setFacilityType] = React.useState("");
  const [ownership, setOwnership] = React.useState("");
  const [facilityAddress, setFacilityAddress] = React.useState("");

  const [complaintsReceived, setComplaintsReceived] = React.useState("");
  const [complaintCategories, setComplaintCategories] = React.useState<string[]>([]);
  const [resolvedAtFacility, setResolvedAtFacility] = React.useState("");
  const [escalatedTo, setEscalatedTo] = React.useState("none");
  const [complaintSummary, setComplaintSummary] = React.useState("");

  const [findings, setFindings] = React.useState<Finding[]>([]);
  const [violations, setViolations] = React.useState<Violation[]>([]);
  const [enforcements, setEnforcements] = React.useState<Enforcement[]>([]);

  const [findingDraft, setFindingDraft] = React.useState({ section: "", indicator: "", status: "fully_compliant", remarks: "" });
  const [violationDraft, setViolationDraft] = React.useState({ nature_of_violation: "", nhia_act_section: "", occurrences: "", action_taken: "" });
  const [enforcementDraft, setEnforcementDraft] = React.useState({ enforcement_action: "", details: "" });

  React.useEffect(() => {
    stockApi.getZones().then(r =>
      setZones(r.data.map((z: any) => ({ id: z.id, label: z.description }))),
    ).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (defaultZoneId) setFilterZone(defaultZoneId);
  }, [defaultZoneId]);

  React.useEffect(() => {
    const zid = filterZone !== "all" ? filterZone : (defaultZoneId || "");
    if (!zid) { setDashboardStates([]); return; }
    stockApi.getStates(zid).then(r => setDashboardStates(r.data)).catch(() => setDashboardStates([]));
    if (!stateLocked) setFilterState(ALL_STATES);
  }, [filterZone, defaultZoneId, stateLocked, setFilterState]);

  React.useEffect(() => {
    if (!zoneId) { setStateOpts([]); return; }
    stockApi.getStates(zoneId).then(r =>
      setStateOpts(r.data.map((s: any) => ({ id: s.id, label: s.description }))),
    ).catch(() => {});
  }, [zoneId]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await complianceApi.list({
        zone_id: (filterZone && filterZone !== "all") ? filterZone : (defaultZoneId ?? undefined),
        state_id: apiStateId || defaultStateId || undefined,
        year: filterYear !== "all" ? filterYear : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });
      setReports(res.data);
    } catch (err: any) {
      toast.error("Failed to load reports", { description: err.message });
    } finally { setLoading(false); }
  }, [defaultZoneId, defaultStateId, filterZone, apiStateId, filterYear, filterStatus]);

  React.useEffect(() => { if (mode === "list") load(); }, [mode, load]);

  const counts = React.useMemo(() => ({
    total: reports.length,
    draft: reports.filter(r => r.status === "draft").length,
    submitted: reports.filter(r => r.status === "submitted").length,
    approved: reports.filter(r => r.status === "approved").length,
  }), [reports]);

  const yearOptions = React.useMemo(
    () => buildReportingYearOptions(reports.map(r => r.reporting_year)),
    [reports],
  );

  const hasFilters = filterYear !== "all" || filterStatus !== "all" || stateFilterActive
    || (filterZone !== "all" && !zoneLocked);

  const clearFilters = () => {
    setFilterYear(String(new Date().getFullYear()));
    setFilterStatus("all");
    if (!zoneLocked) setFilterZone("all");
    if (showStateFilter) setFilterState(ALL_STATES);
  };

  const showLocationCols = !defaultStateId || !defaultZoneId;

  const resetForm = () => {
    setSelectedId(null); setRefId(null); setViewReport(null);
    setZoneId(defaultZoneId ?? ""); setStateId(defaultStateId ?? "");
    setZoneLabel(""); setStateLabel("");
    setReportYear(String(new Date().getFullYear()));
    setReportWeek(String(currentISOWeek()));
    setOfficerName(authUser?.name ?? ""); setOfficerStaffId(authUser?.staff_id ?? "");
    setSubmitDate(new Date().toISOString().slice(0, 10));
    setReviewedBy(""); setStatusConfirmed("pending"); setFollowUp(false);
    setCertification(""); setStateRemarks("");
    setFacilityName(""); setFacilityCode(""); setFacilityType("");
    setOwnership(""); setFacilityAddress("");
    setComplaintsReceived(""); setComplaintCategories([]);
    setResolvedAtFacility(""); setEscalatedTo("none"); setComplaintSummary("");
    setFindings([]); setViolations([]); setEnforcements([]);
  };

  const applyReport = (v: any) => {
    setSelectedId(v.id); setRefId(v.reference_id);
    setZoneId(String(v.zone_id)); setStateId(String(v.state_id));
    setZoneLabel(v.zone?.description ?? "");
    setStateLabel(v.state?.description ?? "");
    if (v.zone_id) {
      stockApi.getStates(String(v.zone_id)).then(r =>
        setStateOpts(r.data.map((s: any) => ({ id: s.id, label: s.description }))),
      ).catch(() => {});
    }
    setReportYear(String(v.reporting_year)); setReportWeek(String(v.reporting_week));
    setOfficerName(v.officer_name ?? ""); setOfficerStaffId(v.officer_staff_id ?? "");
    setSubmitDate(v.date_submitted?.slice(0, 10) ?? "");
    setReviewedBy(v.reviewed_by ?? ""); setStatusConfirmed(v.compliance_status_confirmed ?? "pending");
    setFollowUp(!!v.follow_up_required); setCertification(v.certification ?? "");
    setStateRemarks(v.state_office_remarks ?? "");
    setFacilityName(v.facility_name ?? ""); setFacilityCode(v.facility_code ?? "");
    setFacilityType(v.facility_type ?? ""); setOwnership(v.ownership ?? "");
    setFacilityAddress(v.facility_address ?? "");
    setComplaintsReceived(String(v.complaints_received ?? ""));
    setComplaintCategories(Array.isArray(v.complaint_categories) ? v.complaint_categories : []);
    setResolvedAtFacility(String(v.resolved_at_facility ?? ""));
    setEscalatedTo(v.escalated_to ?? "none"); setComplaintSummary(v.complaint_summary ?? "");
    setFindings((v.findings ?? []).map((f: any) => ({ _key: uid(), ...f })));
    setViolations((v.violations ?? []).map((x: any) => ({ _key: uid(), ...x, occurrences: String(x.occurrences ?? "") })));
    setEnforcements((v.enforcement_actions ?? []).map((e: any) => ({ _key: uid(), ...e })));
  };

  const buildPayload = (status: "draft" | "submitted") => ({
    zone_id: Number(zoneId), state_id: Number(stateId),
    reporting_year: Number(reportYear), reporting_week: Number(reportWeek),
    officer_name: officerName, officer_staff_id: officerStaffId,
    date_submitted: submitDate || null, reviewed_by: reviewedBy || null,
    compliance_status_confirmed: statusConfirmed,
    follow_up_required: followUp, certification: certification || null,
    facility_name: facilityName, facility_code: facilityCode,
    facility_type: facilityType, ownership, facility_address: facilityAddress,
    complaints_received: Number(complaintsReceived) || 0,
    complaint_categories: complaintCategories,
    resolved_at_facility: Number(resolvedAtFacility) || 0,
    escalated_to: escalatedTo, complaint_summary: complaintSummary || null,
    state_office_remarks: stateRemarks || null,
    submitted_by: authUser?.name ?? officerName,
    status,
    findings: findings.map(({ _key, ...f }) => f),
    violations: violations.map(({ _key, ...v }) => ({ ...v, occurrences: Number(v.occurrences) || 0 })),
    enforcement_actions: enforcements.map(({ _key, ...e }) => e),
  });

  const validate = () => {
    if (!zoneId || !stateId) return "Select zone and state";
    if (!facilityName.trim()) return "Facility name is required";
    return null;
  };

  const persist = async (status: "draft" | "submitted") => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setSaving(true);
    try {
      const payload = buildPayload(status);
      const res = selectedId
        ? await complianceApi.update(selectedId, payload)
        : await complianceApi.create(payload);
      setSelectedId(res.data.id); setRefId(res.data.reference_id);
      toast.success(status === "draft" ? "Draft saved" : "Report submitted", {
        description: res.data.reference_id,
      });
      if (status === "submitted") { setMode("list"); resetForm(); }
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const openView = async (id: number) => {
    try {
      const res = await complianceApi.get(id);
      setViewReport(res.data);
      setMode("view");
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleCategory = (cat: string) => {
    setComplaintCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat],
    );
  };

  const sectionIndicators = findingDraft.section
    ? COMPLIANCE_SECTIONS[findingDraft.section] ?? []
    : [];

  const zoneDisplay = labelOf(
    zones.map(z => ({ value: String(z.id), label: z.label })),
    zoneId,
    zoneLabel || "—",
  );
  const stateDisplay = labelOf(
    stateOpts.map(s => ({ value: String(s.id), label: s.label })),
    stateId,
    stateLabel || "—",
  );
  const escalationLabel = (v: string) =>
    ESCALATION_OPTIONS.find(o => o.value === v)?.label ?? v;
  const confirmationLabel = (v: string) =>
    CONFIRMATION_OPTIONS.find(o => o.value === v)?.label ?? v;

  if (mode === "view" && viewReport) {
    const v = viewReport;
    const st = STATUS_CFG[v.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.draft;
    const findingsList = v.findings ?? [];
    const violationsList = v.violations ?? [];
    const enforcementsList = v.enforcement_actions ?? [];
    const categories = Array.isArray(v.complaint_categories) ? v.complaint_categories : [];

    return (
      <div className="flex flex-col h-full bg-slate-50/30">
        <div className="bg-white border-b border-border/50 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { setMode("list"); setViewReport(null); }} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Facility Compliance Report</h2>
              <p className="text-xs text-muted-foreground">
                {v.reference_id ? v.reference_id : "Standards & Quality Assurance"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-[10px] border gap-1 ${st.cls}`}>{st.icon}{st.label}</Badge>
            {v.status !== "approved" && (
              <Button variant="outline" size="sm" onClick={() => { applyReport(v); setViewReport(null); setMode("form"); }} className="gap-2">
                <Pencil className="w-4 h-4" /> {v.status === "draft" ? "Edit Draft" : "Edit"}
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="flex-1">
        <div className="w-full px-4 md:px-6 py-4 space-y-4 pb-16">
          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader>
              <CardTitle className="text-base">Report Header</CardTitle>
              <CardDescription>Q{v.reporting_quarter ?? quarterFromWeek(Number(v.reporting_week))} · {v.reporting_year}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <InfoField label="Zone" value={v.zone?.description ?? "—"} />
              <InfoField label="State" value={v.state?.description ?? "—"} />
              <InfoField label="Reporting Year" value={String(v.reporting_year ?? "—")} />
              <InfoField label="Compliance Officer" value={v.officer_name ?? "—"} />
              <InfoField label="Staff ID" value={v.officer_staff_id ?? "—"} />
              <InfoField label="Date Submitted" value={v.date_submitted?.slice(0, 10) ?? "—"} />
              <InfoField label="Status Confirmed" value={confirmationLabel(v.compliance_status_confirmed ?? "pending")} />
              <InfoField label="Follow-up Required" value={v.follow_up_required ? "Yes" : "No"} />
              <div className="md:col-span-2">
                <InfoField label="Certification" value={v.certification ?? "—"} />
              </div>
              {v.reviewed_by && <InfoField label="Reviewed By" value={v.reviewed_by} />}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">1. Facility Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <InfoField label="Facility Name" value={v.facility_name ?? "—"} />
              <InfoField label="Facility Code" value={v.facility_code ?? "—"} />
              <InfoField label="Facility Type" value={v.facility_type ?? "—"} />
              <InfoField label="Ownership" value={v.ownership ?? "—"} />
              <div className="md:col-span-2">
                <InfoField label="Facility Address" value={v.facility_address ?? "—"} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">2. Compliance Findings</CardTitle></CardHeader>
            <CardContent>
              {findingsList.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No findings recorded.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Section</TableHead><TableHead>Indicator</TableHead>
                    <TableHead>Status</TableHead><TableHead>Remarks</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {findingsList.map((f: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">{f.section}</TableCell>
                        <TableCell className="text-xs max-w-[200px]">{f.indicator}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{ratingLabel(f.status)}</Badge></TableCell>
                        <TableCell className="text-xs">{f.remarks || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">3. Complaint Summary</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <InfoField label="Complaints Received" value={String(v.complaints_received ?? 0)} />
              <InfoField label="Resolved at Facility" value={String(v.resolved_at_facility ?? 0)} />
              <InfoField label="Escalated to" value={escalationLabel(v.escalated_to ?? "none")} />
              <div className="md:col-span-3">
                <InfoField label="Complaint Categories" value={categories.length ? categories.join(", ") : "—"} />
              </div>
              <div className="md:col-span-3">
                <InfoField label="Summary" value={v.complaint_summary ?? "—"} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">4. Violations Observed</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {violationsList.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No violations recorded.</p>
              ) : violationsList.map((x: any, i: number) => (
                <div key={i} className="text-sm border rounded-xl p-3">
                  <p className="font-medium">{x.nature_of_violation}</p>
                  <p className="text-xs text-muted-foreground">{x.nhia_act_section || "—"} · {x.occurrences || 0} occurrence(s)</p>
                  <p className="text-xs mt-1">{x.action_taken || "—"}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">5. Enforcement Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {enforcementsList.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No enforcement actions recorded.</p>
              ) : enforcementsList.map((e: any, i: number) => (
                <div key={i} className="text-sm border rounded-xl p-3">
                  <p className="font-medium">{e.enforcement_action}</p>
                  <p className="text-xs text-muted-foreground">{e.details || "—"}</p>
                </div>
              ))}
              {v.state_office_remarks && (
                <div className="pt-2">
                  <InfoField label="State Office Remarks" value={v.state_office_remarks} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </ScrollArea>
      </div>
    );
  }

  if (mode === "form") {
    return (
      <div className="flex flex-col h-full bg-slate-50/30">
        <div className="bg-white border-b border-border/50 px-4 md:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => { setMode("list"); resetForm(); }} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Facility Compliance Report</h2>
            <p className="text-xs text-muted-foreground">
              {refId ? refId : "New compliance submission"}
            </p>
          </div>
        </div>
        <ScrollArea className="flex-1">
        <div className="w-full px-4 md:px-6 py-4 space-y-4 pb-24 max-w-5xl mx-auto">
          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">Report Header</CardTitle>
              <CardDescription>Q{quarterFromWeek(Number(reportWeek))} · {reportYear}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Zone</Label>
                <Select value={zoneId} onValueChange={setZoneId} disabled={!!defaultZoneId}>
                  <SelectTrigger className={inputCls} displayValue={zoneDisplay}>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>{zones.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">State</Label>
                <Select value={stateId} onValueChange={setStateId} disabled={!!defaultStateId || !zoneId}>
                  <SelectTrigger className={inputCls} displayValue={stateDisplay}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>{stateOpts.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Reporting Year</Label>
                <Select value={reportYear} onValueChange={setReportYear}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent>{buildReportingYearOptions().map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Compliance Officer</Label>
                <Input className={inputCls} value={officerName} onChange={e => setOfficerName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Staff ID</Label>
                <Input className={inputCls} value={officerStaffId} onChange={e => setOfficerStaffId(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Date Submitted</Label>
                <Input className={inputCls} type="date" value={submitDate} onChange={e => setSubmitDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Compliance Status Confirmed</Label>
                <Select value={statusConfirmed} onValueChange={setStatusConfirmed}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent>{CONFIRMATION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" checked={followUp} onChange={e => setFollowUp(e.target.checked)}
                  id="follow-up" className="w-4 h-4 accent-[#145c3f]" />
                <Label htmlFor="follow-up" className="text-sm">Follow-up Required</Label>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs">Certification</Label>
                <Input className={inputCls} value={certification} onChange={e => setCertification(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">1. Facility Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">Facility Name *</Label>
                <Input className={inputCls} value={facilityName} onChange={e => setFacilityName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Facility Code</Label>
                <Input className={inputCls} value={facilityCode} onChange={e => setFacilityCode(e.target.value)} placeholder="e.g. ABCH" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Facility Type</Label>
                <Select value={facilityType} onValueChange={setFacilityType}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{FACILITY_TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ownership</Label>
                <Select value={ownership} onValueChange={setOwnership}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="Select ownership" /></SelectTrigger>
                  <SelectContent>{OWNERSHIP_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">Facility Address</Label>
                <Input className={inputCls} value={facilityAddress} onChange={e => setFacilityAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">2. Compliance Findings</CardTitle>
              <CardDescription>Each finding is a separate observation</CardDescription>
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

          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">3. Complaint Summary</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-1.5 md:col-span-2">
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
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">Escalated to</Label>
                <Select value={escalatedTo} onValueChange={setEscalatedTo}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent>{ESCALATION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">Summary of major complaints and actions taken</Label>
                <Input className={inputCls} value={complaintSummary} onChange={e => setComplaintSummary(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">4. Violations Observed</CardTitle></CardHeader>
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
              {violations.map(v => (
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

          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardHeader><CardTitle className="text-base">5. Enforcement Actions</CardTitle></CardHeader>
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
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs">State Office Remarks</Label>
                <Input className={inputCls} value={stateRemarks} onChange={e => setStateRemarks(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Report Reviewed By</Label>
                <Input className={inputCls} value={reviewedBy} onChange={e => setReviewedBy(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => persist("draft")} disabled={saving}>
              <Save className="w-4 h-4 mr-1" /> Save Draft
            </Button>
            <Button className="bg-[#145c3f] hover:bg-[#0f3d2e]" onClick={() => persist("submitted")} disabled={saving}>
              <Send className="w-4 h-4 mr-1" /> Submit Report
            </Button>
          </div>
        </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="bg-white border-b border-border/50 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Facility Compliance Report</h2>
            <p className="text-xs text-muted-foreground">SQA — Facility Compliance Reporting</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button
            className="bg-[#145c3f] hover:bg-[#0f3d2e] gap-2 shadow-lg shadow-emerald-500/20"
            onClick={() => { resetForm(); setMode("form"); }}
          >
            <Plus className="w-4 h-4" /> New Report
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="w-full px-4 md:px-6 py-4 space-y-4">
          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardContent className="pt-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Zone</Label>
                <Select value={filterZone} disabled={zoneLocked} onValueChange={(v) => { setFilterZone(v); if (!stateLocked) setFilterState(ALL_STATES); }}>
                  <SelectTrigger className="w-full" displayValue={filterZone === "all" ? "All Zones" : pickGeoLabel(zones.map(z => ({ id: z.id, description: z.label })), filterZone, "Zone")}>
                    <SelectValue placeholder="Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {!zoneLocked && <SelectItem value="all">All Zones</SelectItem>}
                    {zones.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">State</Label>
                <Select value={filterState} disabled={stateLocked} onValueChange={setFilterState}>
                  <SelectTrigger className="w-full" displayValue={
                    stateLocked
                      ? pickGeoLabel(dashboardStates, filterState, "State")
                      : (filterState === ALL_STATES ? "All States" : pickGeoLabel(dashboardStates, filterState, "State"))
                  }>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    {!stateLocked && <SelectItem value={ALL_STATES}>All States</SelectItem>}
                    {dashboardStates.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.description}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Year</Label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-full" displayValue={filterYear === "all" ? "All Years" : filterYear}>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full" displayValue={filterStatus === "all" ? "All Statuses" : STATUS_CFG[filterStatus as keyof typeof STATUS_CFG]?.label}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.keys(STATUS_CFG).map(s => (
                      <SelectItem key={s} value={s}>{STATUS_CFG[s as keyof typeof STATUS_CFG].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total", value: counts.total, color: "bg-slate-50 border-slate-200", text: "text-slate-700" },
                  { label: "Draft", value: counts.draft, color: "bg-slate-50 border-slate-200", text: "text-slate-600" },
                  { label: "Submitted", value: counts.submitted, color: "bg-blue-50 border-blue-200", text: "text-blue-700" },
                  { label: "Approved", value: counts.approved, color: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
                ].map(c => (
                  <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-5 border ${c.color}`}>
                    <p className={`text-3xl font-black ${c.text}`}>{formatCount(c.value)}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1">{c.label}</p>
                  </motion.div>
                ))}
              </div>

              <Card className="rounded-2xl border-[#d4e8dc] shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-[#d4e8dc] flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold">
                    {`${reports.length} report${reports.length !== 1 ? "s" : ""}`}
                  </CardTitle>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" className="text-slate-500 gap-1" onClick={clearFilters}>
                      <XCircle className="w-3.5 h-3.5" /> Clear filters
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  {reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
                      <FileText className="w-8 h-8 opacity-30" />
                      <p className="text-sm font-medium">{hasFilters ? "No reports match your filters" : "No compliance reports yet"}</p>
                      {!hasFilters && (
                        <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => { resetForm(); setMode("form"); }}>
                          <Plus className="w-4 h-4" /> New Report
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#f0fdf7] hover:bg-[#f0fdf7]">
                            <TableHead className="text-xs font-bold text-slate-600 whitespace-nowrap">Report ID</TableHead>
                            <TableHead className="text-xs font-bold text-slate-600 whitespace-nowrap">Facility</TableHead>
                            {showLocationCols && (
                              <>
                                <TableHead className="text-xs font-bold text-slate-600 whitespace-nowrap">Zone</TableHead>
                                <TableHead className="text-xs font-bold text-slate-600 whitespace-nowrap">State</TableHead>
                              </>
                            )}
                            <TableHead className="text-xs font-bold text-slate-600 whitespace-nowrap">Period</TableHead>
                            <TableHead className="text-xs font-bold text-slate-600 text-right whitespace-nowrap">Findings</TableHead>
                            <TableHead className="text-xs font-bold text-slate-600 whitespace-nowrap">Officer</TableHead>
                            <TableHead className="text-xs font-bold text-slate-600 whitespace-nowrap">Status</TableHead>
                            <TableHead className="text-right text-xs font-bold text-slate-600 whitespace-nowrap">View</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reports.map((r, i) => {
                            const st = STATUS_CFG[r.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.draft;
                            return (
                              <motion.tr key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="hover:bg-[#f8fdfb] transition-colors border-b border-slate-100 last:border-0">
                                <TableCell>
                                  <span className="font-mono text-xs font-bold text-primary">{r.reference_id}</span>
                                </TableCell>
                                <TableCell className="text-sm font-semibold text-slate-800 whitespace-nowrap">{r.facility_name || "—"}</TableCell>
                                {showLocationCols && (
                                  <>
                                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{r.zone?.description ?? "—"}</TableCell>
                                    <TableCell className="text-sm font-semibold text-slate-800 whitespace-nowrap">{r.state?.description ?? "—"}</TableCell>
                                  </>
                                )}
                                <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                                  Q{r.reporting_quarter ?? quarterFromWeek(Number(r.reporting_week))} · {r.reporting_year}
                                </TableCell>
                                <TableCell className="text-sm text-slate-500 text-right tabular-nums">{r.findings?.length ?? 0}</TableCell>
                                <TableCell className="text-sm text-slate-500 whitespace-nowrap">{r.officer_name || "—"}</TableCell>
                                <TableCell>
                                  <Badge className={`text-[10px] px-2 py-0.5 flex items-center gap-1 w-fit border ${st.cls}`}>
                                    {st.icon} {st.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm"
                                    className="h-7 w-7 p-0 text-slate-400 hover:text-primary hover:bg-primary/10"
                                    onClick={() => openView(r.id)}>
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
