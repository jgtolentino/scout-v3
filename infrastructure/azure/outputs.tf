output "postgres_host" {
  value = azurerm_postgresql_flexible_server.scout_db.fqdn
}

output "adls2_name" {
  value = azurerm_storage_account.scout_data.name
}

output "openai_endpoint" {
  value = azurerm_cognitive_account.scout_ai.endpoint
}

output "key_vault_name" {
  value = azurerm_key_vault.scout_secrets.name
}

output "data_factory_name" {
  value = azurerm_data_factory.scout_pipelines.name
}

output "app_insights_key" {
  value     = azurerm_application_insights.scout_monitoring.instrumentation_key
  sensitive = true
} 