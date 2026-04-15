import * as React from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usersApi, zonesApi, statesApi, type AdminUser, type ZonalOffice, type StateOffice } from "@/lib/adminApi";
import AdminModal from "./AdminModal";

const ROLES = ["state-officer", "zonal-director", "sdo", "hq-department", "dg-ceo", "admin"] as const;
const ROLE_LABELS: Record<string, string> = {
  "state-officer": "State Officer", "zonal-director": "Zonal Director",
  "sdo": "SDO", "hq-department": "HQ Department", "dg-ceo": "DG-CEO", "admin": "Admin",
};
const ROLE_COLORS: Record<string, string> = {
  "admin": "bg-purple-100 text-purple-700 border-purple-200",
  "dg-ceo": "bg-rose-100 text-rose-700 border-rose-200",
  "zonal-director": "bg-blue-100 text-blue-700 border-blue-200",
  "hq-department": "bg-amber-100 text-amber-700 border-amber-200",
  "sdo": "bg-[#e8f5ee] text-[#145c3f] border-[#d4e8dc]",
  "state-officer": "bg-slate-100 text-slate-700 border-slate-200",
};

const inputCls = "w-full pl-3 pr-3 h-11 rounded-xl border border-[#d4e8dc] bg-[#f4f7f5] text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#25a872] focus:border-[#25a872] outline-none transition-all";
const EMPTY = { name: "", staff_id: "", email: "", password: "", role: "state-officer", zone_id: "", state_id: "", is_active: true };

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [zones, setZones] = React.useState<ZonalOffice[]>([]);
  const [states, setStates] = React.useState<StateOffice[]>([]);
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
  }, []);

  const filteredStates = form.zone_id ? states.filter(s => String(s.zonal_id) === String(form.zone_id)) : states;

  const openCreate = () => { setForm({ ...EMPTY }); setEditing(null); setModal("create"); };
  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setForm({ name: u.name, staff_id: u.staff_id, email: u.email || "", password: "", role: u.role, zone_id: String(u.zone_id || ""), state_id: String(u.state_id || ""), is_active: u.is_active });
    setModal("edit");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload: any = { name: form.name, staff_id: form.staff_id, email: form.email || undefined, role: form.role, zone_id: form.zone_id ? Number(form.zone_id) : undefined, state_id: form.state_id ? Number(form.state_id) : undefined, is_active: form.is_active };
      if (form.password) payload.password = form.password;
      if (modal === "create") { if (!form.password) { toast.error("Password required"); setSaving(false); return; } await usersApi.create(payload); toast.success("User created"); }
      else if (editing) { await usersApi.update(editing.id, payload); toast.success("User updated"); }
      setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    try { await usersApi.delete(u.id); toast.success("User deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
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

      <AdminModal title={modal === "create" ? "Add New User" : "Edit User"} open={modal !== null} onClose={() => setModal(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Full Name" required><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></Field>
          <Field label="Staff ID" required><input className={inputCls} value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))} required disabled={modal === "edit"} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></Field>
          <Field label={modal === "create" ? "Password" : "New Password (leave blank to keep)"} required={modal === "create"}>
            <input type="password" className={inputCls} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={modal === "create"} />
          </Field>
          <Field label="Role" required>
            <select className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </Field>
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
          {modal === "edit" && (
            <Field label="Status">
              <select className={inputCls} value={form.is_active ? "1" : "0"} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === "1" }))}>
                <option value="1">Active</option><option value="0">Inactive</option>
              </select>
            </Field>
          )}
          <div className="flex justify-end gap-3 pt-2">
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
