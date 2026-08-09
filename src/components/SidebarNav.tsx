import * as React from "react";
import {
  ChevronDown, ChevronRight, Settings, Home, BarChart3, FileText,
  CheckSquare, Banknote, ShieldCheck, Wifi, LayoutGrid, Briefcase,
  Bell, Users, ClipboardList, PackageSearch,
  FolderKanban, Radio, Wrench, MapPin, Scale, Megaphone, BookOpen,
  Activity, TrendingUp,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AccessEntry } from "@/src/access/types";
import { MODULE_CONFIG, SOC_ZONES_MODULE, type ChildModule, type SubGroup, hasRoutableView, flatLeaves, moduleConfigForAccess } from "@/src/access/moduleConfig";
import { hasModuleAccess } from "@/src/access/roles";
import { normalizeAllowedTitles, normalizeModuleTitle, expandAccessEntries } from "@/src/access/accessUtils";

type View = string;

interface SidebarNavProps {
  role: string;
  access: AccessEntry[];
  view: View;
  setView: (v: View) => void;
  sidebarOpen: boolean;
}

// ─── Icon map — matches MODULE_CONFIG titles ──────────────────────────────────
const MODULE_ICONS: Record<string, React.ReactNode> = {
  "Dashboard":            <Home className="w-4 h-4" />,
  "Annual Reports":       <FileText className="w-4 h-4" />,
  "Finance & Admin":      <Banknote className="w-4 h-4" />,
  "Finance & Admin Dept": <Banknote className="w-4 h-4" />,
  "Standards & Quality":  <ShieldCheck className="w-4 h-4" />,
  "ICT Support":          <Wifi className="w-4 h-4" />,
  "Programmes":           <LayoutGrid className="w-4 h-4" />,
  "SDO":                  <Briefcase className="w-4 h-4" />,
  "Reports":              <BarChart3 className="w-4 h-4" />,
  "Audit & Compliance":   <ClipboardList className="w-4 h-4" />,
  "Human Resources":      <Users className="w-4 h-4" />,
  "Planning & Research":  <TrendingUp className="w-4 h-4" />,
  "SERVICOM":             <Activity className="w-4 h-4" />,
  "Special Projects":     <FolderKanban className="w-4 h-4" />,
  "Communications":       <Megaphone className="w-4 h-4" />,
  "Legal Services":       <Scale className="w-4 h-4" />,
  "Notifications":        <Bell className="w-4 h-4" />,
  "SOC/Zones":            <MapPin className="w-4 h-4" />,
  "Settings":             <Settings className="w-4 h-4" />,
};

// ─── Path → view key map for known routed views ───────────────────────────────
const PATH_TO_VIEW: Record<string, string> = {
  "/dashboard":                   "home",
  "/annual-reports/mine":         "annual-reports-list",
  "/annual-reports/submit":       "report-entry",
  "/annual-reports/review":       "zonal-review",
  "/sdo/stock-verification":        "stock-verifications-list",
  "/sdo/assets":                  "stock-assets",
  "/sdo/servicom":                "servicom-dashboard",
  "/sdo/servicom/visits":         "servicom-visits",
  "/soc/monitoring-visits":       "servicom-visits",
  "/sdo/servicom/complaints":     "servicom-complaints",
  "/sdo/servicom/satisfaction":   "servicom-satisfaction",
  "/sdo/servicom/comment-card":   "servicom-comment-card",
  "/notifications":               "notifications",
  "/settings/users":              "settings",
  "/settings/privileges":         "settings",
  "/settings/zones":              "settings",
  "/settings/states":             "settings",
  "/settings/departments":        "settings",
  "/settings/units":              "settings",
};

/** Workspace departments (SDO, Finance, etc.) — SERVICOM is nested under SDO, not separate */
const DEPARTMENT_MODULES = new Set([
  "Finance & Admin Dept",
  "Standards & Quality Assurance",
  "Zonal ICT Support",
  "Programmes",
  "SDO",
]);

function DepartmentChildren({ children, allowedTitles, currentView, setView, sidebarOpen, baseDepth }: {
  children: (ChildModule | SubGroup)[];
  allowedTitles: Set<string>;
  currentView: View;
  setView: (v: View) => void;
  sidebarOpen: boolean;
  baseDepth: number;
}) {
  const visibleChildren = children.filter(c => {
    if ("type" in c && c.type === "group") {
      return c.children.some(leaf => allowedTitles.has(leaf.title));
    }
    return allowedTitles.has((c as ChildModule).title);
  });

  if (visibleChildren.length === 0) return null;

  return (
    <>
      {visibleChildren.map((child, i) => {
        if ("type" in child && child.type === "group") {
          return (
            <NavSubGroup key={i} group={child} allowedTitles={allowedTitles}
              currentView={currentView} setView={setView} sidebarOpen={sidebarOpen} baseDepth={baseDepth} />
          );
        }
        const leaf = child as ChildModule;
        return (
          <NavLeaf key={i} title={leaf.title} nodeView={leaf.view}
            currentView={currentView} setView={setView} depth={baseDepth} sidebarOpen={sidebarOpen} />
        );
      })}
    </>
  );
}

// ─── Leaf link ────────────────────────────────────────────────────────────────
function NavLeaf({ title, nodeView, currentView, setView, depth, sidebarOpen }: {
  title: string; nodeView?: string; currentView: View;
  setView: (v: View) => void; depth: number; sidebarOpen: boolean;
}) {
  const active = !!nodeView && currentView === nodeView;
  const indent = depth === 1 ? "pl-7" : depth === 2 ? "pl-11" : "pl-3";

  return (
    <button
      onClick={() => nodeView && setView(nodeView)}
      className={`w-full flex items-center gap-2.5 ${indent} pr-3 py-2 rounded-xl text-left transition-all group ${
        active
          ? "bg-[#25a872] text-white shadow-md shadow-[#25a872]/30"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      } ${!nodeView ? "opacity-60 cursor-default" : "cursor-pointer"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
        active ? "bg-white" : "bg-white/30 group-hover:bg-white/60"
      }`} />
      {sidebarOpen && <span className="text-xs font-semibold truncate flex-1">{title}</span>}
      {sidebarOpen && active && <ChevronRight className="w-3 h-3 ml-auto text-white/70 shrink-0" />}
    </button>
  );
}

// ─── Sub-group (e.g. "Finance" inside "Finance & Admin Dept") ─────────────────
function NavSubGroup({ group, allowedTitles, currentView, setView, sidebarOpen, baseDepth = 1 }: {
  group: SubGroup; allowedTitles: Set<string>;
  currentView: View; setView: (v: View) => void; sidebarOpen: boolean;
  baseDepth?: number;
}) {
  const visibleChildren = group.children.filter(c => allowedTitles.has(c.title));
  if (visibleChildren.length === 0) return null;

  const headerIndent = baseDepth === 0 ? "pl-3" : "pl-7";
  const childDepth = baseDepth + 1;
  const guideLeft = baseDepth === 0 ? "left-[22px]" : "left-[36px]";

  // Single routable leaf (e.g. only "Monthly Report") — open directly, no extra dropdown
  if (visibleChildren.length === 1 && visibleChildren[0].view) {
    return (
      <NavLeaf
        title={group.label}
        nodeView={visibleChildren[0].view}
        currentView={currentView}
        setView={setView}
        depth={baseDepth}
        sidebarOpen={sidebarOpen}
      />
    );
  }

  const hasActive = visibleChildren.some(c => c.view && currentView === c.view);
  const [open, setOpen] = React.useState(hasActive);
  React.useEffect(() => { if (hasActive) setOpen(true); }, [hasActive]);

  return (
    <div>
      <button
        onClick={() => sidebarOpen && setOpen((o: boolean) => !o)}
        className={`w-full flex items-center gap-2.5 ${headerIndent} pr-3 py-2 rounded-xl text-left transition-all group text-white/60 hover:bg-white/10 hover:text-white`}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/20 group-hover:bg-white/40" />
        {sidebarOpen && (
          <>
            <span className="text-xs font-semibold truncate flex-1">{group.label}</span>
            <span className="shrink-0 text-white/40">
              {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          </>
        )}
      </button>
      {sidebarOpen && open && (
        <div className="relative">
          <div className={`absolute top-0 bottom-0 w-px bg-white/10 ${guideLeft}`} />
          <div className="space-y-0.5">
            {visibleChildren.map((child, i) => (
              <NavLeaf key={i} title={child.title} nodeView={child.view}
                currentView={currentView} setView={setView} depth={childDepth} sidebarOpen={sidebarOpen} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Top-level module group ───────────────────────────────────────────────────
function ModuleGroup({ title, children, allowedTitles, currentView, setView, sidebarOpen, isOpen, onToggle }: {
  title: string;
  children: (ChildModule | SubGroup)[];
  allowedTitles: Set<string>;
  currentView: View;
  setView: (v: View) => void;
  sidebarOpen: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  // Filter to only allowed children
  const visibleChildren = children.filter(c => {
    if ("type" in c && c.type === "group") {
      return c.children.some(leaf => allowedTitles.has(leaf.title));
    }
    return allowedTitles.has((c as ChildModule).title);
  });

  if (visibleChildren.length === 0) return null;

  const hasActive = visibleChildren.some(c => {
    if ("type" in c && c.type === "group") return c.children.some(l => l.view && currentView === l.view);
    return (c as ChildModule).view && currentView === (c as ChildModule).view;
  });

  return (
    <div>
      <button
        onClick={() => sidebarOpen && onToggle()}
        className={`w-full flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-xl text-left transition-all group ${
          hasActive && !isOpen ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="shrink-0 text-white/50 group-hover:text-white text-[10px] font-black w-4 h-4 flex items-center justify-center">
          {title.slice(0, 2).toUpperCase()}
        </span>
        {sidebarOpen && (
          <>
            <span className="text-xs font-semibold truncate flex-1">{title}</span>
            <span className="shrink-0 text-white/40">
              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          </>
        )}
      </button>

      {sidebarOpen && isOpen && (
        <div className="mt-0.5 space-y-0.5 relative">
          <div className="absolute top-0 bottom-0 w-px bg-white/10 left-[22px]" />
          <DepartmentChildren
            children={children}
            allowedTitles={allowedTitles}
            currentView={currentView}
            setView={setView}
            sidebarOpen={sidebarOpen}
            baseDepth={1}
          />
        </div>
      )}
    </div>
  );
}

// ─── Notifications leaf (always available) ────────────────────────────────────
function NotificationsLeaf({ view, setView, sidebarOpen }: {
  view: View; setView: (v: View) => void; sidebarOpen: boolean;
}) {
  const active = view === "notifications";
  return (
    <button onClick={() => setView("notifications")}
      className={`w-full flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-xl text-left transition-all group ${
        active
          ? "bg-[#25a872] text-white shadow-md shadow-[#25a872]/30"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className={`shrink-0 ${active ? "text-white" : "text-white/50 group-hover:text-white"}`}>
        <Bell className="w-4 h-4" />
      </span>
      {sidebarOpen && <span className="text-xs font-semibold truncate flex-1">Notifications</span>}
      {sidebarOpen && active && <ChevronRight className="w-3 h-3 ml-auto text-white/70 shrink-0" />}
    </button>
  );
}

// ─── Settings leaf (admin or privileged users) ────────────────────────────────
function SettingsLeaf({ view, setView, sidebarOpen }: {
  view: View; setView: (v: View) => void; sidebarOpen: boolean;
}) {
  const active = view === "settings";
  return (
    <button onClick={() => setView("settings")}
      className={`w-full flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-xl text-left transition-all group ${
        active
          ? "bg-[#25a872] text-white shadow-md shadow-[#25a872]/30"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className={`shrink-0 ${active ? "text-white" : "text-white/50 group-hover:text-white"}`}>
        <Settings className="w-4 h-4" />
      </span>
      {sidebarOpen && <span className="text-xs font-semibold truncate flex-1">Settings</span>}
      {sidebarOpen && active && <ChevronRight className="w-3 h-3 ml-auto text-white/70 shrink-0" />}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SidebarNav({ role, access, view, setView, sidebarOpen }: SidebarNavProps) {
  const [openModule, setOpenModule] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (String(view).startsWith("state-")) setOpenModule(SOC_ZONES_MODULE);
  }, [view]);

  const toggle = (title: string) =>
    setOpenModule((prev: string | null) => prev === title ? null : title);

  // Build visible modules from user's access array
  const visibleModules = React.useMemo(() => {
    if (role === "admin") {
      // Admin sees everything from MODULE_CONFIG
      return MODULE_CONFIG.map(mod => ({
        mod,
        allowedTitles: new Set<string>(
          mod.children.flatMap(c =>
            "type" in c && c.type === "group"
              ? c.children.map(l => l.title)
              : [(c as ChildModule).title]
          )
        ),
      }));
    }

    // Non-admin: only modules in their access array (with legacy privilege bridges)
    const effectiveAccess = expandAccessEntries(access);
    return effectiveAccess
      .map(entry => {
        const mod = moduleConfigForAccess(entry.access_to);
        if (!mod) return null;

        const funcs = Array.isArray(entry.functionalities) ? entry.functionalities : [];
        const allowedTitles = funcs.length > 0
          ? normalizeAllowedTitles(funcs)
          : new Set(flatLeaves(mod));

        return { mod, allowedTitles };
      })
      .filter(Boolean) as { mod: typeof MODULE_CONFIG[0]; allowedTitles: Set<string> }[];
  }, [role, access]);

  const showSettings = hasModuleAccess(access, "Settings", role);

  const departmentModules = React.useMemo(
    () => visibleModules.filter(
      ({ mod }) => DEPARTMENT_MODULES.has(mod.title) && hasRoutableView(mod),
    ),
    [visibleModules],
  );

  const flattenSingleDepartment = role !== "admin" && departmentModules.length === 1;
  const flattenedDepartment = flattenSingleDepartment ? departmentModules[0] : null;

  return (
    <ScrollArea className="flex-1 px-2 py-2 scrollbar-thin">
      <nav className="space-y-0.5">
        {visibleModules.length === 0 && role !== "admin" && sidebarOpen && (
          <p className="text-[10px] text-white/30 px-3 py-2 italic">No modules assigned</p>
        )}

        {visibleModules.map(({ mod, allowedTitles }, i) => {
          if (mod.title === "Notifications" || mod.title === "Settings") return null;
          if (!hasRoutableView(mod)) return null;

          // Single department access — lift SDO/Finance children up; keep sub-groups (e.g. SERVICOM) nested
          if (flattenedDepartment && mod.title === flattenedDepartment.mod.title) {
            return (
              <React.Fragment key={i}>
                <DepartmentChildren
                  children={mod.children}
                  allowedTitles={allowedTitles}
                  currentView={view}
                  setView={setView}
                  sidebarOpen={sidebarOpen}
                  baseDepth={0}
                />
              </React.Fragment>
            );
          }

          // Single-child modules with a direct view — render as flat leaf
          const flatChildren = mod.children.filter(c => !("type" in c)) as ChildModule[];
          if (flatChildren.length === 1 && !("type" in mod.children[0]) && flatChildren[0].view) {
            const leaf = flatChildren[0];
            return (
              <NavLeaf key={i} title={mod.title} nodeView={leaf.view}
                currentView={view} setView={setView} depth={0} sidebarOpen={sidebarOpen} />
            );
          }

          return (
            <ModuleGroup
              key={i}
              title={mod.title}
              children={mod.children}
              allowedTitles={allowedTitles}
              currentView={view}
              setView={setView}
              sidebarOpen={sidebarOpen}
              isOpen={openModule === mod.title}
              onToggle={() => toggle(mod.title)}
            />
          );
        })}

        <NotificationsLeaf view={view} setView={setView} sidebarOpen={sidebarOpen} />

        {showSettings && (
          <SettingsLeaf view={view} setView={setView} sidebarOpen={sidebarOpen} />
        )}
      </nav>
    </ScrollArea>
  );
}
