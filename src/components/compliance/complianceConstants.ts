/** Lookup lists from Compliance Officer Template.xlsx */

export const OWNERSHIP_OPTIONS = [
  "Public", "Private", "Faith-Based", "Other (Specify)",
];

export const FACILITY_TYPE_OPTIONS = [
  "PHC", "Primary", "Secondary", "Other",
];

export const COMPLAINT_CATEGORIES = [
  "Delay/Denial of Service",
  "Poor Attitude of Staff",
  "Drug Unavailability",
  "Illegal Charges",
  "Other",
];

export const ESCALATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "state_office", label: "State Office" },
  { value: "zonal_office", label: "Zonal Office" },
  { value: "enforcement_department", label: "Enforcement Department" },
];

export const ENFORCEMENT_ACTIONS = [
  "Verbal Warning Issued",
  "Written Compliance Notice Issued",
  "Corrective Action Plan Requested",
  "Escalation to State Office",
  "Escalation to Zonal Office",
  "Escalation to Enforcement Department",
  "Recommendation for Sanctions",
  "None",
];

export const COMPLIANCE_RATINGS = [
  { value: "fully_compliant", label: "Fully Compliant" },
  { value: "partially_compliant", label: "Partially Compliant" },
  { value: "non_compliant", label: "Non-Compliant" },
];

export const CONFIRMATION_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const COMPLIANCE_SECTIONS: Record<string, string[]> = {
  "Service Delivery": [
    "Enrollees received services without denial or delays",
    "Illegal co-payments demanded",
    "Approved benefit package adhered to",
    "Emergency care provided without prior authorization",
    "Referral protocols followed",
  ],
  "Medicines & Consumables": [
    "Prescribed medicines available",
    "NHIA medicines list used",
    "Alternative arrangement during stock-out",
  ],
  "Provider-HMO Interface": [
    "Timely submission of claims",
    "Prompt receipt of payments",
    "Dispute with HMO",
  ],
};

export function currentISOWeek(date = new Date()): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function quarterFromWeek(week: number): number {
  return Math.min(4, Math.ceil(week / 13) || 1);
}

export function ratingLabel(v: string): string {
  return COMPLIANCE_RATINGS.find(r => r.value === v)?.label ?? v;
}
