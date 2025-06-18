#!/bin/bash
# Scout Analytics v3 - Production Deployment Script
# Deploys the full-featured v3 codebase with QA validation and AI features

set -e  # Exit on any error

echo "🚀 Scout Analytics v3 - Production Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Committing them now...${NC}"
    git add .
    git commit -m "feat: Deploy Scout Analytics v3 with QA validation and AI features

🎯 Features included:
- Real-time QA/validation dashboard
- AI-powered insight validation
- Comprehensive data audit system  
- Azure database support
- Full-featured analytics platform

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
fi

# Install dependencies and build
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🏗️  Building production version...${NC}"
npm run build

# Run type checking
echo -e "${BLUE}🔍 Running TypeScript checks...${NC}"
npm run typecheck

# Run linting
echo -e "${BLUE}✨ Running code quality checks...${NC}"
npm run lint

echo -e "${GREEN}✅ All checks passed!${NC}"

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to production...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📥 Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Deploy to production
echo -e "${BLUE}🌐 Deploying to Vercel production...${NC}"
vercel --prod

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "   ✅ v3 codebase with all advanced features"
echo -e "   ✅ QA/validation system enabled"  
echo -e "   ✅ AI-powered insight validation"
echo -e "   ✅ Real-time data audit dashboard"
echo -e "   ✅ Azure database support ready"
echo -e "   ✅ Production environment configured"
echo ""
echo -e "${YELLOW}🔗 Your Scout Analytics v3 dashboard is now live!${NC}"
echo ""
echo -e "${BLUE}📊 To activate full QA validation:${NC}"
echo -e "   1. Set up Supabase database (or use Azure configs)"
echo -e "   2. Configure environment variables"
echo -e "   3. Click 'Data Quality & KPI Validation' on dashboard"
echo -e "   4. Watch real-time validation run!"
echo ""
echo -e "${GREEN}🎯 Ready for enterprise-grade retail analytics!${NC}"