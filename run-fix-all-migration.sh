#!/bin/bash

echo "🚀 Running Fix-All Migration for Scout MVP"
echo "=========================================="

# Set database connection details
PROJECT_REF="jrxepdlkgdwwjxdeetmb"
DB_PASSWORD="R@nd0mPA$\$2025!"

echo ""
echo "📝 This script will:"
echo "  1. Fix function overloads"
echo "  2. Add missing columns (customer_age, customer_gender, alias)"
echo "  3. Enable Row-Level Security"
echo "  4. Populate demographic data"
echo ""

# Option 1: Using Supabase CLI (if linked)
echo "🔧 Option 1: Using Supabase CLI"
echo "First, link your project if not already linked:"
echo "supabase link --project-ref $PROJECT_REF"
echo ""
echo "Then run migration:"
echo "supabase db push < fix_all_migration.sql"
echo ""

# Option 2: Using psql directly
echo "🔧 Option 2: Using psql directly"
echo "Run this command:"
cat << 'EOF'
psql "postgresql://postgres.jrxepdlkgdwwjxdeetmb:R@nd0mPA$$2025!@aws-0-us-west-1.pooler.supabase.com:6543/postgres" < fix_all_migration.sql
EOF

echo ""
echo "🔧 Option 3: Copy and paste into Supabase SQL Editor"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "2. Paste the contents of fix_all_migration.sql"
echo "3. Click 'Run'"
echo ""

# Option 4: Using node.js script
echo "🔧 Option 4: Using Node.js script"
cat > run-migration.js << 'EOJS'
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://jrxepdlkgdwwjxdeetmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTc4MTk3OSwiZXhwIjoyMDY1MzU3OTc5fQ.CaylOjytzlPkkL3KsZK6pCK5eJxx3BrqVr0cbzK90Jc';

console.log('🚀 Running migration via Supabase API...');
console.log('⚠️  Note: Complex DDL statements need to be run in SQL Editor');
console.log('');
console.log('Please use one of the other options above to run the full migration.');

// For now, just test the connection
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const { count } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
console.log(`✅ Connected! Found ${count} transactions`);
EOJS

echo "node run-migration.js"
echo ""

echo "✅ Choose one of the options above to run the migration"
echo ""
echo "After migration, verify with:"
echo "node test-fixed-functions.js"