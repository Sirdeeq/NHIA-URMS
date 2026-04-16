export type UserRole =
  | "admin" | "state-officer" | "zonal-coordinator"
  | "state-coordinator" | "sdo" | "hq-department" | "dg-ceo";

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
      { title: "New Annual Report", view: "annual-report"       },
      { title: "My Submissions",    view: "annual-reports-list" },
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
      { title: "Stock Verification", view: "stock-verification"       },
      { title: "My Verifications",   view: "stock-verifications-list" },
      { title: "Asset Register",     view: "stock-assets"             },
    ],
  },

  // ── Directives ─────────────────────────────────────────────────────────────
  {
    title: "Directives",
    roles: "dg-ceo",
    children: [{ title: "Directives", view: "directives" }],
  },

  // ── Reports ────────────────────────────────────────────────────────────────
  {
    title: "National Reports",
    roles: "dg-ceo",
    children: [{ title: "National Reports", view: "national-reports" }],
  },
  {
    title: "Zonal Performance",
    roles: "dg-ceo",
    children: [{ title: "Zonal Performance", view: "zonal-performance" }],
  },

  // ── HQ Data ────────────────────────────────────────────────────────────────
  {
    title: "HQ Data",
    roles: "all",
    children: [{ title: "HQ Data", view: "hq-data" }],
  },

  // ── Archive ────────────────────────────────────────────────────────────────
  {
    title: "Archive",
    roles: "all",
    children: [{ title: "Archive", view: "archive" }],
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  {
    title: "Notifications",
    roles: "all",
    children: [{ title: "Notifications", view: "notifications" }],
  },

  // ── Settings (admin only) ──────────────────────────────────────────────────
  {
    title: "Settings",
    roles: "admin",
    children: [{ title: "Settings", view: "settings" }],
  },
];

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
