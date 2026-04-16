import * as React from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, TrendingUp, ChevronDown, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usersApi, zonesApi, statesApi, departmentsApi, unitsApi, type AdminUser, type ZonalOffice, type StateOffice, type Department, type Unit } from "@/lib/adminApi";
import AdminModal from "./AdminModal";
import { MODULE_CONFIG } from "@/src/access/moduleConfig";

const ROLES = ["state-officer", "zonal-coordinator", "state-coordinator", "sdo", "hq-department", "dg-ceo", "admin"] as const;
const ROLE_LABELS: Record<string, string> = {
  "state-officer": "State Officer", "zonal-coordinator": "Zonal Coordinator",
  "state-coordinator": "State Coordinator",
  "sdo": "SDO", "hq-department": "HQ Department", "dg-ceo": "DG-CEO", "admin": "Admin",
};
const ROLE_COLORS: Record<string, string> = {
  "admin":             "bg-purple-100 text-purple-700 border-purple-200",
  "dg-ceo":            "bg-rose-100 text-rose-700 border-rose-200",
  "zonal-coordinator": "bg-blue-100 text-blue-700 border-blue-200",
  "state-coordinator": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "hq-department":     "bg-amber-100 text-amber-700 border-amber-200",
  "sdo":               "bg-[#e8f5ee] text-[#145c3f] border-[#d4e8dc]",
  "state-officer":     "bg-slate-100 text-slate-700 border-slate-200",
};

const inputCls = "w-full pl-3 pr-3 h-11 rounded-xl border border-[#d4e8dc] bg-[#f4f7f5] text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#25a872] focus:border-[#25a872] outline-none transition-all";
const EMPTY = { name: "", email: "", password: "", role: "state-officer", zone_id: "", state_id: "", department_id: "", unit_id: "", is_active: true };

export default function AdminUsersPage({ showOverview = false }: { showOverview?: boolean }) {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [zones, setZones] = React.useState<ZonalOffice[]>([]);
  const [states, setStates] = React.useState<StateOffice[]>([]);
  const [depts, setDepts] = React.useState<Department[]>([]);
  const [formUnits, setFormUnits] = React.useState<Unit[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");
  const [filterZone, setFilterZone] = React.useState("");
  const [modal, setModal] = React.useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = React.useState<AdminUser | null>(null);
  const [form, setForm] = React.useState({ ...EMPTY });
  const [saving, setSaving] = React.useState(false);
  const [granted, setGranted] = React.useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = React.useState<"info" | "access">("info");

  // Overview stats
  const [stats, setStats] = React.useState<{ label: string; value: number; tint: string; iconColor: string; icon: React.ReactNode }[]>([]);

  React.useEffect(() => {
    if (!showOverview) return;
    Promise.allSettled([
      usersApi.list(), zonesApi.list(), statesApi.list(), departmentsApi.list(), unitsApi.list(),
    ]).then(([u, z, s, d, un]) => {
      setStats([
        { label: "Total Users",   value: u.status  === "fulfilled" ? u.value.total        : 0, tint: "bg-[#e8f5ee] border-[#d4e8dc]", iconColor: "text-[#145c3f]", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
        { label: "Zonal Offices", value: z.status  === "fulfilled" ? z.value.data.length  : 0, tint: "bg-blue-50 border-blue-100",    iconColor: "text-blue-600",  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
        { label: "State Offices", value: s.status  === "fulfilled" ? s.value.data.length  : 0, tint: "bg-amber-50 border-amber-100",  iconColor: "text-amber-600", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
        { label: "Departments",   value: d.status  === "fulfilled" ? d.value.data.length  : 0, tint: "bg-purple-50 border-purple-100",iconColor: "text-purple-600",icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
        { label: "Units",         value: un.status === "fulfilled" ? un.value.data.length : 0, tint: "bg-rose-50 border-rose-100",    iconColor: "text-rose-600",  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
      ]);
    });
  }, [showOverview]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({ page, search: search || undefined, role: filterRole || undefined, zone_id: filterZone ? Number(filterZone) : undefined });
      setUsers(res.data); setTotal(res.total); setPages(res.pages);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [page, search, filterRole, filterZone]);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => {
    zonesApi.list().then(r => setZones(r.data)).catch(() => {});
    statesApi.list().then(r => setStates(r.data)).catch(() => {});
    departmentsApi.list().then(r => setDepts(r.data)).catch(() => {});
  }, []);

  const filteredStates = form.zone_id ? states.filter(s => String(s.zonal_id) === String(form.zone_id)) : states;

  // When dept changes in form, fetch its units
  const handleDeptChange = async (deptId: string) => {
    setForm(f => ({ ...f, department_id: deptId, unit_id: "" }));
    setFormUnits([]);
    if (!deptId) return;
    try { const r = await unitsApi.list(Number(deptId)); setFormUnits(r.data); } catch { /* silent */ }
  };

  const openCreate = () => { setForm({ ...EMPTY }); setFormUnits([]); setGranted(new Set()); setActiveTab("info"); setEditing(null); setModal("create"); };
  const openEdit = async (u: AdminUser) => {
    setEditing(u);
    setForm({
      name: u.name, email: u.email || "", password: "", role: u.role,
      zone_id: String(u.zone_id || ""), state_id: String(u.state_id || ""),
      department_id: String(u.department_id || ""), unit_id: String(u.unit_id || ""),
      is_active: u.is_active,
    });
    // Load existing access into granted set
    const keys = new Set<string>();
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
    if (u.department_id) {
      try { const r = await unitsApi.list(u.department_id); setFormUnits(r.data); } catch { setFormUnits([]); }
    } else { setFormUnits([]); }
    setActiveTab("info");
    setModal("edit");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
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

      const payload: any = {
        name: form.name, email: form.email || undefined, role: form.role,
        zone_id: form.zone_id ? Number(form.zone_id) : undefined,
        state_id: form.state_id ? Number(form.state_id) : undefined,
        department_id: form.department_id ? Number(form.department_id) : undefined,
        unit_id: form.unit_id ? Number(form.unit_id) : undefined,
        is_active: form.is_active,
        access,
      };
      if (form.password) payload.password = form.password;
      if (modal === "create") {
        if (!form.password) { toast.error("Password required"); setSaving(false); return; }
        await usersApi.create(payload);
        toast.success("User created");
      } else if (editing) {
        await usersApi.update(editing.id, payload);
        // Also update privileges separately to ensure access is saved
        await usersApi.updatePrivileges(editing.id, access);
        toast.success("User updated");
      }
      setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    try { await usersApi.delete(u.id); toast.success("User deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const toggleParent = (title: string, childPaths: string[]) => {
    setGranted(prev => {
      const next = new Set(prev);
      if (next.has(title)) { next.delete(title); childPaths.forEach(p => next.delete(p)); }
      else { next.add(title); childPaths.forEach(p => next.add(p)); }
      return next;
    });
  };

  const toggleChild = (parentTitle: string, childPath: string, allChildPaths: string[]) => {
    setGranted(prev => {
      const next = new Set(prev);
      if (next.has(childPath)) {
        next.delete(childPath);
        if (allChildPaths.filter(p => p !== childPath && next.has(p)).length === 0) next.delete(parentTitle);
      } else { next.add(childPath); next.add(parentTitle); }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Overview stats */}
      {showOverview && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2">
          {stats.map(s => (
            <div key={s.label} className={`${s.tint} rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm ${s.iconColor}`}>
                  {s.icon}
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input className="w-full pl-9 pr-3 h-10 rounded-xl border border-[#d4e8dc] bg-white text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#25a872] outline-none transition-all"
            placeholder="Search name or staff ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="h-10 px-3 rounded-xl border border-[#d4e8dc] bg-white text-sm text-slate-700 focus:ring-2 focus:ring-[#25a872] outline-none"
          value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select className="h-10 px-3 rounded-xl border border-[#d4e8dc] bg-white text-sm text-slate-700 focus:ring-2 focus:ring-[#25a872] outline-none"
          value={filterZone} onChange={e => { setFilterZone(e.target.value); setPage(1); }}>
          <option value="">All Zones</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.zonal_code}</option>)}
        </select>
        <Button onClick={openCreate} className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white rounded-xl h-10 gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f0fdf7] hover:bg-[#f0fdf7]">
                <TableHead className="text-xs font-bold text-slate-600">Name</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Staff ID</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Role</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 hidden md:table-cell">Zone</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 hidden lg:table-cell">State</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400">Loading...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400">No users found</TableCell></TableRow>
              ) : users.map(u => (
                <TableRow key={u.id} className="hover:bg-[#f0fdf7] transition-colors">
                  <TableCell className="font-semibold text-slate-800">{u.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">{u.staff_id}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border ${ROLE_COLORS[u.role] ?? "bg-slate-100 text-slate-600"}`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 hidden md:table-cell">{u.zone?.zonal_code ?? "—"}</TableCell>
                  <TableCell className="text-slate-500 hidden lg:table-cell">{u.state?.code ?? "—"}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border ${u.is_active ? "bg-[#e8f5ee] text-[#145c3f] border-[#d4e8dc]" : "bg-rose-50 text-rose-600 border-rose-200"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(u)} className="h-7 w-7 p-0 hover:bg-[#e8f5ee] hover:text-[#145c3f]"><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(u)} className="h-7 w-7 p-0 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#d4e8dc]">
            <p className="text-xs text-slate-500">Showing {users.length} of {total} users</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-7 w-7 p-0"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-xs text-slate-600 px-2">Page {page} of {pages}</span>
              <Button variant="ghost" size="sm" disabled={page === pages} onClick={() => setPage(p => p + 1)} className="h-7 w-7 p-0"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>

      <AdminModal title={modal === "create" ? "Add New User" : "Edit User"} open={modal !== null} onClose={() => setModal(null)} width="max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">

          {/* ── User Info ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Full Name" required>
                <input className={inputCls} placeholder="e.g. Amina Yusuf" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </Field>
              {modal === "create" && <p className="text-[10px] text-slate-400 mt-1">Staff ID auto-generated from role (e.g. SO-0001)</p>}
            </div>
            <Field label="Email">
              <input type="email" className={inputCls} placeholder="user@nhia.gov.ng" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field label={modal === "create" ? "Password" : "New Password"} required={modal === "create"}>
              <input type="password" className={inputCls} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={modal === "create"} />
            </Field>
            <Field label="Role" required>
              <select className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </Field>
            {modal === "edit" && (
              <Field label="Status">
                <select className={inputCls} value={form.is_active ? "1" : "0"} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === "1" }))}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </Field>
            )}
            <Field label="Zone">
              <select className={inputCls} value={form.zone_id} onChange={e => setForm(f => ({ ...f, zone_id: e.target.value, state_id: "" }))}>
                <option value="">— None —</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.zonal_code} – {z.description}</option>)}
              </select>
            </Field>
            <Field label="State">
              <select className={inputCls} value={form.state_id} onChange={e => setForm(f => ({ ...f, state_id: e.target.value }))}>
                <option value="">— None —</option>
                {filteredStates.map(s => <option key={s.id} value={s.id}>{s.code} – {s.description}</option>)}
              </select>
            </Field>
            <Field label="Department">
              <select className={inputCls} value={form.department_id} onChange={e => handleDeptChange(e.target.value)}>
                <option value="">— None —</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.department_code} – {d.name}</option>)}
              </select>
            </Field>
            <Field label="Unit">
              <select className={inputCls} value={form.unit_id} onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))} disabled={!form.department_id}>
                <option value="">— None —</option>
                {formUnits.map(u => <option key={u.id} value={u.id}>{u.unit_code} – {u.name}</option>)}
              </select>
              {!form.department_id && <p className="text-[10px] text-slate-400 mt-1">Select a department first</p>}
            </Field>
          </div>

          {/* ── Module Access ── */}
          <div className="border-t border-[#d4e8dc] pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#145c3f]" /> Module Access
                <span className="ml-1 text-[10px] font-normal text-slate-400 normal-case">
                  ({MODULE_CONFIG.filter(m => granted.has(m.title)).length} of {MODULE_CONFIG.length} granted)
                </span>
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => { const all = new Set<string>(); MODULE_CONFIG.forEach(m => { all.add(m.title); m.children.forEach(c => all.add(c.path)); }); setGranted(all); }} className="text-xs text-[#145c3f] hover:underline font-medium">Select all</button>
                <span className="text-slate-300">|</span>
                <button type="button" onClick={() => setGranted(new Set())} className="text-xs text-rose-500 hover:underline font-medium">Clear all</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODULE_CONFIG.map(mod => {
                const allChildPaths = mod.children.map(c => c.path);
                const parentChecked = granted.has(mod.title);
                const checkedCount = allChildPaths.filter(p => granted.has(p)).length;
                const someChecked = parentChecked && checkedCount < allChildPaths.length;
                return (
                  <ModuleAccessRow key={mod.title} mod={mod}
                    parentChecked={parentChecked} someChecked={someChecked}
                    granted={granted} onToggleParent={toggleParent} onToggleChild={toggleChild} />
                );
              })}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#d4e8dc]">
            <Button type="button" variant="ghost" onClick={() => setModal(null)} className="rounded-xl text-slate-600">Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white rounded-xl">
              {saving ? "Saving..." : modal === "create" ? "Create User" : "Save Changes"}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ModuleAccessRow({ mod, parentChecked, someChecked, granted, onToggleParent, onToggleChild }: {
  mod: typeof MODULE_CONFIG[0];
  parentChecked: boolean;
  someChecked: boolean;
  granted: Set<string>;
  onToggleParent: (title: string, childPaths: string[]) => void;
  onToggleChild: (parentTitle: string, childPath: string, allChildPaths: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const allChildPaths = mod.children.map(c => c.path);
  const parentRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { if (parentRef.current) parentRef.current.indeterminate = someChecked; }, [someChecked]);

  return (
    <div className={`rounded-xl border transition-all ${parentChecked ? "border-[#25a872]" : "border-[#d4e8dc]"}`}>
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${parentChecked ? "bg-[#e8f5ee]" : "bg-white"}`}>
        <input ref={parentRef} type="checkbox" checked={parentChecked}
          onChange={() => onToggleParent(mod.title, allChildPaths)}
          className="w-3.5 h-3.5 accent-[#145c3f] shrink-0 cursor-pointer" />
        <span className={`text-xs font-semibold flex-1 ${parentChecked ? "text-[#145c3f]" : "text-slate-700"}`}>{mod.title}</span>
        {mod.children.length > 0 && (
          <button type="button" onClick={() => setOpen(o => !o)} className="p-0.5 text-slate-400 hover:text-slate-600">
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {open && mod.children.length > 0 && (
        <div className="border-t border-[#d4e8dc] px-3 py-1.5 space-y-1 bg-white rounded-b-xl">
          {!parentChecked && <p className="text-[10px] text-amber-600 italic">Enable parent first</p>}
          {mod.children.map(child => (
            <label key={child.path} className={`flex items-center gap-2 px-1.5 py-1 rounded-lg cursor-pointer ${
              granted.has(child.path) ? "bg-[#e8f5ee]" : "hover:bg-slate-50"
            } ${!parentChecked ? "opacity-40 pointer-events-none" : ""}`}>
              <input type="checkbox" checked={granted.has(child.path)} disabled={!parentChecked}
                onChange={() => onToggleChild(mod.title, child.path, allChildPaths)}
                className="w-3 h-3 accent-[#145c3f] shrink-0" />
              <span className={`text-xs ${granted.has(child.path) ? "text-[#145c3f] font-medium" : "text-slate-600"}`}>
                {child.title}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
