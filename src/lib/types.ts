export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  created_at: string;
}

export interface WeightOption {
  weight: string;
  price: number;
}

export interface Cake {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  images: string[];
  weight_options: WeightOption[];
  flavors: string[];
  is_available: boolean;
  is_featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface CartItem {
  cake: Cake;
  quantity: number;
  weight: string;
  price: number;
  flavor: string;
  customization: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_date: string | null;
  special_instructions: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_id: string;
  razorpay_order_id: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  cake_id: string;
  cake_name: string;
  cake_image: string;
  quantity: number;
  unit_price: number;
  weight: string;
  flavor: string;
  customization: string;
  subtotal: number;
}

export interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  deliveryDate: string;
  specialInstructions: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayInstance {
  open: () => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
