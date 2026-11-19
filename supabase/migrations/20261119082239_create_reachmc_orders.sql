/*
# Create secure shared ReachMC orders

1. New Tables
- `store_products` stores the server-owned product catalog used to validate every order.
  - `id` is the stable product identifier used by the storefront.
  - `name`, `category`, and `price_inr` are the authoritative product details.
- `orders` stores one pending manual order per generated order ID.
  - `order_id` is the shareable public reference.
  - `minecraft_username` and `discord_username` identify the buyer for staff follow-up.
  - `total_inr`, `status`, and `created_at` describe the order state.
- `order_items` stores each product, quantity, and server-calculated line total belonging to an order.

2. Security
- Row level security is enabled on all three tables.
- Direct anon/authenticated table reads and writes are denied.
- Public access is limited to two narrowly scoped functions: create an order and fetch one order by its high-entropy order ID.
- Function execution is restricted to anon/authenticated callers, with a fixed `search_path` and no staff-only fields returned.

3. Validation
- Product IDs and prices are looked up from `store_products`, never trusted from the browser.
- Quantities are limited to 1-99, totals are recalculated on the server, usernames are validated, and duplicate products are rejected.
- Orders are created as `pending` and are never treated as paid.

4. Important Notes
- This is a no-sign-in public storefront, so buyers can create orders without accounts.
- The shareable order page now works across devices because the order is stored in Supabase instead of only in browser storage.
*/

CREATE TABLE IF NOT EXISTS public.store_products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('ranks', 'crates', 'economy')),
  price_inr integer NOT NULL CHECK (price_inr > 0)
);

CREATE TABLE IF NOT EXISTS public.orders (
  order_id text PRIMARY KEY,
  minecraft_username text NOT NULL,
  discord_username text NOT NULL,
  total_inr integer NOT NULL DEFAULT 0 CHECK (total_inr >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  category text NOT NULL,
  unit_price_inr integer NOT NULL CHECK (unit_price_inr > 0),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  line_total_inr integer NOT NULL CHECK (line_total_inr > 0),
  UNIQUE (order_id, product_id)
);

INSERT INTO public.store_products (id, name, category, price_inr) VALUES
  ('rank-elite', 'ELITE', 'ranks', 20),
  ('rank-titan', 'TITAN', 'ranks', 40),
  ('rank-immortal', 'IMMORTAL', 'ranks', 60),
  ('rank-reach', 'REACH', 'ranks', 80),
  ('key-special', 'Special Key', 'crates', 5),
  ('key-spawner', 'Spawner Key', 'crates', 7),
  ('money-1m', '1 Million Money', 'economy', 30),
  ('money-2m', '2 Million Money', 'economy', 60)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, category = EXCLUDED.category, price_inr = EXCLUDED.price_inr;

ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.store_products FROM anon, authenticated;
REVOKE ALL ON TABLE public.orders FROM anon, authenticated;
REVOKE ALL ON TABLE public.order_items FROM anon, authenticated;

DROP POLICY IF EXISTS "deny_anon_store_products_select" ON public.store_products;
CREATE POLICY "deny_anon_store_products_select" ON public.store_products FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "deny_anon_store_products_insert" ON public.store_products;
CREATE POLICY "deny_anon_store_products_insert" ON public.store_products FOR INSERT TO anon, authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "deny_anon_store_products_update" ON public.store_products;
CREATE POLICY "deny_anon_store_products_update" ON public.store_products FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "deny_anon_store_products_delete" ON public.store_products;
CREATE POLICY "deny_anon_store_products_delete" ON public.store_products FOR DELETE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "deny_anon_orders_select" ON public.orders;
CREATE POLICY "deny_anon_orders_select" ON public.orders FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "deny_anon_orders_insert" ON public.orders;
CREATE POLICY "deny_anon_orders_insert" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "deny_anon_orders_update" ON public.orders;
CREATE POLICY "deny_anon_orders_update" ON public.orders FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "deny_anon_orders_delete" ON public.orders;
CREATE POLICY "deny_anon_orders_delete" ON public.orders FOR DELETE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "deny_anon_order_items_select" ON public.order_items;
CREATE POLICY "deny_anon_order_items_select" ON public.order_items FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "deny_anon_order_items_insert" ON public.order_items;
CREATE POLICY "deny_anon_order_items_insert" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "deny_anon_order_items_update" ON public.order_items;
CREATE POLICY "deny_anon_order_items_update" ON public.order_items FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "deny_anon_order_items_delete" ON public.order_items;
CREATE POLICY "deny_anon_order_items_delete" ON public.order_items FOR DELETE TO anon, authenticated USING (false);

CREATE OR REPLACE FUNCTION public.create_public_order(
  p_order_id text,
  p_minecraft_username text,
  p_discord_username text,
  p_items jsonb
)
RETURNS TABLE (order_id text, created_at timestamptz, total_inr integer, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_product public.store_products%ROWTYPE;
  v_quantity integer;
  v_total integer := 0;
  v_created_at timestamptz;
BEGIN
  IF p_order_id IS NULL OR p_order_id !~ '^RMC-[0-9]{6}-[A-Z0-9]{6}$' THEN
    RAISE EXCEPTION 'Invalid order reference';
  END IF;
  IF p_minecraft_username IS NULL OR p_minecraft_username !~ '^[A-Za-z0-9_]{3,16}$' THEN
    RAISE EXCEPTION 'Invalid Minecraft username';
  END IF;
  IF p_discord_username IS NULL OR length(btrim(p_discord_username)) NOT BETWEEN 2 AND 32 OR p_discord_username ~ '[[:cntrl:]]' THEN
    RAISE EXCEPTION 'Invalid Discord username';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 8 THEN
    RAISE EXCEPTION 'Invalid order items';
  END IF;
  IF (SELECT count(DISTINCT value->>'productId') FROM jsonb_array_elements(p_items)) <> jsonb_array_length(p_items) THEN
    RAISE EXCEPTION 'Duplicate order items';
  END IF;

  INSERT INTO public.orders (order_id, minecraft_username, discord_username)
  VALUES (p_order_id, p_minecraft_username, btrim(p_discord_username))
  RETURNING public.orders.created_at INTO v_created_at;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF v_item->>'productId' IS NULL OR v_item->>'quantity' IS NULL OR v_item->>'quantity' !~ '^[0-9]+$' THEN
      RAISE EXCEPTION 'Invalid order item';
    END IF;
    v_quantity := (v_item->>'quantity')::integer;
    IF v_quantity NOT BETWEEN 1 AND 99 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    SELECT * INTO v_product
    FROM public.store_products
    WHERE public.store_products.id = v_item->>'productId';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Unknown product';
    END IF;

    INSERT INTO public.order_items (
      order_id, product_id, product_name, category, unit_price_inr, quantity, line_total_inr
    ) VALUES (
      p_order_id,
      v_product.id,
      v_product.name,
      v_product.category,
      v_product.price_inr,
      v_quantity,
      v_product.price_inr * v_quantity
    );
    v_total := v_total + (v_product.price_inr * v_quantity);
  END LOOP;

  UPDATE public.orders
  SET total_inr = v_total
  WHERE public.orders.order_id = p_order_id;

  RETURN QUERY
  SELECT p_order_id, v_created_at, v_total, 'pending'::text;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_order(p_order_id text)
RETURNS TABLE (
  order_id text,
  minecraft_username text,
  discord_username text,
  total_inr integer,
  status text,
  created_at timestamptz,
  items jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    o.order_id,
    o.minecraft_username,
    o.discord_username,
    o.total_inr,
    o.status,
    o.created_at,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'productId', oi.product_id,
          'name', oi.product_name,
          'category', oi.category,
          'unitPriceInr', oi.unit_price_inr,
          'quantity', oi.quantity,
          'lineTotalInr', oi.line_total_inr
        ) ORDER BY oi.id
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'::jsonb
    ) AS items
  FROM public.orders AS o
  LEFT JOIN public.order_items AS oi ON oi.order_id = o.order_id
  WHERE o.order_id = p_order_id
  GROUP BY o.order_id, o.minecraft_username, o.discord_username, o.total_inr, o.status, o.created_at;
$$;

REVOKE ALL ON FUNCTION public.create_public_order(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_order(text, text, text, jsonb) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.get_public_order(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_order(text) TO anon, authenticated;
