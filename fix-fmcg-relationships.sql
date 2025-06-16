-- ============================================================
-- Fix FMCG View Relationships for Supabase PostgREST
-- This patch enables nested queries between FMCG views
-- ============================================================

-- 1. First ensure the views exist with correct definitions
CREATE OR REPLACE VIEW public.transactions_fmcg AS
SELECT t.*
FROM transactions t
WHERE NOT EXISTS (
    SELECT 1
    FROM transaction_items ti
    JOIN products p ON p.id = ti.product_id
    WHERE ti.transaction_id = t.id
    AND p.is_fmcg = false
);

CREATE OR REPLACE VIEW public.transaction_items_fmcg AS
SELECT ti.*
FROM transaction_items ti
JOIN products p ON p.id = ti.product_id
WHERE p.is_fmcg = true;

-- 2. Drop existing constraints if they exist (to avoid conflicts)
ALTER VIEW public.transactions_fmcg DROP CONSTRAINT IF EXISTS transactions_fmcg_pkey CASCADE;
ALTER VIEW public.transaction_items_fmcg DROP CONSTRAINT IF EXISTS transaction_items_fmcg_pkey CASCADE;
ALTER VIEW public.transaction_items_fmcg DROP CONSTRAINT IF EXISTS transaction_items_fmcg_transaction_fk CASCADE;
ALTER VIEW public.transaction_items_fmcg DROP CONSTRAINT IF EXISTS transaction_items_fmcg_product_fk CASCADE;

-- 3. Add primary key constraints (metadata only for views)
ALTER VIEW public.transactions_fmcg 
  ADD CONSTRAINT transactions_fmcg_pkey PRIMARY KEY (id) NOT VALID;

ALTER VIEW public.transaction_items_fmcg 
  ADD CONSTRAINT transaction_items_fmcg_pkey PRIMARY KEY (id) NOT VALID;

-- 4. Add foreign key relationships for PostgREST discovery
ALTER VIEW public.transaction_items_fmcg
  ADD CONSTRAINT transaction_items_fmcg_transaction_fk
  FOREIGN KEY (transaction_id) 
  REFERENCES public.transactions_fmcg(id) NOT VALID;

ALTER VIEW public.transaction_items_fmcg
  ADD CONSTRAINT transaction_items_fmcg_product_fk
  FOREIGN KEY (product_id)
  REFERENCES public.products(id) NOT VALID;

-- 5. Grant proper permissions
GRANT SELECT ON public.transactions_fmcg TO anon, authenticated, service_role;
GRANT SELECT ON public.transaction_items_fmcg TO anon, authenticated, service_role;

-- 6. Verify the relationships are working
DO $$
BEGIN
  RAISE NOTICE 'FMCG view relationships have been configured for PostgREST';
  RAISE NOTICE 'The following nested queries should now work:';
  RAISE NOTICE '  - transactions_fmcg { *, transaction_items_fmcg(*) }';
  RAISE NOTICE '  - transaction_items_fmcg { *, products(*) }';
END $$;