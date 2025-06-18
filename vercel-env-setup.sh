#!/bin/bash
# Scout Analytics v3 - Vercel Environment Variables Setup
# This script sets up all required environment variables for production deployment

echo "🚀 Setting up Scout Analytics v3 environment variables for Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm install -g vercel"
    exit 1
fi

# Set production environment variables
echo "📋 Setting up production environment variables..."

# Database Configuration
vercel env add VITE_DB_PROVIDER production <<< "supabase"
echo "✅ Database provider set to Supabase (default)"

# Supabase Configuration (you'll need to replace these with actual values)
echo "📝 Setting up Supabase configuration..."
echo "⚠️  Please replace these placeholders with your actual Supabase credentials:"

read -p "Enter your Supabase URL: " SUPABASE_URL
vercel env add VITE_SUPABASE_URL production <<< "$SUPABASE_URL"

read -p "Enter your Supabase Anon Key: " SUPABASE_KEY
vercel env add VITE_SUPABASE_ANON_KEY production <<< "$SUPABASE_KEY"

# Azure OpenAI Configuration (for AI features)
echo "🤖 Setting up Azure OpenAI configuration..."
read -p "Enter your Azure OpenAI Endpoint: " AZURE_ENDPOINT
vercel env add AZURE_OPENAI_ENDPOINT production <<< "$AZURE_ENDPOINT"

read -p "Enter your Azure OpenAI Key: " AZURE_KEY
vercel env add AZURE_OPENAI_KEY production <<< "$AZURE_KEY"

vercel env add AZURE_OPENAI_DEPLOYMENT production <<< "gpt-4o"
vercel env add AZURE_OPENAI_API_VERSION production <<< "2024-05-01-preview"

# Production flags
vercel env add NODE_ENV production <<< "production"
vercel env add VITE_APP_ENV production <<< "production"
vercel env add VITE_SCOUT_DEMO production <<< "off"

echo "✅ Environment variables configured for production!"
echo ""
echo "📋 Summary of configured variables:"
echo "   - VITE_DB_PROVIDER: supabase"
echo "   - VITE_SUPABASE_URL: $SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY: [hidden]"
echo "   - AZURE_OPENAI_ENDPOINT: $AZURE_ENDPOINT"
echo "   - AZURE_OPENAI_KEY: [hidden]"
echo "   - AZURE_OPENAI_DEPLOYMENT: gpt-4o"
echo "   - NODE_ENV: production"
echo ""
echo "🚀 Ready for deployment! Run 'vercel --prod' to deploy."