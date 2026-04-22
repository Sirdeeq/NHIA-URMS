import * as React from "react";
import { Search, ShieldCheck, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usersApi, type AdminUser } from "@/lib/adminApi";
import AdminModal from "./AdminModal";
import { MODULE_CONFIG } from "@/src/access/moduleConfig";
import { flatLeaves } from "@/src/access/moduleConfig";

const ROLE_LABELS: Record<string, string> = {
  "state-officer":      "State Officer",
  "zonal-coordinator":  "Zonal Coordinator",
  "state-coordinator":  "State Coordinator",
  "department-officer": "Department Officer",
  "sdo": "SDO", "hq-department": "HQ Department", "dg-ceo": "DG-CEO", "admin": "Admin",
};
const ROLE_COLORS: Record<string, string> = {
  "admin":              "bg-purple-100 text-purple-700 border-purple-200",
  "dg-ceo":             "bg-rose-100 text-rose-700 border-rose-200",
  "zonal-coordinator":  "bg-blue-100 text-blue-700 border-blue-200",
  "state-coordinator":  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "department-officer": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "hq-department":      "bg-amber-100 text-amber-700 border-amber-200",
  "sdo":                "bg-[#e8f5ee] text-[#145c3f] border-[#d4e8dc]",
  "state-officer":      "bg-slate-100 text-slate-700 border-slate-200",
};

// ─── Module tree row ──────────────────────────────────────────────────────────
function ModuleRow({ mod, granted, onToggleParent, onToggleChild }: {
  mod: typeof MODULE_CONFIG[0];
  granted: Set<string>;
  onToggleParent: (title: string, childPaths: string[]) => void;
  onToggleChild: (parentTitle: string, childPath: string, allChildPaths: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const parentChecked = granted.has(mod.title);
  const allChildTitles = flatLeaves(mod);
  const someChecked = parentChecked && allChildTitles.filter(t => granted.has(t)).length < allChildTitles.length;

  const parentRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (parentRef.current) parentRef.current.indeterminate = someChecked;
  }, [someChecked]);

  return (
    <div className={`rounded-xl border transition-all ${parentChecked ? "border-[#25a872]" : "border-[#d4e8dc]"}`}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${parentChecked ? "bg-[#e8f5ee]" : "bg-white"}`}>
        <input ref={parentRef} type="checkbox" checked={parentChecked}
          onChange={() => onToggleParent(mod.title, allChildTitles)}
          className="w-4 h-4 accent-[#145c3f] shrink-0 cursor-pointer" />
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold ${parentChecked ? "text-[#145c3f]" : "text-slate-700"}`}>{mod.title}</span>
        </div>
        {mod.children.length > 0 && (
          <button onClick={() => setOpen(o => !o)} className="p-1 rounded-lg hover:bg-black/5 text-slate-400 shrink-0">
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {open && mod.children.length > 0 && (
        <div className="border-t border-[#d4e8dc] px-3 py-2 space-y-1 bg-white rounded-b-xl">
          {!parentChecked && (
            <p className="text-[10px] text-amber-600 italic pb-1">Enable parent module first</p>
          )}
          {mod.children.map((child, i) => {
            if ("type" in child && child.type === "group") {
              return (
                <div key={i}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 pt-1.5 pb-0.5">{child.label}</p>
                  {child.children.map((leaf, j) => (
                    <label key={j}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                        granted.has(leaf.title) ? "bg-[#e8f5ee]" : "hover:bg-slate-50"
                      } ${!parentChecked ? "opacity-40 pointer-events-none" : ""}`}>
                      <input type="checkbox" checked={granted.has(leaf.title)} disabled={!parentChecked}
                        onChange={() => onToggleChild(mod.title, leaf.title, allChildTitles)}
                        className="w-3.5 h-3.5 accent-[#145c3f] shrink-0" />
                      <span className={`text-xs ${granted.has(leaf.title) ? "text-[#145c3f] font-medium" : "text-slate-600"}`}>{leaf.title}</span>
                    </label>
                  ))}
                </div>
              );
            }
            const leaf = child as import("@/src/access/moduleConfig").ChildModule;
            return (
              <label key={i}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                  granted.has(leaf.title) ? "bg-[#e8f5ee]" : "hover:bg-slate-50"
                } ${!parentChecked ? "opacity-40 pointer-events-none" : ""}`}>
                <input type="checkbox" checked={granted.has(leaf.title)} disabled={!parentChecked}
                  onChange={() => onToggleChild(mod.title, leaf.title, allChildTitles)}
                  className="w-3.5 h-3.5 accent-[#145c3f] shrink-0" />
                <span className={`text-xs ${granted.has(leaf.title) ? "text-[#145c3f] font-medium" : "text-slate-600"}`}>{leaf.title}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPrivilegesPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<AdminUser | null>(null);
  const [granted, setGranted] = React.useState<Set<string>>(new Set());
  const [saving, setSaving] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await usersApi.list({ search: search || undefined }); setUsers(r.data); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, [search]);

  const openPrivileges = (u: AdminUser) => {
    setSelected(u);
    const keys = new Set<string>();
    // functionalities is now a parsed array from the API
    const accessArr = Array.isArray(u.functionalities) ? u.functionalities : [];
    accessArr.forEach((entry: any) => {
      if (!entry?.access_to) return;
      keys.add(entry.access_to);
      const mod = MODULE_CONFIG.find(m => m.title === entry.access_to);
      if (mod && Array.isArray(entry.functionalities)) {
        entry.functionalities.forEach((funcTitle: string) => {
          const child = mod.children.find(c => c.title === funcTitle);
          if (child) keys.add(child.path);
        });
      }
    });
    setGranted(keys);
  };

  const toggleParent = (title: string, childTitles: string[]) => {
    setGranted(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
        childTitles.forEach(t => next.delete(t));
      } else {
        next.add(title);
        childTitles.forEach(t => next.add(t));
      }
      return next;
    });
  };

  const toggleChild = (parentTitle: string, childTitle: string, allChildTitles: string[]) => {
    setGranted(prev => {
      const next = new Set(prev);
      if (next.has(childTitle)) {
        next.delete(childTitle);
        const remaining = allChildTitles.filter(t => t !== childTitle && next.has(t));
        if (remaining.length === 0) next.delete(parentTitle);
      } else {
        next.add(childTitle);
        next.add(parentTitle);
      }
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<string>();
    MODULE_CONFIG.forEach(m => { all.add(m.title); flatLeaves(m).forEach(t => all.add(t)); });
    setGranted(all);
  };
  const clearAll = () => setGranted(new Set());

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      // Build structured access array from granted set
      const access = MODULE_CONFIG
        .filter(mod => granted.has(mod.title))
        .map(mod => ({
          access_to: mod.title,
          functionalities: mod.children
            .filter(c => granted.has(c.path))
            .map(c => c.title),
        }));

      await usersApi.updatePrivileges(selected.id, access as any);
      toast.success(`Privileges updated for ${selected.name}`);
      setSelected(null);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const parentCount = MODULE_CONFIG.filter(m => granted.has(m.title)).length;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input className="w-full pl-9 pr-3 h-10 rounded-xl border border-[#d4e8dc] bg-white text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#25a872] outline-none transition-all"
          placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f0fdf7] hover:bg-[#f0fdf7]">
                <TableHead className="text-xs font-bold text-slate-600">Name</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Staff ID</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Role</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Modules Granted</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Loading...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">No users found</TableCell></TableRow>
              ) : users.map(u => {
                // functionalities is now a parsed array of {access_to, functionalities[]}
                const accessArr = Array.isArray(u.functionalities) ? u.functionalities : [];
                const parents = accessArr.filter((e: any) => e?.access_to);
                return (
                  <TableRow key={u.id} className="hover:bg-[#f0fdf7] transition-colors">
                    <TableCell className="font-medium text-slate-800">{u.name}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{u.staff_id}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] border ${ROLE_COLORS[u.role] ?? "bg-slate-100 text-slate-600"}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {parents.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No modules assigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {parents.map((entry: any) => {
                            const mod = MODULE_CONFIG.find(m => m.title === entry.access_to);
                            const granted = Array.isArray(entry.functionalities) ? entry.functionalities.length : 0;
                            const total = mod?.children.length ?? 0;
                            return (
                              <span key={entry.access_to} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#e8f5ee] text-[#145c3f] border border-[#d4e8dc]">
                                {entry.access_to}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openPrivileges(u)}
                        className="h-8 gap-1.5 text-xs hover:bg-[#e8f5ee] hover:text-[#145c3f]">
                        <ShieldCheck className="w-3.5 h-3.5" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminModal title={`Module Access — ${selected?.name ?? ""}`} open={selected !== null} onClose={() => setSelected(null)} width="max-w-2xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f4f7f5] border border-[#d4e8dc]">
              <div className="w-9 h-9 rounded-full bg-[#25a872] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {selected.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{selected.name}</p>
                <p className="text-xs text-slate-500">{selected.staff_id} · {ROLE_LABELS[selected.role] ?? selected.role}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs font-bold text-[#145c3f]">{parentCount} modules</p>
                <p className="text-[10px] text-slate-400">{granted.size - parentCount} sub-modules</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Module Access</p>
              <div className="flex gap-3">
                <button onClick={selectAll} className="text-xs text-[#145c3f] hover:underline font-medium">Select all</button>
                <span className="text-slate-300">|</span>
                <button onClick={clearAll} className="text-xs text-rose-500 hover:underline font-medium">Clear all</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
              {MODULE_CONFIG.map(mod => (
                <ModuleRow key={mod.title} mod={mod} granted={granted}
                  onToggleParent={toggleParent} onToggleChild={toggleChild} />
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#d4e8dc]">
              <Button type="button" variant="ghost" onClick={() => setSelected(null)} className="rounded-xl text-slate-600">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white rounded-xl">
                {saving ? "Saving..." : "Save Privileges"}
              </Button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
