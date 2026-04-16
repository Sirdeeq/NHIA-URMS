import * as React from "react";
import {
  ChevronDown, ChevronRight, Settings, Home, BarChart3, FileText,
  CheckSquare, DollarSign, ShieldCheck, Wifi, LayoutGrid, Briefcase,
  Flag, Database, Archive, Bell, Users, ClipboardList, PackageSearch,
  FolderKanban, Radio, Wrench, MapPin, Scale, Megaphone, BookOpen,
  Activity, TrendingUp,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AccessEntry } from "@/src/access/types";
import { MODULE_CONFIG, type ChildModule, type SubGroup } from "@/src/access/moduleConfig";

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
  "Finance & Admin":      <DollarSign className="w-4 h-4" />,
  "Standards & Quality":  <ShieldCheck className="w-4 h-4" />,
  "ICT Support":          <Wifi className="w-4 h-4" />,
  "Programmes":           <LayoutGrid className="w-4 h-4" />,
  "SDO":                  <Briefcase className="w-4 h-4" />,
  "Directives":           <Flag className="w-4 h-4" />,
  "Reports":              <BarChart3 className="w-4 h-4" />,
  "HQ Data":              <Database className="w-4 h-4" />,
  "Audit & Compliance":   <ClipboardList className="w-4 h-4" />,
  "Human Resources":      <Users className="w-4 h-4" />,
  "Planning & Research":  <TrendingUp className="w-4 h-4" />,
  "SERVICOM":             <Activity className="w-4 h-4" />,
  "Special Projects":     <FolderKanban className="w-4 h-4" />,
  "Communications":       <Megaphone className="w-4 h-4" />,
  "Legal Services":       <Scale className="w-4 h-4" />,
  "Archive":              <Archive className="w-4 h-4" />,
  "Notifications":        <Bell className="w-4 h-4" />,
  "Settings":             <Settings className="w-4 h-4" />,
};

// ─── Path → view key map for known routed views ───────────────────────────────
const PATH_TO_VIEW: Record<string, string> = {
  "/dashboard":                   "home",
  "/annual-reports/new":          "annual-report",
  "/annual-reports/mine":         "annual-reports-list",
  "/annual-reports/submit":       "report-entry",
  "/annual-reports/review":       "zonal-review",
  "/sdo/stock-verification":      "stock-verification",
  "/sdo/my-verifications":        "stock-verifications-list",
  "/sdo/assets":                  "stock-assets",
  "/settings/users":              "settings",
  "/settings/privileges":         "settings",
  "/settings/zones":              "settings",
  "/settings/states":             "settings",
  "/settings/departments":        "settings",
  "/settings/units":              "settings",
};

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
function NavSubGroup({ group, allowedTitles, currentView, setView, sidebarOpen }: {
  group: SubGroup; allowedTitles: Set<string>;
  currentView: View; setView: (v: View) => void; sidebarOpen: boolean;
}) {
  const visibleChildren = group.children.filter(c => allowedTitles.has(c.title));
  if (visibleChildren.length === 0) return null;

  const hasActive = visibleChildren.some(c => c.view && currentView === c.view);
  const [open, setOpen] = React.useState(hasActive);
  React.useEffect(() => { if (hasActive) setOpen(true); }, [hasActive]);

  return (
    <div>
      <button
        onClick={() => sidebarOpen && setOpen((o: boolean) => !o)}
        className="w-full flex items-center gap-2.5 pl-7 pr-3 py-2 rounded-xl text-left transition-all group text-white/60 hover:bg-white/10 hover:text-white"
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
          <div className="absolute top-0 bottom-0 w-px bg-white/10 left-[36px]" />
          <div className="space-y-0.5">
            {visibleChildren.map((child, i) => (
              <NavLeaf key={i} title={child.title} nodeView={child.view}
                currentView={currentView} setView={setView} depth={2} sidebarOpen={sidebarOpen} />
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
          <div className="space-y-0.5">
            {visibleChildren.map((child, i) => {
              if ("type" in child && child.type === "group") {
                return (
                  <NavSubGroup key={i} group={child} allowedTitles={allowedTitles}
                    currentView={currentView} setView={setView} sidebarOpen={sidebarOpen} />
                );
              }
              const leaf = child as ChildModule;
              return (
                <NavLeaf key={i} title={leaf.title} nodeView={leaf.view}
                  currentView={currentView} setView={setView} depth={1} sidebarOpen={sidebarOpen} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings leaf (admin only) ───────────────────────────────────────────────
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

    // Non-admin: only modules in their access array
    return access
      .map(entry => {
        const mod = MODULE_CONFIG.find(m => m.title === entry.access_to);
        if (!mod) return null;
        return {
          mod,
          allowedTitles: new Set<string>(entry.functionalities),
        };
      })
      .filter(Boolean) as { mod: typeof MODULE_CONFIG[0]; allowedTitles: Set<string> }[];
  }, [role, access]);

  return (
    <ScrollArea className="flex-1 px-2 py-2 scrollbar-thin">
      <nav className="space-y-0.5">
        {visibleModules.length === 0 && role !== "admin" && sidebarOpen && (
          <p className="text-[10px] text-white/30 px-3 py-2 italic">No modules assigned</p>
        )}

        {visibleModules.map(({ mod, allowedTitles }, i) => {
          // Single-child modules with a direct view — render as flat leaf
          const flatChildren = mod.children.filter(c => !("type" in c)) as ChildModule[];
          if (flatChildren.length === 1 && !("type" in mod.children[0]) && flatChildren[0].view) {
            const leaf = flatChildren[0];
            if (mod.title === "Settings" && role === "admin") {
              return <SettingsLeaf key={i} view={view} setView={setView} sidebarOpen={sidebarOpen} />;
            }
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

        {/* Admin always sees Settings */}
        {role === "admin" && !visibleModules.some(({ mod }) => mod.title === "Settings") && (
          <SettingsLeaf view={view} setView={setView} sidebarOpen={sidebarOpen} />
        )}
      </nav>
    </ScrollArea>
  );
}
