export interface HcfClassificationEntry {
  reference: string;
  entity: string;
  offence: string;
  domain: string;
  category: string;
  categoryCode: string;
  priority: string;
}

/** From Complaints Register Template — Complaint Classification Guide (HCF) */
export const HCF_CLASSIFICATION_GUIDE: HcfClassificationEntry[] = [
  {
    "reference": "HCF-5.5.2",
    "entity": "HCF",
    "offence": "Receipt and management of any enrollee as a fee-paying patient.",
    "domain": "Financial",
    "category": "Billing",
    "categoryCode": "HCF-BILL-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.3",
    "entity": "HCF",
    "offence": "Solicitation, collection, or charging any fee from any enrollee in addition to the fees payable by NHIA, except for a 10% co-payment for prescribed drugs.",
    "domain": "Financial",
    "category": "Billing",
    "categoryCode": "HCF-BILL-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.11",
    "entity": "HCF",
    "offence": "Making false claims to the HMOs for a treatment/procedure not carried out.",
    "domain": "Financial",
    "category": "Fraud",
    "categoryCode": "HCF-FRD-001",
    "priority": "High"
  },
  {
    "reference": "HCF-5.5.13",
    "entity": "HCF",
    "offence": "Engaging in any fraudulent activity.",
    "domain": "Financial",
    "category": "Fraud",
    "categoryCode": "HCF-FRD-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.14",
    "entity": "HCF",
    "offence": "Misrepresentation on the part of the Health care Facility at the time of application.",
    "domain": "Financial",
    "category": "Fraud",
    "categoryCode": "HCF-FRD-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.24",
    "entity": "HCF",
    "offence": "Non-adherence to drug and professional service tariffs during billing/claims preparation.",
    "domain": "Financial",
    "category": "Billing",
    "categoryCode": "HCF-BILL-001",
    "priority": "High"
  },
  {
    "reference": "HCF-5.5.4",
    "entity": "HCF",
    "offence": "Not operating 24 hours a day, 7 days a week.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.7",
    "entity": "HCF",
    "offence": "Failure to keep and maintain standard medical records in respect of each or all enrollees.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.8",
    "entity": "HCF",
    "offence": "Failure to permit NHIA officers and representatives of the HMO the right to enter any part of the premises for inspection and monitoring of facilities for quality assurance.)",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.9",
    "entity": "HCF",
    "offence": "Failure to duly notify the Authority, the enrollees registered with it, and HMOs within 3 months of its intention to relocate to a new place by publication in the National newspapers.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "High"
  },
  {
    "reference": "HCF-5.5.10",
    "entity": "HCF",
    "offence": "Breach of the 3 months written notice to the Authority, and failure to publish in the National newspapers, notify the enrollees registered with it and the HMOs of its intention to exit from the Authority.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "High"
  },
  {
    "reference": "HCF-5.5.15",
    "entity": "HCF",
    "offence": "Specified NHIA technical/ personnel requirements are no longer being met.",
    "domain": "Operational",
    "category": "Staffing & Resources",
    "categoryCode": "HCF-STR-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.17",
    "entity": "HCF",
    "offence": "Failure to make monthly returns to the NHIA or its duly authorized agents.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.19",
    "entity": "HCF",
    "offence": "Failure to submit claims within the stipulated period.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "High"
  },
  {
    "reference": "HCF-5.5.22",
    "entity": "HCF",
    "offence": "Failure to issue a receipt of payments received/LONI to HMOs.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.23",
    "entity": "HCF",
    "offence": "Failure to comply with sanctions within 30 days of the imposition of the sanctions.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.26",
    "entity": "HCF",
    "offence": "Refusal to procure professional indemnity insurance cover.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.27",
    "entity": "HCF",
    "offence": "Refusal to honor invitations or respond to correspondences from NHIA.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "High"
  },
  {
    "reference": "HCF-5.5.28",
    "entity": "HCF",
    "offence": "Absent medium for grievance redress.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "High"
  },
  {
    "reference": "HCF-5.5.29",
    "entity": "HCF",
    "offence": "Absence of an effective NHIA Desk Office.",
    "domain": "Operational",
    "category": "Administrative",
    "categoryCode": "HCF-ADM-001",
    "priority": "High"
  },
  {
    "reference": "HCF-5.5.31",
    "entity": "HCF",
    "offence": "Non-compliance with recommended ICT specifications.",
    "domain": "Operational",
    "category": "Staffing & Resources",
    "categoryCode": "HCF-STR-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.1",
    "entity": "HCF",
    "offence": "Discrimination against NHIA Patient",
    "domain": "Relationship",
    "category": "Abuse",
    "categoryCode": "HCF-ABU-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.16",
    "entity": "HCF",
    "offence": "Breach of confidentiality and privacy -\n Deliberately and against medical ethics divulging information about patients.",
    "domain": "Relationship",
    "category": "Communication",
    "categoryCode": "HCF-COM-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.30",
    "entity": "HCF",
    "offence": "Unauthorized sharing of health insurance information data.",
    "domain": "Relationship",
    "category": "Abuse",
    "categoryCode": "HCF-ABU-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.32",
    "entity": "HCF",
    "offence": "Assault / inappropriate or aggressive behaviour of provider on enrollee.",
    "domain": "Relationship",
    "category": "Abuse",
    "categoryCode": "HCF-ABU-001",
    "priority": "Medium"
  },
  {
    "reference": "HCF-5.5.36",
    "entity": "HCF",
    "offence": "Refusal to obtain enrollees\u2019 consent or consent not adequately explained.",
    "domain": "Relationship",
    "category": "Communication",
    "categoryCode": "HCF-COM-001",
    "priority": "High"
  },
  {
    "reference": "HCF-5.5.37",
    "entity": "HCF",
    "offence": "Poor Provider-Stakeholder communication wherein deficient or wrong information is communicated.",
    "domain": "Relationship",
    "category": "Communication",
    "categoryCode": "HCF-COM-001",
    "priority": "High"
  },
  {
    "reference": "HCF-5.5.0",
    "entity": "HCF",
    "offence": "Refusal to treat/manage any enrollees and their covered dependents after receiving payments from the relevant HMOs on behalf of such enrollees.",
    "domain": "Service Delivery",
    "category": "Access",
    "categoryCode": "HCF-ACC-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.5",
    "entity": "HCF",
    "offence": "Refusal to refer.",
    "domain": "Service Delivery",
    "category": "Referral",
    "categoryCode": "HCF-REF-002",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.6",
    "entity": "HCF",
    "offence": "Referring an enrollee elsewhere for a service for which the Facility is accredited to render.",
    "domain": "Service Delivery",
    "category": "Referral",
    "categoryCode": "HCF-REF-002",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.12",
    "entity": "HCF",
    "offence": "Deliberately and against medical ethics under-managing an enrollee.",
    "domain": "Service Delivery",
    "category": "Quality of Care",
    "categoryCode": "HCF-QOC-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.18",
    "entity": "HCF",
    "offence": "Denial of emergency care to enrollees who are out-of-station or not primarily registered in the Facility.",
    "domain": "Service Delivery",
    "category": "Access",
    "categoryCode": "HCF-ACC-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.20",
    "entity": "HCF",
    "offence": "Failure to make adequate alternative arrangements for the provision of service/drugs during strike/industrial action or out-of-stock.",
    "domain": "Service Delivery",
    "category": "Access",
    "categoryCode": "HCF-ACC-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.21",
    "entity": "HCF",
    "offence": "Refusal to dispense medications",
    "domain": "Service Delivery",
    "category": "Access",
    "categoryCode": "HCF-ACC-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.25",
    "entity": "HCF",
    "offence": "Non-adherence to the referral protocol/procedure.",
    "domain": "Service Delivery",
    "category": "Referral",
    "categoryCode": "HCF-REF-002",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.33",
    "entity": "HCF",
    "offence": "Delay in accessing care (waiting time, diagnoses, treatment, etc.) beyond the specified time in the Standard Treatment Protocol.",
    "domain": "Service Delivery",
    "category": "Access",
    "categoryCode": "HCF-ACC-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.34",
    "entity": "HCF",
    "offence": "Problems with the coordination of treatment in different services by clinical staff",
    "domain": "Service Delivery",
    "category": "Quality of Care",
    "categoryCode": "HCF-QOC-001",
    "priority": "Top"
  },
  {
    "reference": "HCF-5.5.35",
    "entity": "HCF",
    "offence": "Refusal to adhere to patient safety measures as specified in the Standard Treatment Protocol.",
    "domain": "Service Delivery",
    "category": "Quality of Care",
    "categoryCode": "HCF-QOC-001",
    "priority": "Top"
  }
];

export function domainCodeFromDomain(domain: string) {
  const map: Record<string, string> = {
    Financial: "FIN", Operational: "OPS", Relationship: "REL", "Service Delivery": "SRV",
  };
  return map[domain] ?? domain.slice(0, 3).toUpperCase();
}
