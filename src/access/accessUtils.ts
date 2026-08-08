import type { AccessEntry, AccessUser } from "./types";
import type { ParentModule, ChildModule } from "./moduleConfig";
import { resolveModuleTitle } from "./moduleConfig";

export function findEntry(user: AccessUser, moduleTitle: string): AccessEntry | undefined {
  return (user.access ?? []).find(
    e => resolveModuleTitle(e.access_to) === resolveModuleTitle(moduleTitle),
  );
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
  return !!(user.access ?? []).find(
    e => resolveModuleTitle(e.access_to) === mod.title,
  );
}

/** Map retired privilege labels to current module titles */
export function normalizeFunctionalityTitle(title: string): string {
  if (title === "My Submissions" || title === "New Annual Report") return "Annual Report";
  if (title === "SERVICOM Dashboard") return "Dashboard";
  return title;
}

export function normalizeAllowedTitles(functionalities: string[]): Set<string> {
  return new Set(functionalities.map(normalizeFunctionalityTitle));
}

export function canAccessFunctionality(moduleTitle: string, functionalityTitle: string, user: AccessUser): boolean {
  if (user.role === "admin") return true;
  const entry = findEntry(user, moduleTitle);
  if (!entry) return false;
  const normalized = normalizeFunctionalityTitle(functionalityTitle);
  return entry.functionalities.some(f => normalizeFunctionalityTitle(f) === normalized);
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
