import * as React from "react";
import {
  Home, FileText, ChevronDown, ChevronRight,
  DollarSign, Building2, Users, Wrench,
  ShieldCheck, ClipboardList, Wifi,
  LayoutGrid, Briefcase, PackageSearch,
  Radio, FolderKanban, History, CheckSquare,
  Flag, MapPin, Database, Archive, Bell, Settings,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Types ────────────────────────────────────────────────────────────────────

type View = string;

interface LeafItem {
  type: "leaf";
  label: string;
  icon: React.ReactNode;
  view?: View;
  onClick?: () => void;
  roles?: string;
}

interface GroupItem {
  type: "group";
  label: string;
  icon: React.ReactNode;
  roles?: string;
  children: (LeafItem | GroupItem)[];
}

type NavItem = LeafItem | GroupItem;

// ─── Nav tree definition ──────────────────────────────────────────────────────

export function buildNavTree(
  role: string,
  view: View,
  setView: (v: View) => void
): NavItem[] {
  return [
    // ── Dashboard ──────────────────────────────────────────────────────────
    {
      type: "leaf",
      label: "Dashboard",
      icon: <Home className="w-4 h-4" />,
      view: "home",
      onClick: () => setView("home"),
      roles: "all",
    },

    // ── Annual Reports ─────────────────────────────────────────────────────
    // {
    //   type: "group",
    //   label: "Annual Reports",
    //   icon: <FileText className="w-4 h-4" />,
    //   roles: "!dg-ceo",
    //   children: [
    //     { type: "leaf", label: "New Annual Report",  icon: <FileText className="w-3.5 h-3.5" />, view: "annual-report",       onClick: () => setView("annual-report") },
    //     { type: "leaf", label: "My Submissions",     icon: <History className="w-3.5 h-3.5" />,  view: "annual-reports-list", onClick: () => setView("annual-reports-list") },
    //     { type: "leaf", label: "Submit Report",      icon: <ClipboardList className="w-3.5 h-3.5" />, view: "report-entry",  onClick: () => setView("report-entry") },
    //     { type: "leaf", label: "Review Reports",     icon: <CheckSquare className="w-3.5 h-3.5" />,   view: "zonal-review",  onClick: () => setView("zonal-review"), roles: "zonal-director,sdo,hq-department,audit" },
    //   ],
    // },

    // ── Finance & Admin Department ─────────────────────────────────────────
    {
      type: "group",
      label: "Finance & Admin Dept",
      icon: <Building2 className="w-4 h-4" />,
      roles: "all",
      children: [
        {
          type: "group",
          label: "Finance",
          icon: <DollarSign className="w-3.5 h-3.5" />,
          children: [
            { type: "leaf", label: "Expenditure Payments", icon: <DollarSign className="w-3 h-3" /> },
            { type: "leaf", label: "Payments",             icon: <DollarSign className="w-3 h-3" /> },
            { type: "leaf", label: "Reporting",            icon: <FileText className="w-3 h-3" /> },
            { type: "leaf", label: "Financial Reporting",  icon: <FileText className="w-3 h-3" /> },
          ],
        },
        {
          type: "group",
          label: "Admin",
          icon: <Briefcase className="w-3.5 h-3.5" />,
          children: [
            { type: "leaf", label: "Facilities",  icon: <Building2 className="w-3 h-3" /> },
            { type: "leaf", label: "HR Support",  icon: <Users className="w-3 h-3" /> },
          ],
        },
      ],
    },

    // ── Standards & Quality Assurance ──────────────────────────────────────
    {
      type: "group",
      label: "Standards & Quality Assurance",
      icon: <ShieldCheck className="w-4 h-4" />,
      roles: "all",
      children: [
        {
          type: "group",
          label: "HMO/HCP Quality Assurance",
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          children: [
            { type: "leaf", label: "QA Officers", icon: <Users className="w-3 h-3" /> },
          ],
        },
        {
          type: "group",
          label: "Enrollee Complaints / SHIA Liaison",
          icon: <ClipboardList className="w-3.5 h-3.5" />,
          children: [
            { type: "leaf", label: "Enrollee Complaints", icon: <ClipboardList className="w-3 h-3" /> },
          ],
        },
      ],
    },

    // ── Zonal ICT Support ──────────────────────────────────────────────────
    {
      type: "group",
      label: "Zonal ICT Support",
      icon: <Wifi className="w-4 h-4" />,
      roles: "all",
      children: [
        { type: "leaf", label: "ICT Support Desk", icon: <Wrench className="w-3.5 h-3.5" /> },
        { type: "leaf", label: "Systems & Network", icon: <Radio className="w-3.5 h-3.5" /> },
      ],
    },

    // ── Programmes ─────────────────────────────────────────────────────────
    {
      type: "group",
      label: "Programmes",
      icon: <LayoutGrid className="w-4 h-4" />,
      roles: "all",
      children: [
        { type: "leaf", label: "Programme Activities", icon: <FolderKanban className="w-3.5 h-3.5" /> },
      ],
    },

    // ── SDO ────────────────────────────────────────────────────────────────
    {
      type: "group",
      label: "SDO",
      icon: <Briefcase className="w-4 h-4" />,
      roles: "all",
      children: [
        { type: "leaf", label: "State Office Cordination", icon: <PackageSearch className="w-3.5 h-3.5" /> },
        { type: "leaf", label: "Stock Verification", icon: <PackageSearch className="w-3.5 h-3.5" />, view: "stock-verification", onClick: () => setView("stock-verification") },
        { type: "leaf", label: "Servicom",            icon: <Radio className="w-3.5 h-3.5" /> },
        { type: "leaf", label: "Special Projects",   icon: <FolderKanban className="w-3.5 h-3.5" /> },
      ],
    },

    // ── DG/CEO only ────────────────────────────────────────────────────────
    { type: "leaf", label: "Directives",       icon: <Flag className="w-4 h-4" />,    roles: "dg-ceo" },
    { type: "leaf", label: "National Reports", icon: <FileText className="w-4 h-4" />, roles: "dg-ceo" },
    { type: "leaf", label: "Zonal Performance",icon: <MapPin className="w-4 h-4" />,  roles: "dg-ceo" },

    // ── Common bottom items ────────────────────────────────────────────────
    { type: "leaf", label: "HQ Data",     icon: <Database className="w-4 h-4" />, roles: "all" },
    { type: "leaf", label: "Archive",     icon: <Archive className="w-4 h-4" />,  roles: "all" },
    { type: "leaf", label: "Notifications",icon: <Bell className="w-4 h-4" />,   roles: "all" },
    { type: "leaf", label: "Settings",    icon: <Settings className="w-4 h-4" />, roles: "all" },
  ];
}

// ─── Role filter ──────────────────────────────────────────────────────────────

function isVisible(item: NavItem, role: string): boolean {
  const r = item.roles;
  if (!r || r === "all") return true;
  if (r === "!dg-ceo") return role !== "dg-ceo";
  return r.split(",").map(s => s.trim()).includes(role);
}

// ─── Leaf node ────────────────────────────────────────────────────────────────

function NavLeaf({
  item, view, depth, sidebarOpen,
}: {
  item: LeafItem; view: View; depth: number; sidebarOpen: boolean;
}) {
  const active = !!item.view && item.view === view;
  const indent = depth === 1 ? "pl-7" : depth === 2 ? "pl-11" : "pl-3";

  return (
    <button
      onClick={item.onClick}
      className={`w-full flex items-center gap-2.5 ${indent} pr-3 py-2 rounded-xl text-left transition-all group ${
        active
          ? "bg-[#25a872] text-white shadow-md shadow-[#25a872]/30"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className={`shrink-0 ${active ? "text-white" : "text-white/50 group-hover:text-white"}`}>
        {item.icon}
      </span>
      {sidebarOpen && (
        <span className="text-xs font-semibold truncate flex-1">{item.label}</span>
      )}
      {sidebarOpen && active && <ChevronRight className="w-3 h-3 ml-auto text-white/70 shrink-0" />}
    </button>
  );
}

// ─── Group node (collapsible) ─────────────────────────────────────────────────

function NavGroup({
  item, role, view, depth, sidebarOpen,
}: {
  item: GroupItem; role: string; view: View; depth: number; sidebarOpen: boolean;
}) {
  // Auto-open if any child is active
  const hasActive = React.useMemo(() => checkActive(item, view), [item, view]);
  const [open, setOpen] = React.useState(hasActive);

  // Re-open when active child changes
  React.useEffect(() => { if (hasActive) setOpen(true); }, [hasActive]);

  const indent = depth === 0 ? "pl-3" : depth === 1 ? "pl-7" : "pl-11";
  const visibleChildren = item.children.filter(c => isVisible(c, role));
  if (visibleChildren.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => sidebarOpen && setOpen(o => !o)}
        className={`w-full flex items-center gap-2.5 ${indent} pr-3 py-2 rounded-xl text-left transition-all group ${
          hasActive && !open
            ? "bg-white/10 text-white"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="shrink-0 text-white/50 group-hover:text-white">{item.icon}</span>
        {sidebarOpen && (
          <>
            <span className="text-xs font-semibold truncate flex-1">{item.label}</span>
            <span className="shrink-0 text-white/40">
              {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          </>
        )}
      </button>

      {sidebarOpen && open && (
        <div className="mt-0.5 space-y-0.5">
          {/* Indent line */}
          <div className="relative">
            <div className={`absolute top-0 bottom-0 w-px bg-white/10 ${depth === 0 ? "left-[22px]" : "left-[36px]"}`} />
            <div className="space-y-0.5">
              {visibleChildren.map((child, i) =>
                child.type === "leaf"
                  ? <React.Fragment key={i}><NavLeaf item={child} view={view} depth={depth + 1} sidebarOpen={sidebarOpen} /></React.Fragment>
                  : <React.Fragment key={i}><NavGroup item={child} role={role} view={view} depth={depth + 1} sidebarOpen={sidebarOpen} /></React.Fragment>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function checkActive(item: GroupItem, view: View): boolean {
  return item.children.some(c => {
    if (c.type === "leaf") return !!c.view && c.view === view;
    return checkActive(c, view);
  });
}

// ─── Main SidebarNav ──────────────────────────────────────────────────────────

interface SidebarNavProps {
  role: string;
  view: View;
  setView: (v: View) => void;
  sidebarOpen: boolean;
}

export default function SidebarNav({ role, view, setView, sidebarOpen }: SidebarNavProps) {
  const tree = React.useMemo(() => buildNavTree(role, view, setView), [role, view, setView]);
  const visible = tree.filter(item => isVisible(item, role));

  return (
    <ScrollArea className="flex-1 px-2 py-2 scrollbar-thin">
      <nav className="space-y-0.5">
        {visible.map((item, i) =>
          item.type === "leaf"
            ? <React.Fragment key={i}><NavLeaf item={item} view={view} depth={0} sidebarOpen={sidebarOpen} /></React.Fragment>
            : <React.Fragment key={i}><NavGroup item={item} role={role} view={view} depth={0} sidebarOpen={sidebarOpen} /></React.Fragment>
        )}
      </nav>
    </ScrollArea>
  );
}
