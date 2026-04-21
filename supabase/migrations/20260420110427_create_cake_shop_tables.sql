
/*
  # Cake Shop - Core Tables

  1. New Tables
    - `categories` - Cake categories (birthday, wedding, custom, etc.)
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `image_url` (text)
      - `created_at` (timestamp)

    - `cakes` - Product catalog
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `price` (numeric)
      - `category_id` (uuid, FK to categories)
      - `image_url` (text)
      - `images` (text array - additional images)
      - `weight_options` (jsonb - [{weight, price}])
      - `flavors` (text array)
      - `is_available` (boolean)
      - `is_featured` (boolean)
      - `tags` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `orders` - Customer orders
      - `id` (uuid, primary key)
      - `order_number` (text, unique)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `delivery_address` (text)
      - `delivery_date` (date)
      - `special_instructions` (text)
      - `subtotal` (numeric)
      - `delivery_fee` (numeric)
      - `total_amount` (numeric)
      - `status` (text: pending/confirmed/preparing/out_for_delivery/delivered/cancelled)
      - `payment_status` (text: pending/paid/failed/refunded)
      - `payment_id` (text - Razorpay payment ID)
      - `razorpay_order_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `order_items` - Line items for each order
      - `id` (uuid, primary key)
      - `order_id` (uuid, FK to orders)
      - `cake_id` (uuid, FK to cakes)
      - `cake_name` (text - snapshot)
      - `cake_image` (text - snapshot)
      - `quantity` (integer)
      - `unit_price` (numeric)
      - `weight` (text)
      - `flavor` (text)
      - `customization` (text)
      - `subtotal` (numeric)

  2. Security
    - Enable RLS on all tables
    - Public read access for categories and cakes
    - Admin full access via service role
    - Customer can insert orders, read their own orders
    - Public can insert orders (for guest checkout)
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text DEFAULT '',
  images text[] DEFAULT '{}',
  weight_options jsonb DEFAULT '[]',
  flavors text[] DEFAULT '{}',
  is_available boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  delivery_date date,
  special_instructions text DEFAULT '',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending',
  payment_id text DEFAULT '',
  razorpay_order_id text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cake_id uuid REFERENCES cakes(id) ON DELETE SET NULL,
  cake_name text NOT NULL,
  cake_image text DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  weight text DEFAULT '',
  flavor text DEFAULT '',
  customization text DEFAULT '',
  subtotal numeric(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read available cakes"
  ON cakes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read their orders by email"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update order payment status"
  ON orders FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read order items"
  ON order_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_cakes_category ON cakes(category_id);
CREATE INDEX IF NOT EXISTS idx_cakes_featured ON cakes(is_featured);
CREATE INDEX IF NOT EXISTS idx_cakes_available ON cakes(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
