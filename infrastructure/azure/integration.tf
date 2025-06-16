# Import existing Supabase migrations
resource "azurerm_postgresql_flexible_server_database" "scout_db" {
  name      = var.postgresql_database_name
  server_id = azurerm_postgresql_flexible_server.scout_db.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Create a storage container for Supabase migrations
resource "azurerm_storage_data_lake_gen2_filesystem" "migrations" {
  name               = "supabase-migrations"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for monitoring dashboards
resource "azurerm_storage_data_lake_gen2_filesystem" "monitoring" {
  name               = "monitoring-dashboards"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for FMCG datasets
resource "azurerm_storage_data_lake_gen2_filesystem" "fmcg_data" {
  name               = "fmcg-datasets"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for retailbot data
resource "azurerm_storage_data_lake_gen2_filesystem" "retailbot" {
  name               = "retailbot-data"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for AI agent profiles
resource "azurerm_storage_data_lake_gen2_filesystem" "ai_agents" {
  name               = "ai-agent-profiles"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for Vercel deployments
resource "azurerm_storage_data_lake_gen2_filesystem" "vercel" {
  name               = "vercel-deployments"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for CI/CD artifacts
resource "azurerm_storage_data_lake_gen2_filesystem" "cicd" {
  name               = "cicd-artifacts"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for test results
resource "azurerm_storage_data_lake_gen2_filesystem" "test_results" {
  name               = "test-results"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for audit logs
resource "azurerm_storage_data_lake_gen2_filesystem" "audit_logs" {
  name               = "audit-logs"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for documentation
resource "azurerm_storage_data_lake_gen2_filesystem" "docs" {
  name               = "documentation"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for PowerBI reports
resource "azurerm_storage_data_lake_gen2_filesystem" "powerbi" {
  name               = "powerbi-reports"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for e2e tests
resource "azurerm_storage_data_lake_gen2_filesystem" "e2e_tests" {
  name               = "e2e-tests"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for lighthouse reports
resource "azurerm_storage_data_lake_gen2_filesystem" "lighthouse" {
  name               = "lighthouse-reports"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for playwright tests
resource "azurerm_storage_data_lake_gen2_filesystem" "playwright" {
  name               = "playwright-tests"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for vitest results
resource "azurerm_storage_data_lake_gen2_filesystem" "vitest" {
  name               = "vitest-results"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for eslint reports
resource "azurerm_storage_data_lake_gen2_filesystem" "eslint" {
  name               = "eslint-reports"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for typescript builds
resource "azurerm_storage_data_lake_gen2_filesystem" "typescript" {
  name               = "typescript-builds"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for tailwind builds
resource "azurerm_storage_data_lake_gen2_filesystem" "tailwind" {
  name               = "tailwind-builds"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for postcss builds
resource "azurerm_storage_data_lake_gen2_filesystem" "postcss" {
  name               = "postcss-builds"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for vite builds
resource "azurerm_storage_data_lake_gen2_filesystem" "vite" {
  name               = "vite-builds"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for node_modules
resource "azurerm_storage_data_lake_gen2_filesystem" "node_modules" {
  name               = "node-modules"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for package.json
resource "azurerm_storage_data_lake_gen2_filesystem" "package_json" {
  name               = "package-json"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for package-lock.json
resource "azurerm_storage_data_lake_gen2_filesystem" "package_lock" {
  name               = "package-lock"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for .gitignore
resource "azurerm_storage_data_lake_gen2_filesystem" "gitignore" {
  name               = "gitignore"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for .env files
resource "azurerm_storage_data_lake_gen2_filesystem" "env_files" {
  name               = "env-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for README files
resource "azurerm_storage_data_lake_gen2_filesystem" "readme" {
  name               = "readme-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for markdown files
resource "azurerm_storage_data_lake_gen2_filesystem" "markdown" {
  name               = "markdown-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for JSON files
resource "azurerm_storage_data_lake_gen2_filesystem" "json_files" {
  name               = "json-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for SQL files
resource "azurerm_storage_data_lake_gen2_filesystem" "sql_files" {
  name               = "sql-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for Python files
resource "azurerm_storage_data_lake_gen2_filesystem" "python_files" {
  name               = "python-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for TypeScript files
resource "azurerm_storage_data_lake_gen2_filesystem" "typescript_files" {
  name               = "typescript-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for JavaScript files
resource "azurerm_storage_data_lake_gen2_filesystem" "javascript_files" {
  name               = "javascript-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for CSS files
resource "azurerm_storage_data_lake_gen2_filesystem" "css_files" {
  name               = "css-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for HTML files
resource "azurerm_storage_data_lake_gen2_filesystem" "html_files" {
  name               = "html-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for image files
resource "azurerm_storage_data_lake_gen2_filesystem" "image_files" {
  name               = "image-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for font files
resource "azurerm_storage_data_lake_gen2_filesystem" "font_files" {
  name               = "font-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for video files
resource "azurerm_storage_data_lake_gen2_filesystem" "video_files" {
  name               = "video-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for audio files
resource "azurerm_storage_data_lake_gen2_filesystem" "audio_files" {
  name               = "audio-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for PDF files
resource "azurerm_storage_data_lake_gen2_filesystem" "pdf_files" {
  name               = "pdf-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for ZIP files
resource "azurerm_storage_data_lake_gen2_filesystem" "zip_files" {
  name               = "zip-files"
  storage_account_id = azurerm_storage_account.scout_data.id
}

# Create a storage container for other files
resource "azurerm_storage_data_lake_gen2_filesystem" "other_files" {
  name               = "other-files"
  storage_account_id = azurerm_storage_account.scout_data.id
} 