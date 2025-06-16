# Quick Start Guide

Get Scout Analytics MVP running locally in 5 minutes.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL client (psql)
- Supabase account

## Setup Steps

### 1. Clone & Install

```bash
git clone https://github.com/jgtolentino/scout-mvp.git
cd scout-mvp
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Setup Database (Automated)

```bash
export SUPABASE_DB_URL="postgres://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
./fix_all.sh
./verify_fix.sh
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## What You'll See

- **Overview**: Executive dashboard with KPIs
- **Transaction Trends**: Time-based analytics
- **Product Mix**: Category and brand performance  
- **Consumer Insights**: Demographics and behavior

## Next Steps

- [Read the full installation guide](./installation.md)
- [Explore the development workflow](./development.md)
- [Learn about testing](./testing.md)