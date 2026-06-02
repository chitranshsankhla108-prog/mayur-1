// ============================================================
// Domain types for Mayur Electronics
// These mirror the Supabase schema (see supabase/schema.sql)
// ============================================================

export type UserRole = "customer" | "dealer" | "admin" | "staff";

export type FieldType = "text" | "number" | "select" | "textarea" | "boolean";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod =
  | "upi"
  | "card"
  | "netbanking"
  | "razorpay"
  | "cod";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string | null;
  email: string;
  role: UserRole;
  business_name: string | null;
  gst_number: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface TemplateField {
  id: string;
  template_id: string;
  label: string;
  field_key: string;
  field_type: FieldType;
  placeholder: string | null;
  options: string[] | null;
  is_required: boolean;
  sort_order: number;
}

export interface ProductTemplate {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  is_preset: boolean;
  created_at: string;
  fields?: TemplateField[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  cloudinary_public_id: string | null;
  is_main: boolean;
  sort_order: number;
}

export interface ProductSpec {
  id: string;
  product_id: string;
  field_key: string;
  label: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  category_id: string | null;
  template_id: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  /** Dealer-only price. NULL => dealers fall back to the public price. */
  dealer_price: number | null;
  compare_at_price: number | null;
  stock_quantity: number;
  warranty: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations (optional, populated on fetch)
  category?: Category | null;
  images?: ProductImage[];
  specs?: ProductSpec[];
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

export interface CartItem {
  id: string;
  user_id?: string;
  product_id: string;
  quantity: number;
  created_at?: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  /** Which price tier was charged for this line at checkout time. */
  price_type?: "public" | "dealer" | null;
}

export interface ShippingAddress {
  full_name: string;
  mobile: string;
  email?: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  subtotal: number;
  gst_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address: ShippingAddress;
  created_at: string;
  items?: OrderItem[];
}

// ---- Client-side cart shape (localStorage / zustand) ----
export interface LocalCartItem {
  productId: string;
  title: string;
  slug: string;
  /** Effective unit price the buyer pays (dealer price when applicable). */
  price: number;
  compareAtPrice: number | null;
  image: string;
  brand: string | null;
  stock: number;
  quantity: number;
  /** Whether `price` is the public or dealer price. */
  priceType: "public" | "dealer";
}
