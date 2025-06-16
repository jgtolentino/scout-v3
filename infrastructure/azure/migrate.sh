#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
for cmd in az terraform psql; do
    if ! command_exists $cmd; then
        log "Error: $cmd is required but not installed"
        exit 1
    fi
done

# Initialize Terraform
log "Initializing Terraform..."
terraform init -backend-config="storage_account_name=scouttfstateph" \
              -backend-config="access_key=$AZURE_STORAGE_KEY"

# Plan Terraform changes
log "Planning Terraform changes..."
terraform plan -out scout_azure_ph.plan

# Apply Terraform changes
log "Applying Terraform changes..."
terraform apply scout_azure_ph.plan

# Get PostgreSQL connection details
PG_HOST=$(terraform output -raw postgres_host)
PG_USER=$DB_ADMIN_USER
PG_PASS=$DB_ADMIN_PASSWORD
PG_DB=$POSTGRESQL_DATABASE_NAME

# Export Supabase migrations
log "Exporting Supabase migrations..."
for migration in supabase/migrations/*.sql; do
    log "Processing migration: $migration"
    psql "postgres://$PG_USER:$PG_PASS@$PG_HOST/$PG_DB" -f "$migration"
done

# Upload files to ADLS2
log "Uploading files to Azure Data Lake Storage..."

# Function to upload directory to ADLS2
upload_to_adls() {
    local source_dir=$1
    local container=$2
    local pattern=$3

    log "Uploading $source_dir to $container..."
    find "$source_dir" -type f -name "$pattern" -exec az storage blob upload-batch \
        --account-name "$(terraform output -raw adls2_name)" \
        --auth-mode login \
        --destination "$container" \
        --source "$source_dir" \
        --pattern "$pattern" \;
}

# Upload various file types
upload_to_adls "supabase/migrations" "supabase-migrations" "*.sql"
upload_to_adls "monitoring" "monitoring-dashboards" "*.json"
upload_to_adls "." "fmcg-datasets" "fmcg_dataset_*.json"
upload_to_adls "retailbot" "retailbot-data" "*"
upload_to_adls "agents" "ai-agent-profiles" "*.yaml"
upload_to_adls ".vercel" "vercel-deployments" "*"
upload_to_adls ".github/workflows" "cicd-artifacts" "*.yml"
upload_to_adls "e2e" "e2e-tests" "*"
upload_to_adls "." "test-results" "*.json"
upload_to_adls "." "audit-logs" "*.json"
upload_to_adls "docs" "documentation" "*"
upload_to_adls "powerbi-output" "powerbi-reports" "*"
upload_to_adls "." "lighthouse-reports" "*.html"
upload_to_adls "e2e" "playwright-tests" "*"
upload_to_adls "." "vitest-results" "*.json"
upload_to_adls "." "eslint-reports" "*.json"
upload_to_adls "dist" "typescript-builds" "*"
upload_to_adls "dist" "tailwind-builds" "*"
upload_to_adls "dist" "postcss-builds" "*"
upload_to_adls "dist" "vite-builds" "*"
upload_to_adls "node_modules" "node-modules" "*"
upload_to_adls "." "package-json" "package*.json"
upload_to_adls "." "gitignore" ".gitignore"
upload_to_adls "." "env-files" ".env*"
upload_to_adls "." "readme-files" "README*.md"
upload_to_adls "." "markdown-files" "*.md"
upload_to_adls "." "json-files" "*.json"
upload_to_adls "." "sql-files" "*.sql"
upload_to_adls "." "python-files" "*.py"
upload_to_adls "." "typescript-files" "*.ts"
upload_to_adls "." "javascript-files" "*.js"
upload_to_adls "." "css-files" "*.css"
upload_to_adls "." "html-files" "*.html"
upload_to_adls "." "image-files" "*.{png,jpg,jpeg,gif,svg}"
upload_to_adls "." "font-files" "*.{ttf,otf,woff,woff2}"
upload_to_adls "." "video-files" "*.{mp4,webm,mov}"
upload_to_adls "." "audio-files" "*.{mp3,wav,ogg}"
upload_to_adls "." "pdf-files" "*.pdf"
upload_to_adls "." "zip-files" "*.zip"

# Upload remaining files
log "Uploading remaining files..."
az storage blob upload-batch \
    --account-name "$(terraform output -raw adls2_name)" \
    --auth-mode login \
    --destination "other-files" \
    --source "."

log "Migration completed successfully!" 