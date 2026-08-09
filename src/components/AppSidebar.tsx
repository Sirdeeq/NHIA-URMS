import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronRight,
  File,
  Folder,
  Settings,
  Home,
  FileText,
  CheckSquare,
  Bell,
  Users,
  ClipboardList,
  PackageSearch,
  Wrench,
  MapPin,
  Scale,
  Megaphone,
  Activity,
  TrendingUp,
  Boxes,
  PlusCircle,
  ListFilter,
  ArrowRightLeft,
  Trash2,
  Receipt,
  Send,
  Warehouse,
  RotateCcw,
  PackageCheck,
  QrCode,
  FileCheck,
  AlertTriangle,
  FileSpreadsheet,
  Building,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AccessEntry } from "@/src/access/types";
import {
  MODULE_CONFIG,
  type ChildModule,
  type SubGroup,
  flatLeaves,
  moduleConfigForAccess,
  isSubGroup,
} from "@/src/access/moduleConfig";
import { hasModuleAccess } from "@/src/access/roles";
import { normalizeAllowedTitles, expandAccessEntries } from "@/src/access/accessUtils";

type View = string;

interface AppSidebarProps {
  role: string;
  user?: import("@/src/store/authSlice").AuthUser;
  access: AccessEntry[];
  view: View;
  setView: (v: View) => void;
  onLogout: () => void;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  "Register Asset": PlusCircle,
  "Asset Master Register": ListFilter,
  "Transfers & Movements": ArrowRightLeft,
  "Maintenance & Servicing": Wrench,
  "Board Disposal": Trash2,
  "Inventory Catalog": Boxes,
  "Goods Receipt (GRN)": Receipt,
  "Stock Issue": Send,
  "Store Directory": Warehouse,
  "Stock Returns": RotateCcw,
  "Supply Pre-Verification": PackageCheck,
  "Verification of Supply": PackageCheck,
  "Physical Asset Verification": QrCode,
  "Verification Certificates": FileCheck,
  "Discrepancy Exceptions": AlertTriangle,
  "Reports & Analytics": FileSpreadsheet,
  "User Management": Users,
  "Offices & Locations": Building,
  "Audit Trail Logs": ShieldAlert,
  Dashboard: Home,
  "My Annual Reports": FileText,
  "Submit New Report": PlusCircle,
  "Annual Report": FileText,
  "Zonal Review": CheckSquare,
  "Stock Verification": ClipboardList,
  "STOCK VERIFICATION": ClipboardList,
  "Stock Assets": PackageSearch,
  "Store Management": Warehouse,
  "Asset Management (SVO)": Warehouse,
  SERVICOM: Megaphone,
  "SPECIAL PROJECT": FileSpreadsheet,
  "STATE OFFICE COORDINATION": Building,
  "SERVICOM Dashboard": Activity,
  "Monitoring Visits": MapPin,
  "Operational Monitoring Visit": MapPin,
  "Spot Check Visit": MapPin,
  Complaints: Scale,
  "Complaints Management": Scale,
  "Customer Satisfaction Survey": TrendingUp,
  "Charter Performance": Megaphone,
  "Satisfaction Ratings": TrendingUp,
  "Comment Cards": Megaphone,
  Notifications: Bell,
  Settings: Settings,
  "Monthly Report": FileText,
  "ICT Support Desk": ClipboardList,
  "Systems & Network": PackageSearch,
  "Compliance Management": ShieldAlert,
  SDO: ShieldAlert,
};

// ─── Path ↔ View maps ────────────────────────────────────────────────────────
const VIEW_TO_PATH: Record<string, string> = {
  home: "/",
  "annual-reports-list": "/annual-reports/mine",
  "report-entry": "/annual-reports/submit",
  "zonal-review": "/annual-reports/review",
  "stock-verifications-list": "/sdo/stock-verification",
  "stock-assets": "/sdo/assets",
  "servicom-dashboard": "/sdo/servicom",
  "servicom-visits": "/sdo/servicom/visits",
  "servicom-complaints": "/sdo/servicom/complaints",
  "servicom-satisfaction": "/sdo/servicom/satisfaction",
  "servicom-comment-card": "/sdo/servicom/comment-card",
  notifications: "/notifications",
  settings: "/settings",
};

type TreeNode =
  | { kind: "leaf"; title: string; view?: string; path?: string }
  | { kind: "folder"; title: string; children: TreeNode[] };

/** If a folder has only one child, promote that child (no redundant dropdown). */
function collapseSingleChildFolders(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => {
    if (node.kind === "leaf") return node;

    const children = collapseSingleChildFolders(node.children);
    if (children.length === 1) return children[0];
    return { ...node, children };
  });
}

function filterModuleTree(
  children: (ChildModule | SubGroup)[],
  allowedTitles: Set<string>,
  storeAllowed?: Set<string>
): TreeNode[] {
  const nodes: TreeNode[] = [];

  for (const child of children) {
    if (isSubGroup(child)) {
      let nested = filterModuleTree(child.children, allowedTitles, storeAllowed);

      // Nest Asset Management (SVO) under STOCK VERIFICATION only when that privilege is granted
      if (
        child.label === "STOCK VERIFICATION" &&
        storeAllowed &&
        storeAllowed.size > 0
      ) {
        const assetMod = MODULE_CONFIG.find((m) => m.title === "Asset Management (SVO)");
        const storeKids = collapseSingleChildFolders(
          filterModuleTree(assetMod?.children ?? [], storeAllowed)
        );
        if (storeKids.length > 0) {
          nested.push({
            kind: "folder",
            title: "Asset Management (SVO)",
            children: storeKids,
          });
        }
      }

      nested = collapseSingleChildFolders(nested);
      if (nested.length === 0) continue;

      // One item under this group → show that item only (no group dropdown)
      if (nested.length === 1) {
        nodes.push(nested[0]);
        continue;
      }

      nodes.push({
        kind: "folder",
        title: child.label,
        children: nested,
      });
      continue;
    }

    if (!child.view || !allowedTitles.has(child.title)) continue;

    nodes.push({
      kind: "leaf",
      title: child.title,
      view: child.view,
      path: child.path,
    });
  }

  return nodes;
}

function buildVisibleTree(
  mod: (typeof MODULE_CONFIG)[0],
  allowedTitles: Set<string>,
  storeAllowed?: Set<string>
): TreeNode | null {
  const children = collapseSingleChildFolders(
    filterModuleTree(
      mod.children,
      allowedTitles,
      mod.title === "SDO" ? storeAllowed : undefined
    )
  );
  if (children.length === 0) return null;

  // Only one navigable item → flat link, no parent dropdown
  if (children.length === 1) return children[0];

  return {
    kind: "folder",
    title: mod.title,
    children,
  };
}

const navItemClass =
  "h-auto! min-h-8 items-start whitespace-normal overflow-visible py-2 font-semibold [&>span:last-child]:whitespace-normal [&>span:last-child]:overflow-visible [&>span:last-child]:text-wrap [&>span:last-child]:leading-snug [&>span:last-child]:font-semibold";

function NavTreeItem({
  node,
  currentView,
  setView,
  depth = 0,
}: {
  node: TreeNode;
  currentView: View;
  setView: (v: View) => void;
  depth?: number;
}) {
  const location = useLocation();
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  // Nested (and top-level) groups start closed — opening a parent never auto-opens children
  const [open, setOpen] = React.useState(false);
  const closeMobile = () => {
    if (isMobile) toggleSidebar();
  };

  if (node.kind === "leaf") {
    const path = node.path || VIEW_TO_PATH[node.view || ""] || "/";
    const isActive = location.pathname === path || currentView === node.view;
    const LeafIcon = ICON_MAP[node.title] || File;

    return (
      <SidebarMenuButton
        isActive={isActive}
        tooltip={node.title}
        className={navItemClass}
        render={
          <NavLink
            to={path}
            onClick={() => {
              if (node.view) setView(node.view);
              closeMobile();
            }}
          />
        }
      >
        <LeafIcon className="mt-0.5" />
        <span>{node.title}</span>
      </SidebarMenuButton>
    );
  }

  const FolderIcon = ICON_MAP[node.title] || Folder;

  return (
    <SidebarMenuItem>
      <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible w-full">
        <CollapsibleTrigger
          render={
            <SidebarMenuButton tooltip={node.title} className={navItemClass} />
          }
        >
          <FolderIcon className="mt-0.5" />
          <span className="flex-1 text-left">{node.title}</span>
          <ChevronRight
            className={`mt-0.5 ml-auto shrink-0 transition-transform duration-200 ${
              open ? "rotate-90" : "rotate-0"
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="mx-2 mr-0 gap-1 overflow-visible py-1 pr-0">
            {node.children.map((child, index) => (
              <NavTreeItem
                key={`${child.kind}-${child.title}-${index}`}
                node={child}
                currentView={currentView}
                setView={setView}
                depth={depth + 1}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

function NavMain({
  modules,
  currentView,
  setView,
}: {
  modules: { mod: (typeof MODULE_CONFIG)[0]; allowedTitles: Set<string> }[];
  currentView: View;
  setView: (v: View) => void;
}) {
  const trees = React.useMemo(() => {
    const hasSdo = modules.some(({ mod }) => mod.title === "SDO");
    const storeMod = modules.find(({ mod }) => mod.title === "Asset Management (SVO)");
    const storeAllowed = storeMod?.allowedTitles;

    return modules
      .filter(({ mod }) => {
        if (mod.title === "Notifications" || mod.title === "Settings") return false;
        // When SDO is shown, Asset Management (SVO) is nested under STOCK VERIFICATION
        if (hasSdo && mod.title === "Asset Management (SVO)") return false;
        return true;
      })
      .map(({ mod, allowedTitles }) =>
        buildVisibleTree(
          mod,
          allowedTitles,
          mod.title === "SDO" ? storeAllowed : undefined
        )
      )
      .filter(Boolean) as TreeNode[];
  }, [modules]);

  return (
    <SidebarGroup >
      {/* <SidebarGroupLabel>Navigation</SidebarGroupLabel> */}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {trees.map((node, index) => (
            <NavTreeItem
              key={`${node.kind}-${node.title}-${index}`}
              node={node}
              currentView={currentView}
              setView={setView}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function collectLeafTitles(children: (ChildModule | SubGroup)[]): string[] {
  const out: string[] = [];
  for (const c of children) {
    if (isSubGroup(c)) out.push(...collectLeafTitles(c.children));
    else out.push(c.title);
  }
  return out;
}

// ─── Main AppSidebar ──────────────────────────────────────────────────────────
export function AppSidebar({
  role,
  user,
  access,
  view,
  setView,
  onLogout,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const visibleModules = React.useMemo(() => {
    if (role === "admin") {
      return MODULE_CONFIG.map((mod) => ({
        mod,
        allowedTitles: new Set<string>(collectLeafTitles(mod.children)),
      }));
    }

    const effectiveAccess = expandAccessEntries(access);
    const result = effectiveAccess
      .map((entry) => {
        const mod = moduleConfigForAccess(entry.access_to);
        if (!mod) return null;
        const funcs = Array.isArray(entry.functionalities)
          ? entry.functionalities
          : [];
        const allowedTitles =
          funcs.length > 0
            ? normalizeAllowedTitles(funcs)
            : new Set(flatLeaves(mod));
        return { mod, allowedTitles };
      })
      .filter(Boolean) as {
      mod: (typeof MODULE_CONFIG)[0];
      allowedTitles: Set<string>;
    }[];

    return result;
  }, [role, access]);

  const showSettings = hasModuleAccess(access, "Settings", role);
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();

  const closeMobile = () => {
    if (isMobile) toggleSidebar();
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border items-center justify-center h-16">
        <img
          src="/logo.png"
          alt="NHIA"
          className="h-10 w-auto object-contain"
        />
      </SidebarHeader>

      <SidebarContent>
        <NavMain modules={visibleModules} currentView={view} setView={setView} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border gap-1">
        <SidebarMenu>
          <SidebarMenuItem onClick={closeMobile}>
            <SidebarMenuButton
              tooltip="Notifications"
              isActive={
                location.pathname === "/notifications" ||
                view === "notifications"
              }
              render={
                <NavLink
                  to="/notifications"
                  onClick={() => setView("notifications")}
                />
              }
            >
              <Bell />
              <span>Notifications</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {showSettings && (
            <SidebarMenuItem onClick={closeMobile}>
              <SidebarMenuButton
                tooltip="Settings"
                isActive={
                  location.pathname === "/settings" || view === "settings"
                }
                render={
                  <NavLink
                    to="/settings"
                    onClick={() => setView("settings")}
                  />
                }
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={onLogout}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-8">
            <AvatarImage
              src={`https://picsum.photos/seed/${user?.staff_id || "NHIA"}/200`}
            />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[11px] font-bold">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "AO"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">
              {user?.name || "User"}
            </p>
            <p className="truncate text-[10px] text-sidebar-foreground/50">
              {role?.replace(/-/g, " ") || "Officer"}
            </p>
          </div>
        </div> */}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
