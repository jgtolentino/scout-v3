#!/bin/bash
# Materialized View Refresh Scheduler Setup
# This script sets up automated refresh of materialized views

echo "🔄 Setting up materialized view refresh scheduler..."

# Method 1: Using Supabase Edge Function (Recommended)
echo "📦 Creating Supabase Edge Function for scheduling..."

mkdir -p supabase/functions/refresh-views

cat > supabase/functions/refresh-views/index.ts << 'EOF'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Call the refresh function
    const { data, error } = await supabase.rpc('schedule_refresh_materialized_views')
    
    if (error) {
      console.error('Refresh error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    console.log('Refresh result:', data)
    return new Response(JSON.stringify({ 
      success: true, 
      message: data,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (err) {
    console.error('Function error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
EOF

echo "✅ Edge function created"

# Method 2: GitHub Actions Workflow (Alternative)
echo "🔧 Creating GitHub Actions workflow..."

mkdir -p .github/workflows

cat > .github/workflows/refresh-materialized-views.yml << 'EOF'
name: Refresh Materialized Views

on:
  schedule:
    # Run every 5 minutes
    - cron: '*/5 * * * *'
  workflow_dispatch: # Allow manual triggering

jobs:
  refresh-views:
    runs-on: ubuntu-latest
    steps:
      - name: Refresh Materialized Views
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}' \
            "${{ secrets.SUPABASE_URL }}/functions/v1/refresh-views"
EOF

echo "✅ GitHub Actions workflow created"

# Method 3: Local cron setup (Development)
echo "⚙️ Creating local cron setup script..."

cat > refresh-views-cron.sh << 'EOF'
#!/bin/bash
# Local development cron script for refreshing materialized views

SUPABASE_URL="https://jrxepdlkgdwwjxdeetmb.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTc4MTk3OSwiZXhwIjoyMDY1MzU3OTc5fQ.CaylOjytzlPkkL3KsZK6pCK5eJxx3BrqVr0cbzK90Jc"

# Call the refresh function via HTTP
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/schedule_refresh_materialized_views" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}'

echo "Materialized views refresh completed at $(date)"
EOF

chmod +x refresh-views-cron.sh

echo "✅ Local cron script created"

# Method 4: Docker-based scheduler (Production)
echo "🐳 Creating Docker scheduler setup..."

cat > docker-compose.scheduler.yml << 'EOF'
version: '3.8'

services:
  scheduler:
    image: alpine:latest
    command: |
      sh -c "
        apk add --no-cache curl
        echo '*/5 * * * * curl -X POST -H \"Authorization: Bearer $$SUPABASE_SERVICE_KEY\" $$SUPABASE_URL/functions/v1/refresh-views' | crontab -
        crond -f
      "
    environment:
      - SUPABASE_URL=https://jrxepdlkgdwwjxdeetmb.supabase.co
      - SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTc4MTk3OSwiZXhwIjoyMDY1MzU3OTc5fQ.CaylOjytzlPkkL3KsZK6pCK5eJxx3BrqVr0cbzK90Jc
    restart: unless-stopped
EOF

echo "✅ Docker scheduler setup created"

echo ""
echo "🎯 Scheduler Setup Complete!"
echo ""
echo "Choose your deployment method:"
echo "1. 🚀 Supabase Edge Function (Recommended for production)"
echo "   - Deploy: supabase functions deploy refresh-views"
echo "   - Set up cron trigger in Supabase dashboard"
echo ""
echo "2. 🔧 GitHub Actions (Good for GitHub-hosted projects)"
echo "   - Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to repository secrets"
echo "   - Workflow will run automatically every 5 minutes"
echo ""
echo "3. 💻 Local Development"
echo "   - Run: ./refresh-views-cron.sh"
echo "   - Or add to local crontab: */5 * * * * /path/to/refresh-views-cron.sh"
echo ""
echo "4. 🐳 Docker Production"
echo "   - Run: docker-compose -f docker-compose.scheduler.yml up -d"
echo ""