export type UserRole =
  | "admin" | "state-officer" | "zonal-coordinator"
  | "state-coordinator" | "department-officer" | "sdo" | "hq-department" | "dg-ceo";

export interface ChildModule {
  title: string;
  view?: string;
  path?: string;
}

export interface SubGroup {
  type: "group";
  label: string;
  /** Flat leaves and/or nested sub-groups (tree nav) */
  children: (ChildModule | SubGroup)[];
}

export interface ParentModule {
  title: string;
  roles: UserRole[] | "all" | string;
  /** Flat children OR nested sub-groups */
  children: (ChildModule | SubGroup)[];
}

export function isSubGroup(c: ChildModule | SubGroup): c is SubGroup {
  return "type" in c && c.type === "group";
}

/** Parent module key for SOC/Zonal reporting (sidebar label: SOC/Zones) */
export const SOC_ZONES_MODULE = "SOC/Zones";

/** Older user records may still store these access_to values */
export const SOC_ZONES_LEGACY_ALIASES = ["State Offices"] as const;

export function resolveModuleTitle(accessTo: string): string {
  if ((SOC_ZONES_LEGACY_ALIASES as readonly string[]).includes(accessTo)) {
    return SOC_ZONES_MODULE;
  }
  if (accessTo === "Store Management") return "Asset Management (SVO)";
  return accessTo;
}

export function moduleConfigForAccess(accessTo: string): ParentModule | undefined {
  return MODULE_CONFIG.find((m) => m.title === resolveModuleTitle(accessTo));
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
      { title: "Dashboard", view: "home", path: "/" },
    ],
  },

  // ── Annual Reports ─────────────────────────────────────────────────────────
  {
    title: "Annual Reports",
    roles: "!dg-ceo",
    children: [
      { title: "Annual Report", view: "annual-reports-list", path: "/annual-reports/mine" },
    ],
  },
  {
    title: "Finance & Admin Dept",
    roles: "all",
    children: [
      { type: "group", label: "Finance", children: [
        { title: "Finance Report", view: "finance-monthly", path: "/monthly/finance" },
      ]},
      { type: "group", label: "Admin", children: [
        { title: "Admin Report", view: "admin-monthly", path: "/monthly/admin" },
      ]},
    ],
  },

  // ── Standards & Quality Assurance ─────────────────────────────────────────
  {
    title: "Standards & Quality Assurance",
    roles: "all",
    children: [
      { type: "group", label: "HMO/HCP Quality Assurance", children: [
        { title: "SQA Report", view: "sqa-monthly", path: "/monthly/sqa" },
      ]},
      { type: "group", label: "Enrollee Complaints / SHIA Liaison", children: [
        { title: "Complaints Report", view: "complaints-monthly", path: "/monthly/complaints" },
      ]},
      { type: "group", label: "Compliance Management", children: [
        { title: "Compliance Management", view: "sqa-compliance", path: "/compliance" },
      ]},
    ],
  },

  // ── Zonal ICT Support ──────────────────────────────────────────────────────
  {
    title: "Zonal ICT Support",
    roles: "all",
    children: [
      { title: "ICT Support Desk", path: "/ict/desk" },
      { title: "Systems & Network", path: "/ict/systems" },
    ],
  },

  // ── Programmes ─────────────────────────────────────────────────────────────
  {
    title: "Programmes",
    roles: "all",
    children: [
      { type: "group", label: "Enrolment", children: [
        { title: "Programmes Report", view: "programmes-monthly", path: "/monthly/programmes" },
      ]},
      { type: "group", label: "Enrollment Enquiries & Outreach", children: [
        { title: "Outreach Report", view: "outreach-monthly", path: "/monthly/outreach" },
      ]},
    ],
  },

  // ── SDO ────────────────────────────────────────────────────────────────────
  {
    title: "SDO",
    roles: "all",
    children: [
      { type: "group", label: "SERVICOM", children: [
        { title: "Charter Performance",          view: "servicom-comment-card", path: "/sdo/servicom/comment-card" },
        { title: "Complaints Management",        view: "servicom-complaints",   path: "/sdo/servicom/complaints" },
        { title: "Customer Satisfaction Survey", view: "servicom-satisfaction", path: "/sdo/servicom/satisfaction" },
      ]},
      { type: "group", label: "STOCK VERIFICATION", children: [
        { title: "Physical Asset Verification", view: "store-verification-verify", path: "/store-management/verification/verify" },
        { title: "Verification of Supply",      view: "store-supply-verification", path: "/store-management/verification/supply" },
      ]},
      { type: "group", label: "SPECIAL PROJECT", children: [] },
    ],
  },

  // ── Asset Management (SVO) — grant separately when assigning role access ────
  {
    title: "Asset Management (SVO)",
    roles: "all",
    children: [
      { title: "Register Asset",        view: "store-assets-register",   path: "/store-management/assets/register" },
      { title: "Asset Master Register", view: "store-assets-list",       path: "/store-management/assets/list" },
      { title: "Transfers & Movements", view: "store-asset-transfers",   path: "/store-management/transfers/requests" },
      { title: "Board Disposal",        view: "store-asset-disposal",    path: "/store-management/disposal/records" },
      { title: "Maintenance & Servicing", view: "store-asset-maintenance", path: "/store-management/maintenance/repairs" },
      { title: "Inventory Catalog",     view: "store-inventory-catalog", path: "/store-management/inventory/items" },
    ],
  },

  // ── SOC/Zonal (state office monthly & weekly reports) ───────────────────────
  {
    title: SOC_ZONES_MODULE,
    roles: "all",
    children: [
      { type: "group", label: "Enrolment", children: [
        { title: "Enrolment", view: "state-enrolment", path: "/soc/enrolment" },
      ]},
      { type: "group", label: "Migration", children: [
        { title: "Migration / Update Requests", view: "state-migration", path: "/soc/migration" },
      ]},
      { type: "group", label: "CEmONC & FFP", children: [
        { title: "CEmONC & FFP Beneficiaries", view: "state-cemonc", path: "/soc/cemonc" },
      ]},
      { type: "group", label: "Monitoring", children: [
        { title: "Monitoring Visits", view: "servicom-visits", path: "/soc/monitoring-visits" },
      ]},
      { type: "group", label: "Accreditation & Reaccreditation", children: [
        { title: "Accreditation / Reaccreditation", view: "state-accreditation", path: "/soc/accreditation" },
      ]},
      { type: "group", label: "Stakeholder Engagement", children: [
        { title: "Stakeholder Engagement", view: "state-stakeholder", path: "/soc/stakeholder" },
      ]},
      { type: "group", label: "HMO Selection", children: [
        { title: "HMO Selection Process", view: "state-hmo-selection", path: "/soc/hmo-selection" },
      ]},
      { type: "group", label: "Challenges & Recommendations", children: [
        { title: "Challenges & Recommendations", view: "state-challenges", path: "/soc/challenges" },
      ]},
      { type: "group", label: "Finance", children: [
        { title: "IGR", view: "state-igr", path: "/soc/igr" },
        { title: "SSHIA Financial Report", view: "state-sshia-financial", path: "/soc/sshia-financial" },
        { title: "Expenditure Profile", view: "state-expenditure-profile", path: "/soc/expenditure-profile" },
      ]},
      { title: "Weekly Actionable",   view: "state-weekly-actionable",   path: "/soc/weekly-actionable" },
      { title: "Contracted Services", view: "state-contracted-services", path: "/soc/contracted-services" },
    ],
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  {
    title: "Notifications",
    roles: "all",
    children: [{ title: "Notifications", view: "notifications", path: "/notifications" }],
  },

  // ── Settings (granted via Privileges) ─────────────────────────────────────
  {
    title: "Settings",
    roles: "all",
    children: [{ title: "Settings", view: "settings", path: "/settings" }],
  },
];

/** Map state-* view keys to SOC/Zones functionality titles (for access guards) */
export const STATE_VIEW_TO_FUNCTIONALITY: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  const mod = MODULE_CONFIG.find(m => m.title === "SOC/Zones");
  if (!mod) return out;
  const walk = (nodes: (ChildModule | SubGroup)[]) => {
    for (const c of nodes) {
      if (isSubGroup(c)) {
        walk(c.children);
      } else if (c.view) {
        out[c.view] = c.title;
      }
    }
  };
  walk(mod.children);
  return out;
})();

/** Flatten all leaf titles from a module (for privilege checkboxes) */
export function flatLeaves(mod: ParentModule): string[] {
  const out: string[] = [];
  const walk = (nodes: (ChildModule | SubGroup)[]) => {
    for (const c of nodes) {
      if (isSubGroup(c)) {
        walk(c.children);
      } else {
        out.push(c.title);
      }
    }
  };
  walk(mod.children);
  return out;
}

/** True if the module has at least one child with a routable view */
export function hasRoutableView(mod: ParentModule): boolean {
  const walk = (nodes: (ChildModule | SubGroup)[]): boolean =>
    nodes.some((c) => {
      if (isSubGroup(c)) return walk(c.children);
      return !!c.view;
    });
  return walk(mod.children);
}
