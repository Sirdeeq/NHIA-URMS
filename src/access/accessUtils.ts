import type { AccessEntry, AccessUser } from "./types";
import type { ParentModule, ChildModule } from "./moduleConfig";
import { resolveModuleTitle } from "./moduleConfig";

/** Map retired module titles to current MODULE_CONFIG titles */
export function normalizeModuleTitle(title: string): string {
  return resolveModuleTitle(title);
}

export function findEntry(user: AccessUser, moduleTitle: string): AccessEntry | undefined {
  const normalized = resolveModuleTitle(moduleTitle);
  return (user.access ?? []).find(e => resolveModuleTitle(e.access_to) === normalized);
}

/** Get all leaf titles from a module (flattening sub-groups) */
function allLeafTitles(mod: ParentModule): string[] {
  return mod.children.flatMap(c =>
    "type" in c && c.type === "group"
      ? c.children.map((l: ChildModule) => l.title)
      : [(c as ChildModule).title]
  );
}

export function canAccessModule(mod: ParentModule, user: AccessUser): boolean {
  if (user.role === "admin") return true;
  const r = mod.roles;
  if (r !== "all") {
    if (r === "!dg-ceo" && user.role === "dg-ceo") return false;
    if (r !== "!dg-ceo" && !(r as string[]).includes(user.role)) return false;
  }
  return !!findEntry(user, mod.title);
}

/** Map retired privilege labels to current module titles */
export function normalizeFunctionalityTitle(title: string): string {
  if (title === "My Submissions" || title === "New Annual Report") return "Annual Report";
  if (title === "SERVICOM Dashboard") return "Dashboard";
  if (title === "Citizens' Comment Card") return "Charter Performance";
  if (title === "Complaints") return "Complaints Management";
  if (title === "Complaints Register") return "Complaints Management";
  return title;
}

export function normalizeAllowedTitles(functionalities: string[]): Set<string> {
  return new Set(functionalities.map(normalizeFunctionalityTitle));
}

export function canAccessFunctionality(moduleTitle: string, functionalityTitle: string, user: AccessUser): boolean {
  if (user.role === "admin") return true;
  const entry = findEntry(user, moduleTitle);
  const normalized = normalizeFunctionalityTitle(functionalityTitle);
  if (entry?.functionalities.some(f => normalizeFunctionalityTitle(f) === normalized)) return true;

  // Legacy SDO privilege grants Monitoring Visits under SOC/Zones
  if (resolveModuleTitle(moduleTitle) === "SOC/Zones" && normalized === "Monitoring Visits") {
    const sdo = findEntry(user, "SDO");
    return !!sdo?.functionalities.some(f => normalizeFunctionalityTitle(f) === "Monitoring Visits");
  }
  return false;
}

/** Expand stored privileges for sidebar rendering (legacy SDO → SOC bridges) */
export function expandAccessEntries(access: AccessEntry[]): AccessEntry[] {
  const out = [...(access ?? [])];
  const sdo = out.find(e => resolveModuleTitle(e.access_to) === "SDO");
  const hasLegacyVisits = sdo?.functionalities.some(
    f => normalizeFunctionalityTitle(f) === "Monitoring Visits",
  );
  if (!hasLegacyVisits) return out;

  const socIdx = out.findIndex(e => resolveModuleTitle(e.access_to) === "SOC/Zones");
  if (socIdx >= 0) {
    const funcs = out[socIdx].functionalities;
    if (!funcs.some(f => normalizeFunctionalityTitle(f) === "Monitoring Visits")) {
      out[socIdx] = { ...out[socIdx], functionalities: [...funcs, "Monitoring Visits"] };
    }
  } else {
    out.push({ access_to: "SOC/Zones", functionalities: ["Monitoring Visits"] });
  }
  return out;
}

export function filterSidebar(
  config: ParentModule[],
  user: AccessUser
): Array<ParentModule & { visibleChildren: ParentModule["children"] }> {
  if (user.role === "admin") {
    return config.map(mod => ({ ...mod, visibleChildren: mod.children }));
  }

  const result: Array<ParentModule & { visibleChildren: ParentModule["children"] }> = [];

  for (const entry of (user.access ?? [])) {
    const mod = config.find(m => m.title === resolveModuleTitle(entry.access_to));
    if (!mod) continue;

    const allowed = normalizeAllowedTitles(entry.functionalities);

    const visibleChildren = mod.children.filter(c => {
      if ("type" in c && c.type === "group") {
        return c.children.some((l: ChildModule) => allowed.has(l.title));
      }
      return allowed.has((c as ChildModule).title);
    });

    if (visibleChildren.length > 0) {
      result.push({ ...mod, visibleChildren });
    }
  }

  return result;
}
