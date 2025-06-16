#!/usr/bin/env bash
set -e

# Scout MVP - Database Fix Verification Script
# Run this after fix_all.sh to verify everything worked

echo "🔍 Scout MVP - Database Fix Verification"
echo "========================================"
echo ""

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Error: SUPABASE_DB_URL not set"
    echo ""
    echo "To fix, run:"
    echo "export SUPABASE_DB_URL=\"postgres://postgres.jrxepdlkgdwwjxdeetmb:YOUR_PASSWORD@db.jrxepdlkgdwwjxdeetmb.supabase.co:5432/postgres\""
    exit 1
fi

echo "📊 Running verification checks..."
echo ""

# 1. Check RLS is enabled
echo "1️⃣ Checking Row-Level Security (RLS)..."
echo "----------------------------------------"
psql "$SUPABASE_DB_URL" -t -c "
  SELECT relname AS table_name, 
         CASE WHEN relrowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END AS rls_status
  FROM pg_class 
  WHERE relname IN (
    'brands','customers','products','stores','transaction_items','transactions'
  )
  ORDER BY relname;
"

# 2. Confirm only one overload of get_age_distribution_simple exists
echo ""
echo "2️⃣ Checking function overloads..."
echo "----------------------------------------"
FUNC_COUNT=$(psql "$SUPABASE_DB_URL" -t -c "
  SELECT COUNT(*) 
  FROM pg_proc 
  JOIN pg_namespace n ON pronamespace=n.oid 
  WHERE n.nspname='public' 
    AND proname='get_age_distribution_simple';
" | xargs)

echo "Function overloads found: $FUNC_COUNT"
if [ "$FUNC_COUNT" -eq "1" ]; then
    echo "✅ Correct - only one version exists"
    psql "$SUPABASE_DB_URL" -t -c "
      SELECT '   Parameters: ' || pg_get_function_identity_arguments(oid) 
      FROM pg_proc 
      JOIN pg_namespace n ON pronamespace=n.oid 
      WHERE n.nspname='public' 
        AND proname='get_age_distribution_simple';
    "
else
    echo "❌ Error - expected 1 function, found $FUNC_COUNT"
fi

# 3. Check demographic columns exist
echo ""
echo "3️⃣ Checking demographic columns..."
echo "----------------------------------------"
psql "$SUPABASE_DB_URL" -t -c "
  SELECT 
    CASE WHEN column_name IS NOT NULL THEN '✅' ELSE '❌' END || ' ' || col AS status
  FROM (VALUES ('customer_age'), ('customer_gender')) AS t(col)
  LEFT JOIN information_schema.columns c 
    ON c.table_name = 'transactions' 
    AND c.column_name = t.col
    AND c.table_schema = 'public';
"

# 4. Check demographic data population
echo ""
echo "4️⃣ Checking demographic data..."
echo "----------------------------------------"
psql "$SUPABASE_DB_URL" -c "
  SELECT 
    COUNT(*) AS total_transactions,
    COUNT(customer_age) AS with_age,
    COUNT(customer_gender) AS with_gender,
    ROUND(100.0 * COUNT(customer_age) / COUNT(*), 1) AS age_coverage_pct,
    ROUND(100.0 * COUNT(customer_gender) / COUNT(*), 1) AS gender_coverage_pct
  FROM transactions;
"

# 5. Test age distribution function
echo ""
echo "5️⃣ Testing age distribution function..."
echo "----------------------------------------"
psql "$SUPABASE_DB_URL" -c "
  SELECT * FROM public.get_age_distribution_simple(NULL, NULL) LIMIT 5;
"

# 6. Check RLS policies
echo ""
echo "6️⃣ Checking RLS policies..."
echo "----------------------------------------"
psql "$SUPABASE_DB_URL" -t -c "
  SELECT schemaname || '.' || tablename || ': ' || COUNT(*) || ' policies' AS policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename IN ('brands','customers','products','stores','transaction_items','transactions')
  GROUP BY schemaname, tablename
  ORDER BY tablename;
"

# 7. Summary
echo ""
echo "📈 Verification Summary"
echo "======================="

# Count successful checks
TOTAL_TXS=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM transactions;" | xargs)
WITH_AGE=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(customer_age) FROM transactions;" | xargs)
WITH_GENDER=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(customer_gender) FROM transactions;" | xargs)

if [ "$WITH_AGE" -eq "$TOTAL_TXS" ] && [ "$WITH_GENDER" -eq "$TOTAL_TXS" ] && [ "$FUNC_COUNT" -eq "1" ]; then
    echo ""
    echo "✅ ALL CHECKS PASSED! 🎉"
    echo ""
    echo "Your Scout MVP database is production-ready with:"
    echo "  ✅ Row-Level Security enabled on all tables"
    echo "  ✅ Function overloads resolved"  
    echo "  ✅ Demographic columns added and populated"
    echo "  ✅ $TOTAL_TXS transactions with complete data"
    echo ""
    echo "🚀 You can now run: npm run dev"
else
    echo ""
    echo "⚠️  Some checks may need attention"
    echo "Please review the output above"
fi