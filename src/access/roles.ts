/**
 * Role helpers — roles are stored in the database and managed under Settings → Roles.
 * Use rolesApi.list() for the live role list; these helpers are for UI access checks.
 */
import { resolveModuleTitle } from "./moduleConfig";

export function hasModuleAccess(
  access: { access_to: string; functionalities: string[] }[],
  moduleTitle: string,
  role?: string,
): boolean {
  if (role === "admin") return true;
  const resolved = resolveModuleTitle(moduleTitle);
  return access.some((e) => resolveModuleTitle(e.access_to) === resolved);
}
