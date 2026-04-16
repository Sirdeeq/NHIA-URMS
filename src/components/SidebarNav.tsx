import * as React from "react";
import { ChevronDown, ChevronRight, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AccessEntry } from "@/src/access/types";

type View = string;

interface SidebarNavProps {
  role: string;
  access: AccessEntry[];
  view: View;
  setView: (v: View) => void;
  sidebarOpen: boolean;
}

// ─── Single child link ────────────────────────────────────────────────────────
function ChildLink({ title, path, view, sidebarOpen }: {
  title: string; path: string; view: View; sidebarOpen: boolean;
}) {
  const active = view === path;
  return (
    <button
      onClick={() => {/* TODO: wire to setView or router */}}
      className={`w-full flex items-center gap-2.5 pl-7 pr-3 py-2 rounded-xl text-left transition-all group ${
        active
          ? "bg-[#25a872] text-white shadow-md shadow-[#25a872]/30"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-white" : "bg-white/30 group-hover:bg-white/60"}`} />
      {sidebarOpen && <span className="text-xs font-semibold truncate flex-1">{title}</span>}
      {sidebarOpen && active && <ChevronRight className="w-3 h-3 ml-auto text-white/70 shrink-0" />}
    </button>
  );
}

// ─── Parent module group ──────────────────────────────────────────────────────
function ModuleGroup({ entry, view, sidebarOpen, isOpen, onToggle }: {
  entry: AccessEntry;
  view: View;
  sidebarOpen: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasChildren = entry.functionalities.length > 0;

  return (
    <div>
      <button
        onClick={() => sidebarOpen && hasChildren && onToggle()}
        className="w-full flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-xl text-left transition-all group text-white/60 hover:bg-white/10 hover:text-white"
      >
        <span className="shrink-0 text-white/50 group-hover:text-white">
          <span className="w-4 h-4 flex items-center justify-center text-[10px] font-black opacity-70">
            {entry.access_to.slice(0, 2).toUpperCase()}
          </span>
        </span>
        {sidebarOpen && (
          <>
            <span className="text-xs font-semibold truncate flex-1">{entry.access_to}</span>
            {hasChildren && (
              <span className="shrink-0 text-white/40">
                {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </span>
            )}
          </>
        )}
      </button>

      {sidebarOpen && isOpen && hasChildren && (
        <div className="mt-0.5 space-y-0.5 relative">
          <div className="absolute top-0 bottom-0 w-px bg-white/10 left-[22px]" />
          <div className="space-y-0.5">
            {entry.functionalities.map((funcTitle, i) => (
              <ChildLink
                key={i}
                title={funcTitle}
                path={`/${entry.access_to.toLowerCase().replace(/\s+/g, "-")}/${funcTitle.toLowerCase().replace(/\s+/g, "-")}`}
                view={view}
                sidebarOpen={sidebarOpen}
              />
            ))}
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
    <button
      onClick={() => setView("settings")}
      className={`w-full flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-xl text-left transition-all group ${
        active ? "bg-[#25a872] text-white shadow-md shadow-[#25a872]/30" : "text-white/60 hover:bg-white/10 hover:text-white"
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

// ─── Main SidebarNav ──────────────────────────────────────────────────────────
export default function SidebarNav({ role, access, view, setView, sidebarOpen }: SidebarNavProps) {
  const [openModule, setOpenModule] = React.useState<string | null>(null);

  const toggle = (title: string) =>
    setOpenModule(prev => (prev === title ? null : title));

  return (
    <ScrollArea className="flex-1 px-2 py-2 scrollbar-thin">
      <nav className="space-y-0.5">
        {access.length === 0 && role !== "admin" && sidebarOpen && (
          <p className="text-[10px] text-white/30 px-3 py-2 italic">No modules assigned</p>
        )}

        {access.map((entry, i) => (
          <ModuleGroup
            key={i}
            entry={entry}
            view={view}
            sidebarOpen={sidebarOpen}
            isOpen={openModule === entry.access_to}
            onToggle={() => toggle(entry.access_to)}
          />
        ))}

        {role === "admin" && (
          <SettingsLeaf view={view} setView={setView} sidebarOpen={sidebarOpen} />
        )}
      </nav>
    </ScrollArea>
  );
}
