# 🚀 Scout MVP - One-Command Database Fix

## Quick Start (30 seconds)

1. **Set your database URL:**
   ```bash
   export SUPABASE_DB_URL="postgres://postgres.jrxepdlkgdwwjxdeetmb:YOUR_PASSWORD@db.jrxepdlkgdwwjxdeetmb.supabase.co:5432/postgres"
   ```

2. **Run the fix:**
   ```bash
   ./fix_all.sh
   ```

That's it! ✅

## What This Fixes

- ❌ **Before**: "Cannot extract elements from scalar" errors
- ❌ **Before**: Missing customer_age and customer_gender columns
- ❌ **Before**: Function overload conflicts

- ✅ **After**: All demographics working
- ✅ **After**: 5000 transactions with age/gender data
- ✅ **After**: Row-Level Security enabled
- ✅ **After**: Consumer Insights page fully functional

## Full Example

```bash
# Clone the repo
git clone https://github.com/jgtolentino/scout-mvp.git
cd scout-mvp

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Fix the database (one command!)
export SUPABASE_DB_URL="postgres://postgres.jrxepdlkgdwwjxdeetmb:YOUR_PASSWORD@db.jrxepdlkgdwwjxdeetmb.supabase.co:5432/postgres"
./fix_all.sh

# Start the app
npm run dev
```

## Troubleshooting

If you get a connection error:
1. Check your password is correct
2. Make sure to escape special characters in the password
3. Try the direct connection format (port 5432, not 6543)

## Manual Alternative

If the script doesn't work, you can still:
1. Go to https://supabase.com/dashboard/project/jrxepdlkgdwwjxdeetmb/sql/new
2. Copy the SQL from `QUICK_FIX_GUIDE.md`
3. Click "Run"

## Success Indicators

After running, you should see:
```
✅ All fixes applied successfully!

Your database now has:
  ✅ Fixed function overloads
  ✅ Added demographic columns
  ✅ Row-Level Security enabled
  ✅ 5000 transactions with age/gender data
```