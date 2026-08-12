import { LOOKUPS } from "@/src/store/useAssetManagement";

export const SUPPLY_NATURES = ["Goods", "Services", "Works"] as const;

/** Categories that skip inventory and go to the Asset Register after verification. */
export const CAPITAL_PRIMARY_CATEGORIES = ["Land", "Building", "Motor Vehicles"] as const;

export function isCapitalPrimaryCategory(category: string) {
  return (CAPITAL_PRIMARY_CATEGORIES as readonly string[]).includes(category);
}

export function getPrimaryCategoryKeys(): string[] {
  return Object.keys(LOOKUPS.primaryCategories || {});
}

export function getSubCategoryKeys(primary: string): string[] {
  return Object.keys(LOOKUPS.primaryCategories?.[primary] || {});
}

export function getSpecificTypeKeys(primary: string, sub: string): string[] {
  return LOOKUPS.primaryCategories?.[primary]?.[sub] || [];
}

export function classificationForCategory(
  nature: (typeof SUPPLY_NATURES)[number],
  primary: string
): "ASSET_REGISTER" | "STORE_INVENTORY" {
  if (nature === "Goods" && isCapitalPrimaryCategory(primary)) return "ASSET_REGISTER";
  return "STORE_INVENTORY";
}

export const GOODS_CATEGORIES = [
  "Land",
  "Building",
  "Motor Vehicles",
  "Office Equipment",
  "Office Furniture",
  "Computer Equipment",
  "Plant and Machinery",
] as const;

export const GOODS_SUBCATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  Land: [
    "Residential Plot",
    "Commercial Plot",
    "Industrial Plot",
    "Freehold Land (Purchased)",
    "Leasehold Land",
  ],
  Building: [
    "Administrative & Commercial",
    "Warehouses & Storage Facilities",
    "Residential Property",
    "Offices",
    "State Office",
    "Zonal Office",
    "Annex Office",
  ],
  "Motor Vehicles": [
    "Executive & Official Cars",
    "Sedans",
    "SUV",
    "Operational & Utility Vehicles",
    "Field/Inspection Pick-up",
    "Trucks",
    "Staff Buses/Van",
    "Utility Vans",
  ],
  "Office Equipment": [
    "Printing & Document Management",
    "Power Generation & Energy Systems",
    "Telecommunications",
    "Office Appliances",
    "Security & Office Automation",
    "Power Management",
    "Printers",
    "Scanners",
    "Photocopiers",
    "Paper Shredders",
    "Binding Machines",
    "Laminators",
    "Projector",
    "Display Screens",
    "Desk Phones",
    "Mobile Phones",
    "Wall-Mounted Display Screens",
    "Conference Room Speaker/Microphones",
    "HDMI Splitter",
    "Air Conditioner Units",
    "Refrigerators",
    "Television",
    "Microwave Ovens",
    "Water Dispensers",
    "Electric Kettles",
    "Ceiling Fan",
    "Fire Extinguishers",
    "Stabilizers",
    "Hand Dryer",
    "Coffee Machine",
    "Wall-Mounted Whiteboards",
    "Notice Boards",
    "Cupboards",
    "POS Machines",
    "Vaults/Safes",
    "Electronic Stamping Machines",
    "Uninterruptible Power Supplies (UPS)",
    "Power Surge Protectors",
    "Amplifier",
    "Industrial Diesel Generators",
    "Solar Power Systems (Inverters, Battery Banks)",
    "Industrial UPS Systems",
  ],
  "Office Furniture": [
    "Seating",
    "Desks & Workstations",
    "Storage & Filing Systems",
    "Fixtures & Room Fittings",
    "Executive Ergonomic Chairs",
    "Staff Workstation Task Chairs",
    "Conference Room Chairs",
    "Visitor Armchairs & Reception Couches",
    "Executive Office Desks",
    "Modular Open-Plan Workstations",
    "Reception Counters",
    "Boardroom Tables",
    "Lockable Metal Filing Cabinets",
    "Wooden Bookshelves & Storage Wardrobes",
    "Drawers",
    "Shelves",
    "Safe",
    "Window Blinds & Curtains",
    "Acoustic Room Dividers",
    "Suit Hanger",
    "TV Stands",
    "Hat Stand",
    "Standing Mirror",
  ],
  "Computer Equipment": [
    "User End-Point Devices",
    "Peripherals",
    "Network Infrastructure",
    "Server & Data Center Hardware",
    "Desktop PCs",
    "Workstation Towers",
    "Laptops",
    "Tablets / iPads",
    "Keyboards",
    "Mice",
    "Docking Stations",
    "External Hard Drives",
    "Webcams",
    "Network Switches",
    "Routers",
    "Firewalls",
    "Wireless Access Points (Wi-Fi APs)",
    "Rack-Mounted Servers",
    "Storage Area Networks (SAN/NAS)",
    "Server Racks & Enclosures",
    "Enterprise UPS Systems",
    "Cooling Units for Server Rooms",
  ],
  "Plant and Machinery": [
    "Capacity (KVA)",
    "Power Management Systems",
    "Industrial Machinery",
    "Production Equipment",
  ],
};

export const STORE_SUBCATEGORIES: Record<(typeof SUPPLY_NATURES)[number], string[]> = {
  Goods: GOODS_SUBCATEGORIES_BY_CATEGORY[GOODS_CATEGORIES[0]],
  Services: ["Maintenance", "Consultancy", "Security", "Cleaning", "ICT Support", "Training"],
  Works: ["Civil Works", "Electrical", "Plumbing", "Renovation", "Construction"],
};

export function getSupplySubcategories(nature: (typeof SUPPLY_NATURES)[number], goodsCategory?: string) {
  if (nature === "Goods") {
    const subs = getSubCategoryKeys(goodsCategory || "Office Equipment");
    if (subs.length) return subs;
    return getSubCategoryKeys("Office Equipment");
  }
  return STORE_SUBCATEGORIES[nature] || [];
}

export const PHYSICAL_CONDITIONS = ["Excellent", "Good", "Fair", "Poor", "Defective"] as const;

export const VERIFICATION_STATUSES = [
  { value: "VERIFIED_PASSED", label: "Verified & Passed" },
  { value: "PARTIAL_PASS", label: "Partial Pass" },
  { value: "FAILED", label: "Failed / Rejected" },
] as const;

export const APPROVAL_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const;

/** One state office = one store. */
export function storeNameFromState(stateName: string | null | undefined) {
  const name = String(stateName || "").trim();
  if (!name) return "";
  if (/\bstore\b/i.test(name)) return name;
  return `${name} Store`;
}

export function matchesStore(itemStore: string | null | undefined, selected: string) {
  if (!selected) return true;
  const loc = String(itemStore || "").trim().toLowerCase();
  const sel = selected.trim().toLowerCase();
  if (!loc || !sel) return false;
  if (loc === sel) return true;
  const derived = storeNameFromState(selected).toLowerCase();
  if (loc === derived) return true;
  return loc.includes(sel) || sel.includes(loc);
}

export const SELECT_CLS =
  "w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25a872]/40 disabled:bg-slate-50 disabled:text-slate-500";

export const LABEL_CLS = "block text-[11px] font-semibold text-slate-600 mb-1.5";
