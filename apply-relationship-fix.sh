#!/bin/bash

echo "🔧 Applying FMCG Relationship Fix to Production"
echo "=============================================="

# Check if we have the Supabase project details
if [ -z "$SUPABASE_PROJECT_ID" ]; then
  SUPABASE_PROJECT_ID="jrxepdlkgdwwjxdeetmb"
fi

echo ""
echo "📋 This script will fix the following error:"
echo "   'Could not find a relationship between transactions_fmcg and transaction_items_fmcg'"
echo ""
echo "🚀 To apply the fix:"
echo ""
echo "1. Go to your Supabase SQL Editor:"
echo "   https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql"
echo ""
echo "2. Copy and paste the contents of: fix-fmcg-relationships.sql"
echo ""
echo "3. Click 'Run' to execute the SQL"
echo ""
echo "4. Wait 30 seconds for PostgREST schema cache to refresh"
echo ""
echo "5. Test the fix with this query:"
echo "   SELECT * FROM transactions_fmcg LIMIT 1;"
echo ""
echo "6. Hard refresh the dashboard: https://scout-mvp.vercel.app"
echo ""

# Optionally apply via CLI if Supabase CLI is configured
if command -v supabase >/dev/null 2>&1; then
  echo "📦 Detected Supabase CLI. Attempting to apply fix..."
  echo ""
  
  # Try to apply the migration
  if [ -f "fix-fmcg-relationships.sql" ]; then
    echo "Running: supabase db push --db-url <your-db-url>"
    echo "(You'll need to provide your database URL)"
    echo ""
    echo "Or use: psql <DATABASE_URL> < fix-fmcg-relationships.sql"
  fi
else
  echo "💡 Tip: Install Supabase CLI for automated migrations:"
  echo "   npm install -g supabase"
fi

echo ""
echo "🎯 Expected Result After Fix:"
echo "   - Nested queries will work: transactions_fmcg { *, transaction_items_fmcg(*) }"
echo "   - Dashboard will show ₱1.21M revenue instead of errors"
echo "   - Chat AI will have access to real transaction data"