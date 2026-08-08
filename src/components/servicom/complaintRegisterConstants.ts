export const REPORTING_MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];

/** Lookup Lists — Complaint Type (column C) */
export const COMPLAINT_TYPES = [
  { value: "HCF", label: "HCF" },
  { value: "HMO", label: "HMO" },
  { value: "Enrollee", label: "Enrollee" },
];

export const COMPLAINT_DOMAINS = [
  "Financial", "Operational", "Relationship", "Service Delivery",
].map(v => ({ value: v, label: v }));

export const COMPLAINT_CATEGORIES = [
  "Billing", "Fraud", "Administrative", "Staffing & Resources", "Abuse",
  "Communication", "Access", "Referral", "Quality of Care",
].map(v => ({ value: v, label: v }));

export const PRIORITY_RATINGS = [
  { value: "Top", label: "Top" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
];

export const TRANSMISSION_ROUTES = [
  "Walk-in", "Phone", "Email", "Letter", "Portal",
  "Meetings, Conferences or Workshops", "Other",
].map(v => ({ value: v, label: v }));

/** Lookup Lists — Complainant Type (column D) */
export const COMPLAINANT_CATEGORIES = [
  "Enrollee", "Beneficiary Representative", "Healthcare Facility", "HMO",
  "Employer/MDA", "SSHIA", "Healthcare Worker", "NHIA Staff",
  "Vendor", "Partner Organisation", "General Public", "Anonymous", "Other",
].map(v => ({ value: v, label: v }));

/** Lookup Lists — Respondent Type (column G) */
export const RESPONDENT_CATEGORIES = [
  "Healthcare Facility", "HMO", "NHIA Office", "Employer/MDA", "Other",
].map(v => ({ value: v, label: v }));

export const COMPLAINT_STATUSES = [
  "New/Acknowledged", "Under Investigation", "Awaiting Information",
  "Awaiting Respondent Action", "Escalated", "Resolved", "Closed",
  "Referred to Appropriate Authority", "Complaint Withdrawn",
].map(v => ({ value: v, label: v }));

export const ACTIONS_TAKEN = [
  "Complaint acknowledged", "Investigation commenced", "Respondent contacted",
  "Site visit conducted", "Records reviewed", "Meeting held", "Mediation conducted",
  "Corrective action issued", "Sanction recommended", "Complaint resolved",
  "Complaint closed", "Referred to another authority", "Advice provided",
  "Follow-up conducted", "Other",
].map(v => ({ value: v, label: v }));

export const ESCALATION_LEVELS = [
  "State Internal", "Zonal Office", "NHIA Headquarters", "Other Regulatory Authority",
].map(v => ({ value: v, label: v }));

export const ESCALATED_TO = [
  "ENF", "SQA", "FSD", "ISD", "LEGAL", "NHIA Headquarters", "Other Regulatory Authority",
].map(v => ({ value: v, label: v }));

export const COMPLAINT_OUTCOMES = [
  "Complaint Upheld", "Complaint Partially Upheld", "Complaint Not Upheld",
  "Resolved Through Mediation", "Referred to Appropriate Authority",
  "Information/Advice Provided", "Duplicate Complaint", "Complaint Withdrawn",
].map(v => ({ value: v, label: v }));

export const SLA_SUMMARY = [
  { priority: "Top", acknowledge: "1 day", investigate: "1 day", escalate: "3 days", resolve: "5 days" },
  { priority: "High", acknowledge: "1 day", investigate: "2 days", escalate: "7 days", resolve: "10 days" },
  { priority: "Medium", acknowledge: "2 days", investigate: "3 days", escalate: "14 days", resolve: "20 days" },
];

export function monthLabel(value: number | string) {
  return REPORTING_MONTHS.find(m => m.value === Number(value))?.label ?? String(value);
}

export function domainCodeFromDomain(domain: string) {
  const map: Record<string, string> = {
    Financial: "FIN",
    Operational: "OPS",
    Relationship: "REL",
    "Service Delivery": "SRV",
  };
  return map[domain] ?? domain.slice(0, 3).toUpperCase();
}

const SLA_RESOLVE_DAYS: Record<string, number> = { Top: 5, High: 10, Medium: 20 };

export function computeResolutionPreview(
  dateReceived: string,
  dateClosed: string,
  priority: string,
) {
  if (!dateReceived || !dateClosed) {
    return { resolution_days: null as number | null, resolution_within_sla: null as boolean | null };
  }
  const d1 = new Date(dateReceived);
  const d2 = new Date(dateClosed);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
    return { resolution_days: null, resolution_within_sla: null };
  }
  const resolution_days = Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000));
  const target = SLA_RESOLVE_DAYS[priority];
  const resolution_within_sla = target != null ? resolution_days <= target : null;
  return { resolution_days, resolution_within_sla };
}

export function slaForPriority(priority: string) {
  return SLA_SUMMARY.find((s) => s.priority === priority) ?? null;
}

export const STATUS_BADGE_CLASS: Record<string, string> = {
  "New/Acknowledged": "bg-blue-50 text-blue-700 border-blue-200",
  "Under Investigation": "bg-amber-50 text-amber-800 border-amber-200",
  "Awaiting Information": "bg-orange-50 text-orange-800 border-orange-200",
  "Awaiting Respondent Action": "bg-orange-50 text-orange-800 border-orange-200",
  Escalated: "bg-purple-50 text-purple-800 border-purple-200",
  Resolved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Closed: "bg-slate-100 text-slate-700 border-slate-200",
  "Referred to Appropriate Authority": "bg-indigo-50 text-indigo-800 border-indigo-200",
  "Complaint Withdrawn": "bg-rose-50 text-rose-700 border-rose-200",
};

export type LifecycleStage = "registration" | "investigation" | "escalation" | "resolution";

export const COMPLAINT_LIFECYCLE: {
  id: LifecycleStage;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  { id: "registration", label: "1. Complaint", shortLabel: "Complaint", description: "Register the complaint" },
  { id: "investigation", label: "2. Investigation", shortLabel: "Investigation", description: "Record investigation progress" },
  { id: "escalation", label: "3. Escalation", shortLabel: "Escalation", description: "Escalate when required" },
  { id: "resolution", label: "4. Resolution", shortLabel: "Resolution", description: "Close and resolve" },
];

export const INVESTIGATION_STATUSES = COMPLAINT_STATUSES.filter((s) =>
  ["New/Acknowledged", "Under Investigation", "Awaiting Information", "Awaiting Respondent Action"].includes(s.value),
);

export const RESOLUTION_STATUSES = COMPLAINT_STATUSES.filter((s) =>
  ["Resolved", "Closed", "Referred to Appropriate Authority", "Complaint Withdrawn"].includes(s.value),
);

export function lifecycleStageFromStatus(status: string, row?: { escalated?: boolean }): LifecycleStage {
  if (["Resolved", "Closed", "Referred to Appropriate Authority", "Complaint Withdrawn"].includes(status)) {
    return "resolution";
  }
  if (row?.escalated || status === "Escalated") return "escalation";
  if (["Under Investigation", "Awaiting Information", "Awaiting Respondent Action"].includes(status)) {
    return "investigation";
  }
  return "registration";
}

export function getStageCompletion(row: any): Record<LifecycleStage, boolean> {
  if (!row) {
    return { registration: false, investigation: false, escalation: false, resolution: false };
  }
  return {
    registration: !!(row.complaint_number && row.complaint_type),
    investigation: !!(row.officer_assigned || row.investigation_start_date || row.actions_taken),
    escalation: !!row.escalated,
    resolution: !!(row.date_closed || row.outcome),
  };
}

export function lifecycleStageLabel(stage: LifecycleStage) {
  return COMPLAINT_LIFECYCLE.find((s) => s.id === stage)?.shortLabel ?? stage;
}
