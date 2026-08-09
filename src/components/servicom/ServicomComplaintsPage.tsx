import * as React from "react";
import {
  ArrowLeft, Plus, RefreshCw, Loader2, MessageSquare, Search,
  CheckCircle2, Circle, ChevronRight, AlertTriangle, Clock, ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { servicomApi, stockApi } from "@/lib/api";
import { pickGeoLabel, pickLabel } from "./servicomConstants";
import {
  COMPLAINT_TYPES, COMPLAINT_DOMAINS, COMPLAINT_CATEGORIES, PRIORITY_RATINGS,
  TRANSMISSION_ROUTES, COMPLAINANT_CATEGORIES, RESPONDENT_CATEGORIES,
  COMPLAINT_STATUSES, ACTIONS_TAKEN, ESCALATION_LEVELS, ESCALATED_TO,
  COMPLAINT_OUTCOMES, SLA_SUMMARY, domainCodeFromDomain, computeResolutionPreview,
  slaForPriority, STATUS_BADGE_CLASS, COMPLAINT_LIFECYCLE, INVESTIGATION_STATUSES,
  lifecycleStageFromStatus, getStageCompletion, lifecycleStageLabel,
  type LifecycleStage,
} from "./complaintRegisterConstants";
import { HCF_CLASSIFICATION_GUIDE } from "./hcfClassificationGuide";

interface Props {
  onBack: () => void;
  defaultStateId?: string | null;
  defaultZoneId?: string | null;
}

type Mode = "list" | "register" | "manage";

const emptyForm = (defaultZoneId?: string | null, defaultStateId?: string | null) => ({
  zone_id: defaultZoneId ?? "",
  state_id: defaultStateId ?? "",
  complaint_type: "",
  offence_reference: "",
  complaint_category: "",
  category_code: "",
  complaint_domain: "",
  domain_code: "",
  priority_rating: "",
  date_received: new Date().toISOString().slice(0, 10),
  transmission_route: "",
  complainant_category: "",
  complainant_id: "",
  respondent_category: "",
  respondent_id: "",
  officer_assigned: "",
  investigation_start_date: "",
  status: "New/Acknowledged",
  actions_taken: "",
  actions_details: "",
  escalated: false,
  escalation_level: "",
  escalation_date: "",
  escalated_to: "",
  date_closed: "",
  outcome: "",
  remarks: "",
  description: "",
});

function rowToForm(row: any) {
  return {
    zone_id: row.zone_id ? String(row.zone_id) : "",
    state_id: row.state_id ? String(row.state_id) : "",
    complaint_type: row.complaint_type ?? "",
    offence_reference: row.offence_reference ?? "",
    complaint_category: row.complaint_category ?? row.category ?? "",
    category_code: row.category_code ?? "",
    complaint_domain: row.complaint_domain ?? "",
    domain_code: row.domain_code ?? "",
    priority_rating: row.priority_rating ?? "",
    date_received: row.date_received ?? row.complaint_date ?? "",
    transmission_route: row.transmission_route ?? "",
    complainant_category: row.complainant_category ?? "",
    complainant_id: row.complainant_id ?? "",
    respondent_category: row.respondent_category ?? "",
    respondent_id: row.respondent_id ?? "",
    officer_assigned: row.officer_assigned ?? row.assigned_officer ?? "",
    investigation_start_date: row.investigation_start_date ?? "",
    status: row.status ?? "New/Acknowledged",
    actions_taken: row.actions_taken ?? "",
    actions_details: row.actions_details ?? "",
    escalated: !!row.escalated,
    escalation_level: row.escalation_level ?? "",
    escalation_date: row.escalation_date ?? "",
    escalated_to: row.escalated_to ?? "",
    date_closed: row.date_closed ?? row.resolution_date ?? "",
    outcome: row.outcome ?? "",
    remarks: row.remarks ?? row.resolution_notes ?? "",
    description: row.description ?? "",
  };
}

function AutoField({ label, value, hint }: { label: string; value?: string | number | null; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500">{label}</Label>
      <p className="text-sm font-medium text-slate-700">{value ?? "—"}</p>
      {hint && !value && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

const HCF_OFFENCE_OPTIONS = HCF_CLASSIFICATION_GUIDE.map((e) => ({
  value: e.reference,
  label: `${e.reference} — ${e.offence.length > 90 ? `${e.offence.slice(0, 90)}…` : e.offence}`,
}));

function FieldSelect({
  label, value, options, onChange, readOnly, placeholder,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  if (readOnly) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-500">{label}</Label>
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full" displayValue={pickLabel(options, value, placeholder ?? label)}>
          <SelectValue placeholder={placeholder ?? label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function DisabledInput({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500">{label}</Label>
      <Input
        disabled
        readOnly
        className="bg-slate-50 text-slate-600 cursor-not-allowed"
        value={value ?? ""}
        placeholder={placeholder}
      />
    </div>
  );
}

function FieldText({
  label, value, onChange, readOnly, type = "text", placeholder, mono, max, min,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  type?: string;
  placeholder?: string;
  mono?: boolean;
  max?: string;
  min?: string;
}) {
  if (readOnly) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-500">{label}</Label>
        <p className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500">{label}</Label>
      <Input
        className={`w-full ${mono ? "font-mono" : ""}`}
        type={type}
        placeholder={placeholder}
        value={value}
        max={max}
        min={min}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

export default function ServicomComplaintsPage({ onBack, defaultStateId, defaultZoneId }: Props) {
  const geoLocked = !!(defaultZoneId && defaultStateId);
  const today = new Date().toISOString().slice(0, 10);
  const [mode, setMode] = React.useState<Mode>("list");
  const [complaints, setComplaints] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [zones, setZones] = React.useState<any[]>([]);
  const [states, setStates] = React.useState<any[]>([]);
  const [filterStates, setFilterStates] = React.useState<any[]>([]);
  const [f, setF] = React.useState(emptyForm(defaultZoneId, defaultStateId));

  const [filterZone, setFilterZone] = React.useState(defaultZoneId ?? "all");
  const [filterState, setFilterState] = React.useState(defaultStateId ?? "all");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterPriority, setFilterPriority] = React.useState("all");
  const [filterSearch, setFilterSearch] = React.useState("");
  const [filterDate, setFilterDate] = React.useState("");
  const [activeStage, setActiveStage] = React.useState<LifecycleStage>("registration");

  const set = (key: string, value: string | boolean) => setF((p) => ({ ...p, [key]: value }));

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await servicomApi.listComplaints({
        state_id: geoLocked ? (defaultStateId ?? undefined) : (filterState !== "all" ? filterState : undefined),
        zone_id: geoLocked ? (defaultZoneId ?? undefined) : (filterZone !== "all" ? filterZone : undefined),
        status: filterStatus !== "all" ? filterStatus : undefined,
        priority: filterPriority !== "all" ? filterPriority : undefined,
      });
      setComplaints(res.data);
    } catch (err: any) {
      toast.error("Failed to load complaints", { description: err.message });
    } finally { setLoading(false); }
  }, [defaultStateId, defaultZoneId, filterState, filterZone, filterStatus, filterPriority, geoLocked]);

  React.useEffect(() => { if (mode === "list") load(); }, [load, mode]);
  React.useEffect(() => { stockApi.getZones().then((r) => setZones(r.data)).catch(() => {}); }, []);
  React.useEffect(() => {
    if (geoLocked || !f.zone_id) { if (!geoLocked) setStates([]); return; }
    stockApi.getStates(f.zone_id).then((r) => setStates(r.data)).catch(() => {});
  }, [f.zone_id, geoLocked]);
  React.useEffect(() => {
    if (geoLocked || filterZone === "all") { setFilterStates([]); return; }
    stockApi.getStates(filterZone).then((r) => setFilterStates(r.data)).catch(() => {});
  }, [filterZone, geoLocked]);

  const filtered = React.useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    return complaints.filter((c) => {
      if (q) {
        const hay = [
          c.complaint_number, c.complaint_category, c.complaint_domain,
          c.complaint_type, c.officer_assigned, c.status, c.description,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filterDate && (c.date_received || c.complaint_date) !== filterDate) return false;
      return true;
    });
  }, [complaints, filterSearch, filterDate]);

  const listStats = React.useMemo(() => {
    const open = filtered.filter((c) => !["Closed", "Resolved", "Complaint Withdrawn"].includes(c.status));
    const slaTracked = filtered.filter((c) => c.resolution_within_sla != null);
    const slaMet = slaTracked.filter((c) => c.resolution_within_sla).length;
    return {
      total: filtered.length,
      open: open.length,
      investigation: filtered.filter((c) => lifecycleStageFromStatus(c.status, c) === "investigation").length,
      escalated: filtered.filter((c) => c.escalated || c.status === "Escalated").length,
      resolved: filtered.filter((c) => ["Closed", "Resolved"].includes(c.status)).length,
      slaMet,
      slaTracked: slaTracked.length,
    };
  }, [filtered]);

  const priorityBadge = (priority?: string) => {
    if (!priority) return <span className="text-xs text-slate-400">—</span>;
    const cls = priority === "Top"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : priority === "High"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-blue-50 text-blue-700 border-blue-200";
    return <Badge variant="outline" className={`text-[10px] font-semibold ${cls}`}>{priority}</Badge>;
  };

  const stageBadge = (c: any) => {
    const stage = lifecycleStageFromStatus(c.status, c);
    const cls = stage === "registration"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : stage === "investigation"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : stage === "escalation"
          ? "bg-purple-50 text-purple-800 border-purple-200"
          : "bg-emerald-50 text-emerald-800 border-emerald-200";
    return (
      <Badge variant="outline" className={`text-[10px] font-semibold ${cls}`}>
        {lifecycleStageLabel(stage)}
      </Badge>
    );
  };

  const openRegister = () => {
    setF(emptyForm(defaultZoneId, defaultStateId));
    setSelected(null);
    setActiveStage("registration");
    setMode("register");
  };

  const openManage = async (row: any, stage?: LifecycleStage) => {
    try {
      const res = await servicomApi.getComplaint(row.id);
      setSelected(res.data);
      setF(rowToForm(res.data));
      setActiveStage(stage ?? lifecycleStageFromStatus(res.data.status, res.data));
      setMode("manage");
    } catch (err: any) {
      toast.error("Failed to load complaint", { description: err.message });
    }
  };

  const closeSub = () => {
    setMode("list");
    setSelected(null);
    setActiveStage("registration");
    load();
  };

  const refreshSelected = async () => {
    if (!selected?.id) return;
    const res = await servicomApi.getComplaint(selected.id);
    setSelected(res.data);
    setF(rowToForm(res.data));
  };

  const statusBadge = (status: string) => (
    <Badge variant="outline" className={`text-[10px] font-semibold ${STATUS_BADGE_CLASS[status] ?? ""}`}>
      {status}
    </Badge>
  );

  const handleSaveRegistration = async () => {
    if (!f.complaint_type || !f.date_received) {
      toast.error("Complaint type and date received are required.");
      return;
    }
    if (f.complaint_type === "HCF") {
      if (!f.offence_reference) {
        toast.error("Select an offence from the HCF classification guide.");
        return;
      }
    } else if (!f.complaint_category || !f.complaint_domain || !f.priority_rating || !f.description?.trim()) {
      toast.error("Domain, category, priority, and offence are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        complaint_type: f.complaint_type,
        offence_reference: f.offence_reference || undefined,
        complaint_category: f.complaint_category,
        category_code: f.category_code || undefined,
        complaint_domain: f.complaint_domain,
        domain_code: f.domain_code || (f.complaint_domain ? domainCodeFromDomain(f.complaint_domain) : undefined),
        priority_rating: f.priority_rating,
        date_received: f.date_received,
        transmission_route: f.transmission_route,
        description: f.description,
        complainant_category: f.complainant_category,
        respondent_category: f.respondent_category,
        zone_id: f.zone_id ? Number(f.zone_id) : null,
        state_id: f.state_id ? Number(f.state_id) : null,
        status: "New/Acknowledged",
      };
      const res = await servicomApi.createComplaint(payload);
      toast.success("Complaint registered — proceed to investigation");
      setSelected(res.data);
      setF(rowToForm(res.data));
      setActiveStage("investigation");
      setMode("manage");
      load();
    } catch (err: any) {
      toast.error("Failed to register complaint", { description: err.message });
    } finally { setSaving(false); }
  };

  const handleSaveStage = async (stage: LifecycleStage) => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      let payload: Record<string, unknown> = {};
      if (stage === "investigation") {
        if (!f.officer_assigned) {
          toast.error("Officer assigned is required to start investigation.");
          setSaving(false);
          return;
        }
        payload = {
          officer_assigned: f.officer_assigned,
          investigation_start_date: f.investigation_start_date || new Date().toISOString().slice(0, 10),
          status: ["New/Acknowledged", ""].includes(f.status) ? "Under Investigation" : f.status,
          actions_taken: f.actions_taken || null,
          actions_details: f.actions_details || null,
        };
      } else if (stage === "escalation") {
        payload = {
          escalated: !!f.escalated,
          escalation_level: f.escalation_level || null,
          escalation_date: f.escalation_date || null,
          escalated_to: f.escalated_to || null,
          status: f.escalated ? "Escalated" : selected.status,
        };
      } else if (stage === "resolution") {
        if (!f.date_closed || !f.outcome) {
          toast.error("Date closed and outcome are required.");
          setSaving(false);
          return;
        }
        if (f.date_closed > today) {
          toast.error("Date closed cannot be later than today.");
          setSaving(false);
          return;
        }
        payload = {
          date_closed: f.date_closed,
          outcome: f.outcome,
          remarks: f.remarks || null,
          status: f.outcome === "Complaint Withdrawn" ? "Complaint Withdrawn"
            : f.outcome === "Referred to Appropriate Authority" ? "Referred to Appropriate Authority"
            : "Closed",
        };
      }
      await servicomApi.updateComplaint(selected.id, payload);
      toast.success(`${lifecycleStageLabel(stage)} saved`);
      await refreshSelected();
      load();
      if (stage === "investigation") setActiveStage("escalation");
      else if (stage === "escalation") setActiveStage("resolution");
    } catch (err: any) {
      toast.error("Failed to save", { description: err.message });
    } finally { setSaving(false); }
  };

  const onComplaintTypeChange = (v: string) => {
    setF((p) => ({
      ...emptyForm(defaultZoneId, defaultStateId),
      zone_id: p.zone_id,
      state_id: p.state_id,
      date_received: p.date_received,
      transmission_route: p.transmission_route,
      complainant_category: p.complainant_category,
      complainant_id: p.complainant_id,
      respondent_category: p.respondent_category,
      respondent_id: p.respondent_id,
      complaint_type: v,
    }));
  };

  const onHcfOffenceChange = (reference: string) => {
    const entry = HCF_CLASSIFICATION_GUIDE.find((e) => e.reference === reference);
    if (!entry) return;
    setF((p) => ({
      ...p,
      offence_reference: entry.reference,
      complaint_domain: entry.domain,
      domain_code: domainCodeFromDomain(entry.domain),
      complaint_category: entry.category,
      category_code: entry.categoryCode,
      priority_rating: entry.priority,
      description: entry.offence,
    }));
  };

  const resolutionPreview = React.useMemo(
    () => computeResolutionPreview(f.date_received, f.date_closed, f.priority_rating),
    [f.date_received, f.date_closed, f.priority_rating],
  );

  const renderGeoFields = (readOnly: boolean, row?: any) => (
    <>
      {geoLocked ? null : (
        <>
          <FieldSelect
            label="Zone"
            value={readOnly ? String(row?.zone_id ?? "") : f.zone_id}
            options={zones.map((z) => ({ value: String(z.id), label: z.description }))}
            readOnly={readOnly}
            onChange={(v) => setF((p) => ({ ...p, zone_id: v, state_id: "" }))}
          />
          <FieldSelect
            label="State"
            value={readOnly ? String(row?.state_id ?? "") : f.state_id}
            options={states.map((s) => ({ value: String(s.id), label: s.description }))}
            readOnly={readOnly}
            onChange={(v) => set("state_id", v)}
          />
        </>
      )}
    </>
  );

  const renderComplaintSection = (readOnly: boolean, row?: any) => {
    const isHcf = readOnly ? row?.complaint_type === "HCF" : f.complaint_type === "HCF";
    const isManualType = readOnly
      ? row?.complaint_type && row.complaint_type !== "HCF"
      : f.complaint_type && f.complaint_type !== "HCF";

    const priority = readOnly ? row?.priority_rating : f.priority_rating;
    const dateReceived = readOnly ? (row?.date_received ?? row?.complaint_date) : f.date_received;
    const transmissionRoute = readOnly ? row?.transmission_route : f.transmission_route;
    const offenceText = readOnly ? row?.description : f.description;
    const complaintId = readOnly ? row?.complaint_number : selected?.complaint_number;
    const slaRow = slaForPriority(priority ?? "");

    return (
      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
        <CardHeader className="pb-3 border-b bg-[#f8fbf9]">
          <CardTitle className="text-sm font-bold text-[#145c3f]">Complaint</CardTitle>
        </CardHeader>
        <CardContent className="pt-5 pb-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {readOnly ? (
            <AutoField label="Complaint ID" value={row?.complaint_number} />
          ) : (
            <DisabledInput label="Complaint ID" value={complaintId} placeholder="Auto-generated" />
          )}

          {renderGeoFields(readOnly, row)}

          <FieldSelect
            label="Complaint Type"
            value={readOnly ? row?.complaint_type : f.complaint_type}
            options={COMPLAINT_TYPES}
            readOnly={readOnly}
            onChange={onComplaintTypeChange}
          />

          {isHcf && (
            <FieldSelect
              label="Offence / Complaint"
              value={readOnly ? row?.offence_reference : f.offence_reference}
              options={HCF_OFFENCE_OPTIONS}
              readOnly={readOnly}
              onChange={onHcfOffenceChange}
              placeholder="Select offence"
            />
          )}

          {isHcf && (readOnly ? row?.offence_reference : f.offence_reference) && (
            <>
              <DisabledInput label="Domain" value={readOnly ? row?.complaint_domain : f.complaint_domain} />
              <DisabledInput label="Category" value={readOnly ? (row?.complaint_category ?? row?.category) : f.complaint_category} />
            </>
          )}

          {isManualType && (
            <>
              <FieldSelect label="Domain" value={readOnly ? row?.complaint_domain : f.complaint_domain}
                options={COMPLAINT_DOMAINS} readOnly={readOnly}
                onChange={(v) => setF((p) => ({ ...p, complaint_domain: v, domain_code: domainCodeFromDomain(v) }))} />
              <FieldSelect label="Category" value={readOnly ? (row?.complaint_category ?? row?.category) : f.complaint_category}
                options={COMPLAINT_CATEGORIES} readOnly={readOnly} onChange={(v) => set("complaint_category", v)} />
            </>
          )}

          {(isHcf || isManualType) && (
            <>
              {isHcf ? (
                <DisabledInput label="Priority Rating" value={priority} />
              ) : (
                <FieldSelect label="Priority Rating" value={priority ?? ""}
                  options={PRIORITY_RATINGS} readOnly={readOnly} onChange={(v) => set("priority_rating", v)} />
              )}
              <FieldText label="Date Received" type="date" value={dateReceived ?? ""}
                onChange={(v) => set("date_received", v)} readOnly={readOnly} />
              <FieldSelect label="Transmission Route" value={transmissionRoute ?? ""}
                options={TRANSMISSION_ROUTES} readOnly={readOnly} onChange={(v) => set("transmission_route", v)} />
            </>
          )}

          {(isHcf || isManualType) && (
            <div className="md:col-span-2 xl:col-span-3">
              {readOnly || isHcf ? (
                <DisabledInput label="Offence" value={offenceText} />
              ) : (
                <FieldText label="Offence" value={offenceText ?? ""}
                  onChange={(v) => set("description", v)} readOnly={readOnly} />
              )}
            </div>
          )}

          {slaRow && (
            <div className="md:col-span-2 xl:col-span-3 rounded-xl border border-[#d4e8dc] bg-[#f8fbf9] p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisabledInput label="Acknowledge within" value={slaRow.acknowledge} />
              <DisabledInput label="Investigate within" value={slaRow.investigate} />
              <DisabledInput label="Escalate after" value={slaRow.escalate} />
              <DisabledInput label="Resolve within" value={slaRow.resolve} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPartiesSection = (readOnly: boolean, row?: any) => (
    <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
      <CardHeader className="pb-3 border-b bg-[#f8fbf9]">
        <CardTitle className="text-sm font-bold text-[#145c3f]">Complainant & Respondent</CardTitle>
      </CardHeader>
      <CardContent className="pt-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldSelect label="Complainant Category" value={readOnly ? row?.complainant_category : f.complainant_category}
          options={COMPLAINANT_CATEGORIES} readOnly={readOnly} onChange={(v) => set("complainant_category", v)} />
        <FieldSelect label="Respondent Category" value={readOnly ? row?.respondent_category : f.respondent_category}
          options={RESPONDENT_CATEGORIES} readOnly={readOnly} onChange={(v) => set("respondent_category", v)} />
      </CardContent>
    </Card>
  );

  const renderInvestigationSection = (readOnly: boolean, row?: any) => (
    <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
      <CardHeader className="pb-3 border-b bg-[#f8fbf9]">
        <CardTitle className="text-sm font-bold text-[#145c3f]">Investigation</CardTitle>
      </CardHeader>
      <CardContent className="pt-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldText label="Officer Assigned" value={readOnly ? (row?.officer_assigned ?? row?.assigned_officer) : f.officer_assigned}
          onChange={(v) => set("officer_assigned", v)} readOnly={readOnly} />
        <FieldText label="Investigation Start Date" type="date"
          value={readOnly ? row?.investigation_start_date : f.investigation_start_date}
          onChange={(v) => set("investigation_start_date", v)} readOnly={readOnly} />
        <FieldSelect label="Status" value={readOnly ? row?.status : f.status}
          options={readOnly ? COMPLAINT_STATUSES : INVESTIGATION_STATUSES}
          readOnly={readOnly} onChange={(v) => set("status", v)} />
        <FieldSelect label="Actions Taken" value={readOnly ? row?.actions_taken : f.actions_taken}
          options={ACTIONS_TAKEN} readOnly={readOnly} onChange={(v) => set("actions_taken", v)} />
        <div className="md:col-span-2">
          <FieldText label="Actions Details" value={readOnly ? row?.actions_details : f.actions_details}
            onChange={(v) => set("actions_details", v)} readOnly={readOnly} />
        </div>
      </CardContent>
    </Card>
  );

  const renderEscalationSection = (readOnly: boolean, row?: any) => (
    <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
      <CardHeader className="pb-3 border-b bg-[#f8fbf9]">
        <CardTitle className="text-sm font-bold text-[#145c3f]">Escalation</CardTitle>
      </CardHeader>
      <CardContent className="pt-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {readOnly ? (
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Escalated</Label>
            <Badge variant="outline">{row?.escalated ? "Yes" : "No"}</Badge>
          </div>
        ) : (
          <FieldSelect label="Escalated" value={f.escalated ? "yes" : "no"}
            options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
            onChange={(v) => set("escalated", v === "yes")} />
        )}
        <FieldSelect label="Escalation Level" value={readOnly ? row?.escalation_level : f.escalation_level}
          options={ESCALATION_LEVELS} readOnly={readOnly} onChange={(v) => set("escalation_level", v)} />
        <FieldText label="Escalation Date" type="date" value={readOnly ? row?.escalation_date : f.escalation_date}
          onChange={(v) => set("escalation_date", v)} readOnly={readOnly} />
        <FieldSelect label="Escalated To" value={readOnly ? row?.escalated_to : f.escalated_to}
          options={ESCALATED_TO} readOnly={readOnly}
          onChange={(v) => set("escalated_to", v)} />
      </CardContent>
    </Card>
  );

  const renderResolutionSection = (readOnly: boolean, row?: any) => {
    const preview = readOnly
      ? { resolution_days: row?.resolution_days, resolution_within_sla: row?.resolution_within_sla }
      : resolutionPreview;

    const slaLabel = preview.resolution_within_sla == null
      ? ""
      : preview.resolution_within_sla ? "Yes" : "No";

    return (
    <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
      <CardHeader className="pb-3 border-b bg-[#f8fbf9]">
        <CardTitle className="text-sm font-bold text-[#145c3f]">Resolution</CardTitle>
      </CardHeader>
      <CardContent className="pt-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {readOnly ? (
          <>
            <AutoField label="Resolution Days" value={preview.resolution_days} />
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Within SLA</Label>
              <Badge variant="outline" className={preview.resolution_within_sla ? "text-emerald-700" : "text-rose-700"}>
                {preview.resolution_within_sla == null ? "—" : preview.resolution_within_sla ? "Yes" : "No"}
              </Badge>
            </div>
          </>
        ) : (
          <>
            <DisabledInput
              label="Resolution Days"
              value={preview.resolution_days != null ? String(preview.resolution_days) : ""}
            />
            <DisabledInput label="Resolution Within SLA" value={slaLabel} />
          </>
        )}
        <FieldText label="Date Closed" type="date" value={readOnly ? (row?.date_closed ?? row?.resolution_date) : f.date_closed}
          onChange={(v) => set("date_closed", v)} readOnly={readOnly} max={readOnly ? undefined : today} />
        <FieldSelect label="Outcome" value={readOnly ? row?.outcome : f.outcome}
          options={COMPLAINT_OUTCOMES} readOnly={readOnly} onChange={(v) => set("outcome", v)} />
        <div className="md:col-span-2">
          <FieldText label="Remarks" value={readOnly ? (row?.remarks ?? row?.resolution_notes) : f.remarks}
            onChange={(v) => set("remarks", v)} readOnly={readOnly} />
        </div>
      </CardContent>
    </Card>
    );
  };

  const renderSlaReference = (activePriority?: string) => (
    <Card className="rounded-2xl border-slate-200 bg-slate-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold text-slate-600">SLA Reference</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Priority</TableHead>
                <TableHead className="text-[10px]">Acknowledge</TableHead>
                <TableHead className="text-[10px]">Investigate</TableHead>
                <TableHead className="text-[10px]">Escalate</TableHead>
                <TableHead className="text-[10px]">Resolve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SLA_SUMMARY.map((s) => (
                <TableRow key={s.priority} className={s.priority === activePriority ? "bg-[#e8f5ee]" : undefined}>
                  <TableCell className="text-xs font-semibold">{s.priority}</TableCell>
                  <TableCell className="text-xs">{s.acknowledge}</TableCell>
                  <TableCell className="text-xs">{s.investigate}</TableCell>
                  <TableCell className="text-xs">{s.escalate}</TableCell>
                  <TableCell className="text-xs">{s.resolve}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const renderLifecycleStepper = (row: any) => {
    const completion = getStageCompletion(row);
    const current = lifecycleStageFromStatus(row?.status ?? "", row);

    return (
      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#d4e8dc]">
            {COMPLAINT_LIFECYCLE.map((stage) => {
              const done = completion[stage.id];
              const isActive = activeStage === stage.id;
              const isCurrent = current === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStage(stage.id)}
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
            <span className="text-xs text-slate-500">Complaint ID:</span>
            <span className="text-xs font-mono font-bold text-primary">{row?.complaint_number}</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500">Status:</span>
            {statusBadge(row?.status ?? "New/Acknowledged")}
            {row?.priority_rating && (
              <>
                <span className="text-xs text-slate-400">|</span>
                <Badge variant="outline" className="text-[10px]">{row.priority_rating} priority</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStageContent = () => {
    const row = selected;
    if (activeStage === "registration") {
      return (
        <>
          {renderComplaintSection(true, row)}
          {renderPartiesSection(true, row)}
          {renderSlaReference(row?.priority_rating)}
        </>
      );
    }
    if (activeStage === "investigation") {
      return (
        <>
          <Card className="rounded-2xl border-[#d4e8dc] bg-[#f8fbf9]/50">
            <CardContent className="py-3 px-5 text-xs text-slate-600">
              Record where the complaint is now and what actions have been taken during investigation.
            </CardContent>
          </Card>
          {renderInvestigationSection(false, row)}
        </>
      );
    }
    if (activeStage === "escalation") {
      return (
        <>
          <Card className="rounded-2xl border-[#d4e8dc] bg-[#f8fbf9]/50">
            <CardContent className="py-3 px-5 text-xs text-slate-600">
              Record escalation details if the complaint needs to be moved to a higher authority.
            </CardContent>
          </Card>
          {renderEscalationSection(false, row)}
        </>
      );
    }
    return (
      <>
        <Card className="rounded-2xl border-[#d4e8dc] bg-[#f8fbf9]/50">
          <CardContent className="py-3 px-5 text-xs text-slate-600">
            Close the complaint and record the final outcome. Resolution days and SLA are calculated automatically.
          </CardContent>
        </Card>
        {renderResolutionSection(false, row)}
        {renderSlaReference(row?.priority_rating ?? f.priority_rating)}
      </>
    );
  };

  const stageSaveLabel: Record<LifecycleStage, string> = {
    registration: "Save Registration",
    investigation: "Save Investigation",
    escalation: "Save Escalation",
    resolution: "Save Resolution",
  };

  if (mode === "register") {
    return (
      <div className="flex flex-col h-full bg-slate-50/30">
        <div className="bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={closeSub} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Register Complaint</h2>
              <p className="text-xs text-muted-foreground">Step 1 — Complaint &amp; parties (investigation follows after registration)</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="w-full px-4 md:px-6 py-4 pb-24 space-y-4">
            <Card className="rounded-2xl border-[#d4e8dc] bg-[#f8fbf9]/50">
              <CardContent className="py-3 px-5 flex items-center gap-3">
                <Badge className="bg-[#25a872]">1</Badge>
                <p className="text-xs text-slate-600">Register the complaint first. Investigation, escalation, and resolution are recorded separately after this.</p>
              </CardContent>
            </Card>
            {renderComplaintSection(false)}
            {renderPartiesSection(false)}
          </div>
        </ScrollArea>

        <div className="sticky bottom-0 z-30 bg-white border-t px-4 md:px-6 py-3 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={closeSub}>Cancel</Button>
          <Button onClick={handleSaveRegistration} disabled={saving} className="bg-orange-action hover:bg-orange-600 gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Register &amp; Continue
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "manage") {
    const row = selected;
    const canSaveStage = activeStage !== "registration";

    return (
      <div className="flex flex-col h-full bg-slate-50/30">
        <div className="bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={closeSub} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Complaint Management</h2>
              <p className="text-xs text-muted-foreground">{row?.complaint_number} — lifecycle tracking</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="w-full px-4 md:px-6 py-4 pb-24 space-y-4">
            {row && renderLifecycleStepper(row)}
            {renderStageContent()}
          </div>
        </ScrollArea>

        {canSaveStage && (
          <div className="sticky bottom-0 z-30 bg-white border-t px-4 md:px-6 py-3 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 hidden sm:block">
              Saving updates only the <strong>{lifecycleStageLabel(activeStage)}</strong> stage
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <Button variant="outline" onClick={closeSub}>Back to List</Button>
              <Button onClick={() => handleSaveStage(activeStage)} disabled={saving} className="bg-orange-action hover:bg-orange-600 gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {stageSaveLabel[activeStage]}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Complaints Management</h2>
            <p className="text-xs text-muted-foreground">Register, investigate, escalate, and resolve complaints</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button className="bg-orange-action hover:bg-orange-600 gap-2" onClick={openRegister}>
            <Plus className="w-4 h-4" /> Register Complaint
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="w-full px-4 md:px-6 py-4 space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { label: "Total", value: listStats.total, icon: <MessageSquare className="w-4 h-4 text-[#25a872]" />, accent: "border-[#d4e8dc]" },
              { label: "Open", value: listStats.open, icon: <Clock className="w-4 h-4 text-amber-600" />, accent: "border-amber-200" },
              { label: "Investigation", value: listStats.investigation, icon: <Search className="w-4 h-4 text-blue-600" />, accent: "border-blue-200" },
              { label: "Escalated", value: listStats.escalated, icon: <AlertTriangle className="w-4 h-4 text-purple-600" />, accent: "border-purple-200" },
              { label: "Resolved", value: listStats.resolved, icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, accent: "border-emerald-200" },
              {
                label: "SLA Met",
                value: listStats.slaTracked ? `${listStats.slaMet}/${listStats.slaTracked}` : "—",
                icon: <CheckCircle2 className="w-4 h-4 text-slate-600" />,
                accent: "border-slate-200",
              },
            ].map((k) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 bg-white border ${k.accent}`}
              >
                <div className="mb-2">{k.icon}</div>
                <p className="text-2xl font-black text-slate-800">{k.value}</p>
                <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-wide">{k.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardContent className="py-3 px-4">
              <div className="flex flex-nowrap items-center gap-2 w-full">
                <div className="relative flex-[2] min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    className="pl-9 h-9 w-full"
                    placeholder="Search ID, category, type..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="h-9 w-full"
                  />
                </div>
                {!geoLocked && (
                  <>
                    <div className="flex-1 min-w-0">
                      <Select value={filterZone} onValueChange={(v) => { setFilterZone(v); setFilterState("all"); }}>
                        <SelectTrigger className="h-9 w-full" displayValue={filterZone === "all" ? "All Zones" : pickGeoLabel(zones, filterZone, "Zone")}>
                          <SelectValue placeholder="Zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Zones</SelectItem>
                          {zones.map((z) => <SelectItem key={z.id} value={String(z.id)}>{z.description}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Select value={filterState} onValueChange={setFilterState}>
                        <SelectTrigger className="h-9 w-full" displayValue={filterState === "all" ? "All States" : pickGeoLabel(filterStates, filterState, "State")}>
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All States</SelectItem>
                          {filterStates.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.description}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="flex-1 min-w-0">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9 w-full" displayValue={filterStatus === "all" ? "All Statuses" : filterStatus}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {COMPLAINT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-0">
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="h-9 w-full" displayValue={filterPriority === "all" ? "All Priorities" : filterPriority}>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {PRIORITY_RATINGS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="rounded-2xl border-[#d4e8dc] overflow-hidden shadow-sm">
            <CardHeader className="pb-3 border-b bg-[#f8fbf9]">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#145c3f]">
                  <MessageSquare className="w-4 h-4" />
                  {loading ? "Loading..." : `${filtered.length} complaint${filtered.length === 1 ? "" : "s"}`}
                </CardTitle>
                {!loading && filtered.length > 0 && (
                  <span className="text-[10px] text-slate-500">Click Manage to continue the lifecycle</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Loading complaints...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#e8f5ee] flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-[#25a872]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">No complaints found</p>
                    <p className="text-xs text-slate-400 mt-1">Register a new complaint or adjust your filters</p>
                  </div>
                  <Button className="bg-orange-action hover:bg-orange-600 gap-2" onClick={openRegister}>
                    <Plus className="w-4 h-4" /> Register Complaint
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#f0fdf7] hover:bg-[#f0fdf7]">
                        <TableHead className="text-xs font-bold">Complaint ID</TableHead>
                        <TableHead className="text-xs font-bold">Type</TableHead>
                        <TableHead className="text-xs font-bold">Category / Domain</TableHead>
                        <TableHead className="text-xs font-bold">Priority</TableHead>
                        <TableHead className="text-xs font-bold">Received</TableHead>
                        <TableHead className="text-xs font-bold">Stage</TableHead>
                        <TableHead className="text-xs font-bold">Status</TableHead>
                        <TableHead className="text-xs font-bold">SLA</TableHead>
                        <TableHead className="text-xs font-bold w-28"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(i * 0.02, 0.3) }}
                          className="border-b border-slate-100 hover:bg-[#f8fbf9]/80 transition-colors"
                        >
                          <TableCell className="font-mono text-xs font-bold text-primary whitespace-nowrap">
                            {c.complaint_number}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-semibold">{c.complaint_type || "—"}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-xs font-medium text-slate-800 truncate">{c.complaint_category || c.category || "—"}</p>
                            <p className="text-[10px] text-slate-400 truncate">{c.complaint_domain || "—"}</p>
                          </TableCell>
                          <TableCell>{priorityBadge(c.priority_rating)}</TableCell>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {c.date_received || c.complaint_date || "—"}
                          </TableCell>
                          <TableCell>{stageBadge(c)}</TableCell>
                          <TableCell>{statusBadge(c.status)}</TableCell>
                          <TableCell>
                            {c.resolution_within_sla == null ? (
                              <span className="text-xs text-slate-300">—</span>
                            ) : (
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-semibold ${c.resolution_within_sla ? "text-emerald-700 border-emerald-200 bg-emerald-50" : "text-rose-700 border-rose-200 bg-rose-50"}`}
                              >
                                {c.resolution_within_sla ? "Met" : "Missed"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5 border-[#d4e8dc] hover:bg-[#e8f5ee] hover:text-[#145c3f]"
                              onClick={() => openManage(c)}
                            >
                              Manage
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
