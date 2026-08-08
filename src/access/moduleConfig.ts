export type UserRole =
  | "admin" | "state-officer" | "zonal-coordinator"
  | "state-coordinator" | "department-officer" | "sdo" | "hq-department" | "dg-ceo";

export interface ChildModule {
  title: string;
  view?: string;
}

export interface SubGroup {
  type: "group";
  label: string;
  children: ChildModule[];
}

export interface ParentModule {
  title: string;
  roles: UserRole[] | "all" | string;
  /** Flat children OR nested sub-groups */
  children: (ChildModule | SubGroup)[];
}

/** Parent module key for SOC/Zonal reporting (sidebar label: SOC/Zones) */
export const SOC_ZONES_MODULE = "SOC/Zones";

/** Older user records may still store this access_to value */
export const SOC_ZONES_LEGACY_ALIASES = ["State Offices"] as const;

export function resolveModuleTitle(accessTo: string): string {
  if ((SOC_ZONES_LEGACY_ALIASES as readonly string[]).includes(accessTo)) {
    return SOC_ZONES_MODULE;
  }
  return accessTo;
}

export function moduleConfigForAccess(accessTo: string): ParentModule | undefined {
  return MODULE_CONFIG.find(m => m.title === resolveModuleTitle(accessTo));
}

/**
 * Exact match of the sidebar nav JSON structure.
 * title = access_to key stored in user.functionalities
 */
export const MODULE_CONFIG: ParentModule[] = [
  // ── Dashboard ──────────────────────────────────────────────────────────────
  {
    title: "Dashboard",
    roles: "all",
    children: [
      { title: "Dashboard", view: "home" },
    ],
  },

  // ── Annual Reports ─────────────────────────────────────────────────────────
  {
    title: "Annual Reports",
    roles: "!dg-ceo",
    children: [
      { title: "Annual Report", view: "annual-reports-list" },
    ],
  },
  {
    title: "Finance & Admin Dept",
    roles: "all",
    children: [
      { type: "group", label: "Finance", children: [
        { title: "Monthly Report", view: "finance-monthly" },
      ]},
      { type: "group", label: "Admin", children: [
        { title: "Monthly Report", view: "admin-monthly" },
      ]},
    ],
  },

  // ── Standards & Quality Assurance ─────────────────────────────────────────
  {
    title: "Standards & Quality Assurance",
    roles: "all",
    children: [
      { type: "group", label: "HMO/HCP Quality Assurance", children: [
        { title: "Monthly Report", view: "sqa-monthly" },
      ]},
      { type: "group", label: "Enrollee Complaints / SHIA Liaison", children: [
        { title: "Monthly Report", view: "complaints-monthly" },
      ]},
      { type: "group", label: "Compliance Management", children: [
        { title: "Compliance Management", view: "sqa-compliance" },
      ]},
    ],
  },

  // ── Zonal ICT Support ──────────────────────────────────────────────────────
  {
    title: "Zonal ICT Support",
    roles: "all",
    children: [
      { title: "ICT Support Desk"  },
      { title: "Systems & Network" },
    ],
  },

  // ── Programmes ─────────────────────────────────────────────────────────────
  {
    title: "Programmes",
    roles: "all",
    children: [
      { type: "group", label: "Enrolment", children: [
        { title: "Monthly Report", view: "programmes-monthly" },
      ]},
      { type: "group", label: "Enrollment Enquiries & Outreach", children: [
        { title: "Monthly Report", view: "outreach-monthly" },
      ]},
    ],
  },

  // ── SDO ────────────────────────────────────────────────────────────────────
  {
    title: "SDO",
    roles: "all",
    children: [
      { title: "Stock Verification", view: "stock-verifications-list" },
      { title: "Asset Register",     view: "stock-assets"             },
      { type: "group", label: "SERVICOM", children: [
        { title: "Dashboard",                    view: "servicom-dashboard"           },
        { title: "Complaints Management",      view: "servicom-complaints"          },
        { title: "Customer Satisfaction Survey", view: "servicom-satisfaction"        },
        { title: "Charter Performance",          view: "servicom-comment-card"        },
      ]},
    ],
  },

  // ── SOC/Zonal (state office monthly & weekly reports) ───────────────────────
  {
    title: SOC_ZONES_MODULE,
    roles: "all",
    children: [
      { type: "group", label: "Enrolment", children: [
        { title: "Enrolment", view: "state-enrolment" },
      ]},
      { type: "group", label: "Migration", children: [
        { title: "Migration / Update Requests", view: "state-migration" },
      ]},
      { type: "group", label: "CEmONC & FFP", children: [
        { title: "CEmONC & FFP Beneficiaries", view: "state-cemonc" },
      ]},
      { type: "group", label: "Monitoring", children: [
        { title: "Monitoring Visits", view: "servicom-visits" },
      ]},
      { type: "group", label: "Complaints & Compliance", children: [
        { title: "Enrollee Complaints", view: "state-complaints" },
        { title: "Compliance Monitoring", view: "state-compliance-monitoring" },
        { title: "Reconciliation Meetings", view: "state-reconciliation" },
      ]},
      { type: "group", label: "Accreditation & Reaccreditation", children: [
        { title: "Accreditation / Reaccreditation", view: "state-accreditation" },
      ]},
      { type: "group", label: "Stakeholder Engagement", children: [
        { title: "Stakeholder Engagement", view: "state-stakeholder" },
      ]},
      { type: "group", label: "HMO Selection", children: [
        { title: "HMO Selection Process", view: "state-hmo-selection" },
      ]},
      { type: "group", label: "Challenges & Recommendations", children: [
        { title: "Challenges & Recommendations", view: "state-challenges" },
      ]},
      { type: "group", label: "Finance", children: [
        { title: "IGR", view: "state-igr" },
        { title: "SSHIA Financial Report", view: "state-sshia-financial" },
        { title: "Expenditure Profile", view: "state-expenditure-profile" },
      ]},
      { title: "Weekly Actionable",   view: "state-weekly-actionable"   },
      { title: "Contracted Services", view: "state-contracted-services" },
    ],
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  {
    title: "Notifications",
    roles: "all",
    children: [{ title: "Notifications", view: "notifications" }],
  },

  // ── Settings (granted via Privileges) ─────────────────────────────────────
  {
    title: "Settings",
    roles: "all",
    children: [{ title: "Settings", view: "settings" }],
  },
];

/** Map state-* view keys to SOC/Zones functionality titles (for access guards) */
export const STATE_VIEW_TO_FUNCTIONALITY: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  const mod = MODULE_CONFIG.find(m => m.title === "SOC/Zones");
  if (!mod) return out;
  for (const c of mod.children) {
    if ("type" in c && c.type === "group") {
      c.children.forEach(leaf => {
        if (leaf.view) out[leaf.view] = leaf.title;
      });
    } else if ((c as ChildModule).view) {
      out[(c as ChildModule).view!] = (c as ChildModule).title;
    }
  }
  return out;
})();

/** Flatten all leaf titles from a module (for privilege checkboxes) */
export function flatLeaves(mod: ParentModule): string[] {
  const out: string[] = [];
  for (const c of mod.children) {
    if ("type" in c && c.type === "group") {
      c.children.forEach(leaf => out.push(leaf.title));
    } else {
      out.push((c as ChildModule).title);
    }
  }
  return out;
}

/** True if the module has at least one child with a routable view */
export function hasRoutableView(mod: ParentModule): boolean {
  return mod.children.some(c => {
    if ("type" in c && c.type === "group") {
      return c.children.some(leaf => !!leaf.view);
    }
    return !!(c as ChildModule).view;
  });
}
