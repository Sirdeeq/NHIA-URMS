import type { AccessEntry, AccessUser } from "./types";
import type { ParentModule, ChildModule } from "./moduleConfig";

export function findEntry(user: AccessUser, moduleTitle: string): AccessEntry | undefined {
  return (user.access ?? []).find(e => e.access_to === moduleTitle);
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
  return !!(user.access ?? []).find(e => e.access_to === mod.title);
}

export function canAccessFunctionality(moduleTitle: string, functionalityTitle: string, user: AccessUser): boolean {
  if (user.role === "admin") return true;
  const entry = findEntry(user, moduleTitle);
  if (!entry) return false;
  return entry.functionalities.includes(functionalityTitle);
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
    const mod = config.find(m => m.title === entry.access_to);
    if (!mod) continue;

    const allowed = new Set(entry.functionalities);

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
