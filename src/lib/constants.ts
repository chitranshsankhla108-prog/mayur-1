export const SITE = {
  name: "Mayur Electronics",
  shortName: "Mayur",
  tagline: "Powering the future of your home & business",
  description:
    "Shop trusted inverters, batteries, CCTV systems, solar products, and electrical accessories — genuine products with warranty and fast delivery.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: "support@mayurelectronics.in",
  phone: "+91 98765 43210",
  address: "Shop 14, Electronics Market, Jaipur, Rajasthan 302001",
};

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";

export const GST_RATE = 0.18; // 18% GST

export const SHIPPING = {
  standard: { label: "Standard Delivery", price: 0, eta: "4-6 business days" },
  express: { label: "Express Delivery", price: 149, eta: "1-2 business days" },
  pickup: { label: "Store Pickup", price: 0, eta: "Ready in 24 hours" },
} as const;

export type DeliveryOption = keyof typeof SHIPPING;

export const MAIN_NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export const ACCOUNT_NAV = [
  { label: "Dashboard", href: "/account", icon: "LayoutDashboard" },
  { label: "Orders", href: "/account/orders", icon: "Package" },
  { label: "Wishlist", href: "/account/wishlist", icon: "Heart" },
  { label: "Addresses", href: "/account/addresses", icon: "MapPin" },
  { label: "Profile", href: "/account/profile", icon: "User" },
];

export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { label: "Orders", href: "/admin/orders", icon: "ShoppingCart" },
  { label: "Products", href: "/admin/products", icon: "Package" },
  { label: "Add Product", href: "/admin/products/new", icon: "Plus" },
  { label: "Categories", href: "/admin/categories", icon: "FolderTree" },
  { label: "Templates", href: "/admin/templates", icon: "LayoutTemplate" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
];
