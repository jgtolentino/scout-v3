-- ===========================================================
-- Fix PostgREST relationship discovery for FMCG views
-- This adds metadata-only constraints to enable nested queries
-- ===========================================================

-- 1) Ensure both FMCG views exist with correct definitions
CREATE OR REPLACE VIEW public.transactions_fmcg AS
SELECT t.*
FROM   transactions t
WHERE NOT EXISTS (          -- all line-items must be FMCG
        SELECT 1
        FROM   transaction_items ti
        JOIN   products p ON p.id = ti.product_id
        WHERE  ti.transaction_id = t.id
          AND  p.is_fmcg = false);

CREATE OR REPLACE VIEW public.transaction_items_fmcg AS
SELECT ti.*
FROM   transaction_items ti
JOIN   products p ON p.id = ti.product_id
WHERE  p.is_fmcg = true;

-- 2) Add primary key constraints (metadata only, not enforced)
ALTER VIEW public.transactions_fmcg
  ADD CONSTRAINT transactions_fmcg_pkey PRIMARY KEY (id);

ALTER VIEW public.transaction_items_fmcg
  ADD CONSTRAINT transaction_items_fmcg_pkey PRIMARY KEY (id);

-- 3) Add foreign key metadata for PostgREST relationship discovery
ALTER VIEW public.transaction_items_fmcg
  ADD CONSTRAINT transaction_items_fmcg_transaction_fk
  FOREIGN KEY (transaction_id)
  REFERENCES public.transactions_fmcg(id);

-- 4) Add product relationship for completeness
ALTER VIEW public.transaction_items_fmcg
  ADD CONSTRAINT transaction_items_fmcg_product_fk
  FOREIGN KEY (product_id)
  REFERENCES public.products(id);

-- 5) Grant necessary permissions
GRANT SELECT ON public.transactions_fmcg TO anon, authenticated;
GRANT SELECT ON public.transaction_items_fmcg TO anon, authenticated;

-- 6) Force schema cache refresh (automatic with DDL, but explicit comment)
-- PostgREST will now recognize the relationship:
-- transactions_fmcg -> transaction_items_fmcg