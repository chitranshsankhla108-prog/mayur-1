import type {
  Category,
  Product,
  ProductTemplate,
  TemplateField,
} from "@/types";

// ============================================================
// Sample / seed data used until Supabase is fully wired.
// Storefront pages read from here when no DB rows are available.
// ============================================================

// No stock photos: categories/products render a consistent branded
// MediaPlaceholder (icon tile) until a real image is uploaded via the admin.
// This keeps every card distinct-but-uniform and avoids repeated/irrelevant imagery.

export const categories: Category[] = [
  {
    id: "cat-inverters",
    name: "Inverters",
    slug: "inverters",
    description: "Pure & modified sine wave inverters for home and business.",
    image_url: null,
    icon: "Zap",
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-batteries",
    name: "Batteries",
    slug: "batteries",
    description: "Tubular, flat-plate and lithium batteries built to last.",
    image_url: null,
    icon: "BatteryCharging",
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-cctv",
    name: "CCTV Cameras",
    slug: "cctv-cameras",
    description: "HD & IP security cameras for round-the-clock protection.",
    image_url: null,
    icon: "Cctv",
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-dvr",
    name: "DVR / NVR",
    slug: "dvr-nvr",
    description: "Recorders that keep every frame safe and searchable.",
    image_url: null,
    icon: "HardDrive",
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-solar",
    name: "Solar Products",
    slug: "solar-products",
    description: "Panels, controllers and kits for clean energy savings.",
    image_url: null,
    icon: "Sun",
    is_active: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-electrical",
    name: "Electrical Accessories",
    slug: "electrical-accessories",
    description: "Cables, switches and the essentials every install needs.",
    image_url: null,
    icon: "Plug",
    is_active: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-networking",
    name: "Networking Devices",
    slug: "networking-devices",
    description: "Routers, switches and PoE gear for reliable connectivity.",
    image_url: null,
    icon: "Router",
    is_active: true,
    sort_order: 7,
    created_at: new Date().toISOString(),
  },
];

// ---- Template field helper ----
function field(
  templateId: string,
  key: string,
  label: string,
  type: TemplateField["field_type"],
  order: number,
  opts?: { required?: boolean; placeholder?: string; options?: string[] }
): TemplateField {
  return {
    id: `${templateId}-${key}`,
    template_id: templateId,
    label,
    field_key: key,
    field_type: type,
    placeholder: opts?.placeholder ?? null,
    options: opts?.options ?? null,
    is_required: opts?.required ?? false,
    sort_order: order,
  };
}

export const templates: ProductTemplate[] = [
  {
    id: "tpl-inverter",
    category_id: "cat-inverters",
    name: "Inverter",
    description: "Specs for home & commercial inverters.",
    is_preset: true,
    created_at: new Date().toISOString(),
    fields: [
      field("tpl-inverter", "va_rating", "VA Rating", "text", 1, {
        required: true,
        placeholder: "e.g. 1100VA",
      }),
      field("tpl-inverter", "wave_type", "Wave Type", "select", 2, {
        required: true,
        options: ["Pure Sine Wave", "Modified Sine Wave"],
      }),
      field("tpl-inverter", "battery_support", "Battery Support", "text", 3, {
        placeholder: "e.g. Single / Double",
      }),
      field("tpl-inverter", "input_voltage", "Input Voltage", "text", 4, {
        placeholder: "e.g. 100V - 290V",
      }),
      field("tpl-inverter", "output_voltage", "Output Voltage", "text", 5, {
        placeholder: "e.g. 230V",
      }),
      field("tpl-inverter", "warranty", "Warranty", "text", 6, {
        placeholder: "e.g. 2 Years",
      }),
    ],
  },
  {
    id: "tpl-battery",
    category_id: "cat-batteries",
    name: "Battery",
    description: "Specs for tubular / lithium batteries.",
    is_preset: true,
    created_at: new Date().toISOString(),
    fields: [
      field("tpl-battery", "capacity", "Capacity", "text", 1, {
        required: true,
        placeholder: "e.g. 150Ah",
      }),
      field("tpl-battery", "voltage", "Voltage", "text", 2, {
        placeholder: "e.g. 12V",
      }),
      field("tpl-battery", "technology", "Technology", "select", 3, {
        options: ["Tubular", "Flat Plate", "Lithium", "SMF"],
      }),
      field("tpl-battery", "backup_time", "Backup Time", "text", 4, {
        placeholder: "e.g. 4-6 hours",
      }),
      field("tpl-battery", "weight", "Weight", "text", 5, {
        placeholder: "e.g. 48 kg",
      }),
      field("tpl-battery", "warranty", "Warranty", "text", 6, {
        placeholder: "e.g. 36 + 24 Months",
      }),
    ],
  },
  {
    id: "tpl-cctv",
    category_id: "cat-cctv",
    name: "CCTV Camera",
    description: "Specs for security cameras.",
    is_preset: true,
    created_at: new Date().toISOString(),
    fields: [
      field("tpl-cctv", "resolution", "Resolution", "select", 1, {
        required: true,
        options: ["2MP", "3MP", "5MP", "8MP (4K)"],
      }),
      field("tpl-cctv", "lens_type", "Lens Type", "text", 2, {
        placeholder: "e.g. 3.6mm Fixed",
      }),
      field("tpl-cctv", "night_vision", "Night Vision", "text", 3, {
        placeholder: "e.g. Up to 30m IR",
      }),
      field("tpl-cctv", "placement", "Indoor / Outdoor", "select", 4, {
        options: ["Indoor", "Outdoor", "Indoor/Outdoor"],
      }),
      field("tpl-cctv", "storage_support", "Storage Support", "text", 5, {
        placeholder: "e.g. up to 256GB / NVR",
      }),
      field("tpl-cctv", "warranty", "Warranty", "text", 6, {
        placeholder: "e.g. 2 Years",
      }),
    ],
  },
  {
    id: "tpl-dvr",
    category_id: "cat-dvr",
    name: "DVR / NVR",
    description: "Specs for recorders.",
    is_preset: true,
    created_at: new Date().toISOString(),
    fields: [
      field("tpl-dvr", "channels", "Channels", "select", 1, {
        required: true,
        options: ["4 Channel", "8 Channel", "16 Channel", "32 Channel"],
      }),
      field("tpl-dvr", "type", "Type", "select", 2, {
        options: ["DVR", "NVR"],
      }),
      field("tpl-dvr", "max_resolution", "Max Resolution", "text", 3, {
        placeholder: "e.g. 5MP Lite",
      }),
      field("tpl-dvr", "storage_support", "Storage Support", "text", 4, {
        placeholder: "e.g. 1 SATA up to 10TB",
      }),
      field("tpl-dvr", "warranty", "Warranty", "text", 5, {
        placeholder: "e.g. 2 Years",
      }),
    ],
  },
  {
    id: "tpl-solar",
    category_id: "cat-solar",
    name: "Solar Product",
    description: "Specs for panels & controllers.",
    is_preset: true,
    created_at: new Date().toISOString(),
    fields: [
      field("tpl-solar", "wattage", "Wattage / Rating", "text", 1, {
        required: true,
        placeholder: "e.g. 165W / 20A",
      }),
      field("tpl-solar", "type", "Type", "select", 2, {
        options: ["Mono PERC", "Polycrystalline", "MPPT Controller", "PWM Controller"],
      }),
      field("tpl-solar", "voltage", "Voltage", "text", 3, {
        placeholder: "e.g. 12V/24V",
      }),
      field("tpl-solar", "efficiency", "Efficiency", "text", 4, {
        placeholder: "e.g. 21%",
      }),
      field("tpl-solar", "warranty", "Warranty", "text", 5, {
        placeholder: "e.g. 25 Years",
      }),
    ],
  },
  {
    id: "tpl-electrical",
    category_id: "cat-electrical",
    name: "Electrical Accessory",
    description: "Specs for cables & accessories.",
    is_preset: true,
    created_at: new Date().toISOString(),
    fields: [
      field("tpl-electrical", "material", "Material", "text", 1, {
        placeholder: "e.g. 99.97% Copper",
      }),
      field("tpl-electrical", "size", "Size / Gauge", "text", 2, {
        placeholder: "e.g. 1.5 sq mm",
      }),
      field("tpl-electrical", "length", "Length", "text", 3, {
        placeholder: "e.g. 90m coil",
      }),
      field("tpl-electrical", "rating", "Rating", "text", 4, {
        placeholder: "e.g. 1100V",
      }),
      field("tpl-electrical", "warranty", "Warranty", "text", 5, {
        placeholder: "e.g. 1 Year",
      }),
    ],
  },
];

// ---- Product helper ----
let pidx = 0;
function product(p: Partial<Product> & { title: string; price: number; category_id: string; slug: string }): Product {
  pidx += 1;
  const realImage = p.images?.[0]?.image_url ?? null;
  return {
    id: p.id ?? `prod-${pidx}`,
    title: p.title,
    slug: p.slug,
    sku: p.sku ?? `ME-${1000 + pidx}`,
    brand: p.brand ?? "Mayur",
    category_id: p.category_id,
    template_id: p.template_id ?? null,
    short_description: p.short_description ?? null,
    description: p.description ?? null,
    price: p.price,
    // Demo dealer price ~10% below public (rounded to ₹100) unless given.
    dealer_price:
      p.dealer_price ?? (p.price ? Math.round((p.price * 0.9) / 100) * 100 : null),
    compare_at_price: p.compare_at_price ?? null,
    stock_quantity: p.stock_quantity ?? 25,
    warranty: p.warranty ?? "2 Years",
    is_featured: p.is_featured ?? false,
    is_active: p.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: categories.find((c) => c.id === p.category_id) ?? null,
    images: realImage
      ? [
          {
            id: `${p.slug}-img`,
            product_id: p.id ?? `prod-${pidx}`,
            image_url: realImage,
            cloudinary_public_id: null,
            is_main: true,
            sort_order: 0,
          },
        ]
      : [],
    specs: p.specs ?? [],
  };
}

function spec(field_key: string, label: string, value: string) {
  return { id: `${field_key}-${Math.random()}`, product_id: "", field_key, label, value };
}

export const products: Product[] = [
  product({
    title: "150Ah Tubular Battery",
    slug: "150ah-tubular-battery",
    category_id: "cat-batteries",
    template_id: "tpl-battery",
    brand: "Mayur PowerMax",
    price: 13499,
    compare_at_price: 15999,
    short_description: "Heavy-duty tubular battery with long backup and life.",
    description:
      "The 150Ah tubular battery is engineered for deep, repeated discharge cycles, making it ideal for areas with frequent and long power cuts. Low maintenance and built for Indian conditions.",
    warranty: "36 + 24 Months",
    is_featured: true,
    stock_quantity: 40,
    specs: [
      spec("capacity", "Capacity", "150Ah"),
      spec("voltage", "Voltage", "12V"),
      spec("technology", "Technology", "Tubular"),
      spec("backup_time", "Backup Time", "5-7 hours"),
      spec("weight", "Weight", "48 kg"),
      spec("warranty", "Warranty", "36 + 24 Months"),
    ],
  }),
  product({
    title: "1100VA Pure Sine Wave Inverter",
    slug: "1100va-sine-wave-inverter",
    category_id: "cat-inverters",
    template_id: "tpl-inverter",
    brand: "Mayur PowerMax",
    price: 8999,
    compare_at_price: 10499,
    short_description: "Pure sine wave output safe for sensitive electronics.",
    description:
      "A 1100VA pure sine wave inverter delivering clean, grid-quality power for your home appliances, computers and routers. Smart LED display and intelligent charging.",
    warranty: "2 Years",
    is_featured: true,
    stock_quantity: 30,
    specs: [
      spec("va_rating", "VA Rating", "1100VA"),
      spec("wave_type", "Wave Type", "Pure Sine Wave"),
      spec("battery_support", "Battery Support", "Single Battery"),
      spec("input_voltage", "Input Voltage", "100V - 290V"),
      spec("output_voltage", "Output Voltage", "230V"),
      spec("warranty", "Warranty", "2 Years"),
    ],
  }),
  product({
    title: "5MP HD Dome CCTV Camera",
    slug: "5mp-cctv-camera",
    category_id: "cat-cctv",
    template_id: "tpl-cctv",
    brand: "Mayur Vision",
    price: 2299,
    compare_at_price: 2899,
    short_description: "Crisp 5MP footage with 30m color night vision.",
    description:
      "Capture every detail with this 5MP dome camera featuring smart IR night vision up to 30 metres, weatherproof housing and easy NVR/DVR integration.",
    warranty: "2 Years",
    is_featured: true,
    stock_quantity: 60,
    specs: [
      spec("resolution", "Resolution", "5MP"),
      spec("lens_type", "Lens Type", "3.6mm Fixed"),
      spec("night_vision", "Night Vision", "Up to 30m IR"),
      spec("placement", "Indoor / Outdoor", "Indoor/Outdoor"),
      spec("storage_support", "Storage Support", "NVR/DVR"),
      spec("warranty", "Warranty", "2 Years"),
    ],
  }),
  product({
    title: "8 Channel 5MP DVR",
    slug: "8-channel-dvr",
    category_id: "cat-dvr",
    template_id: "tpl-dvr",
    brand: "Mayur Vision",
    price: 4499,
    compare_at_price: 5299,
    short_description: "Record up to 8 cameras with H.265+ compression.",
    description:
      "An 8 channel DVR supporting 5MP Lite recording with efficient H.265+ compression to maximise storage. Mobile app access for live view from anywhere.",
    warranty: "2 Years",
    is_featured: true,
    stock_quantity: 22,
    specs: [
      spec("channels", "Channels", "8 Channel"),
      spec("type", "Type", "DVR"),
      spec("max_resolution", "Max Resolution", "5MP Lite"),
      spec("storage_support", "Storage Support", "1 SATA up to 10TB"),
      spec("warranty", "Warranty", "2 Years"),
    ],
  }),
  product({
    title: "Solar Charge Controller 20A MPPT",
    slug: "solar-charge-controller-20a",
    category_id: "cat-solar",
    template_id: "tpl-solar",
    brand: "Mayur Solar",
    price: 1899,
    compare_at_price: 2499,
    short_description: "MPPT controller squeezing more from every panel.",
    description:
      "A 20A MPPT solar charge controller that maximises harvest from your solar panels with up to 99% tracking efficiency and full battery protection.",
    warranty: "1 Year",
    is_featured: true,
    stock_quantity: 35,
    specs: [
      spec("wattage", "Rating", "20A"),
      spec("type", "Type", "MPPT Controller"),
      spec("voltage", "Voltage", "12V/24V Auto"),
      spec("efficiency", "Efficiency", "99%"),
      spec("warranty", "Warranty", "1 Year"),
    ],
  }),
  product({
    title: "Copper Electrical Cable 1.5 sq mm",
    slug: "copper-electrical-cable",
    category_id: "cat-electrical",
    template_id: "tpl-electrical",
    brand: "Mayur Wires",
    price: 1299,
    compare_at_price: 1599,
    short_description: "99.97% pure copper FR cable, 90m coil.",
    description:
      "Flame-retardant 1.5 sq mm copper cable made from 99.97% pure electrolytic copper for safe, low-loss wiring. ISI marked and built for long life.",
    warranty: "1 Year",
    is_featured: true,
    stock_quantity: 100,
    specs: [
      spec("material", "Material", "99.97% Copper"),
      spec("size", "Size", "1.5 sq mm"),
      spec("length", "Length", "90m coil"),
      spec("rating", "Rating", "1100V"),
      spec("warranty", "Warranty", "1 Year"),
    ],
  }),
  product({
    title: "200Ah Tall Tubular Battery",
    slug: "200ah-tall-tubular-battery",
    category_id: "cat-batteries",
    template_id: "tpl-battery",
    brand: "Mayur PowerMax",
    price: 17999,
    compare_at_price: 20999,
    short_description: "Maximum backup for big homes & shops.",
    warranty: "48 Months",
    stock_quantity: 18,
    specs: [
      spec("capacity", "Capacity", "200Ah"),
      spec("voltage", "Voltage", "12V"),
      spec("technology", "Technology", "Tubular"),
      spec("backup_time", "Backup Time", "8-10 hours"),
    ],
  }),
  product({
    title: "2500VA Sine Wave Inverter",
    slug: "2500va-sine-wave-inverter",
    category_id: "cat-inverters",
    template_id: "tpl-inverter",
    brand: "Mayur PowerMax",
    price: 18499,
    compare_at_price: 21999,
    short_description: "High-capacity inverter for heavy loads.",
    warranty: "2 Years",
    stock_quantity: 12,
    specs: [
      spec("va_rating", "VA Rating", "2500VA"),
      spec("wave_type", "Wave Type", "Pure Sine Wave"),
      spec("battery_support", "Battery Support", "Double Battery"),
    ],
  }),
  product({
    title: "165W Mono PERC Solar Panel",
    slug: "165w-mono-solar-panel",
    category_id: "cat-solar",
    template_id: "tpl-solar",
    brand: "Mayur Solar",
    price: 5499,
    compare_at_price: 6499,
    short_description: "High-efficiency mono PERC panel, 25yr warranty.",
    warranty: "25 Years",
    stock_quantity: 28,
    specs: [
      spec("wattage", "Wattage", "165W"),
      spec("type", "Type", "Mono PERC"),
      spec("efficiency", "Efficiency", "21%"),
    ],
  }),
  product({
    title: "Dual-Band WiFi Router AC1200",
    slug: "dual-band-wifi-router-ac1200",
    category_id: "cat-networking",
    brand: "Mayur Connect",
    price: 1799,
    compare_at_price: 2299,
    short_description: "Fast dual-band coverage for home & office.",
    warranty: "2 Years",
    stock_quantity: 45,
    specs: [],
  }),
];

// ---- Convenience getters ----
export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.is_featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.category_id === categoryId);
}

export function getTemplateById(id: string): ProductTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, limit);
}
