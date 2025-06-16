# Backup Vault
resource "azurerm_backup_vault" "scout_backup" {
  name                = "scout-backup-${var.environment}"
  resource_group_name = azurerm_resource_group.scout_rg.name
  location            = azurerm_resource_group.scout_rg.location
  sku                 = "Standard"

  tags = {
    Environment = var.environment
    Project     = "Scout Analytics"
  }
}

# Backup Policy
resource "azurerm_backup_policy_vm" "scout_backup_policy" {
  name                = "scout-backup-policy-${var.environment}"
  resource_group_name = azurerm_resource_group.scout_rg.name
  recovery_vault_name = azurerm_backup_vault.scout_backup.name

  backup {
    frequency = "Daily"
    time      = "23:00"
  }

  retention_daily {
    count = 7
  }

  retention_weekly {
    count    = 4
    weekdays = ["Sunday"]
  }

  retention_monthly {
    count    = 12
    weekdays = ["Sunday"]
    weeks    = ["First"]
  }
}

# Geo-replication for Storage
resource "azurerm_storage_account" "scout_storage_secondary" {
  name                     = "scoutstorage${var.environment}secondary"
  resource_group_name      = azurerm_resource_group.scout_rg.name
  location                 = "southeastasia"  # Secondary region
  account_tier             = "Standard"
  account_replication_type = "GRS"  # Geo-redundant storage
  min_tls_version         = "TLS1_2"

  tags = {
    Environment = var.environment
    Project     = "Scout Analytics"
  }
}

# Database Backup Configuration
resource "azurerm_postgresql_flexible_server_configuration" "backup_retention" {
  name      = "backup_retention_days"
  server_id = azurerm_postgresql_flexible_server.scout_db.id
  value     = "35"  # 5 weeks of backups
}

# Point-in-Time Restore Configuration
resource "azurerm_postgresql_flexible_server_configuration" "pitr" {
  name      = "point_in_time_restore"
  server_id = azurerm_postgresql_flexible_server.scout_db.id
  value     = "on"
}

# Disaster Recovery Plan
resource "azurerm_site_recovery_replication_policy" "scout_dr_policy" {
  name                                                 = "scout-dr-policy-${var.environment}"
  resource_group_name                                  = azurerm_resource_group.scout_rg.name
  recovery_vault_name                                  = azurerm_backup_vault.scout_backup.name
  recovery_point_retention_in_minutes                  = 1440  # 24 hours
  application_consistent_snapshot_frequency_in_minutes = 60    # 1 hour
}

# Backup Monitoring
resource "azurerm_monitor_metric_alert" "backup_failure" {
  name                = "backup-failure-alert-${var.environment}"
  resource_group_name = azurerm_resource_group.scout_rg.name
  scopes              = [azurerm_backup_vault.scout_backup.id]
  description         = "Backup job failed"
  severity            = 1

  criteria {
    metric_namespace = "Microsoft.RecoveryServices/vaults"
    metric_name      = "BackupHealthEvent"
    aggregation      = "Count"
    operator         = "GreaterThan"
    threshold        = 0
    window_size      = "PT5M"
    evaluation_frequency = "PT1M"
  }

  action {
    action_group_id = azurerm_monitor_action_group.scout_alerts.id
  }
}

# Backup Retention Policy
resource "azurerm_backup_policy_file_share" "scout_retention" {
  name                = "scout-retention-policy-${var.environment}"
  resource_group_name = azurerm_resource_group.scout_rg.name
  recovery_vault_name = azurerm_backup_vault.scout_backup.name

  backup {
    frequency = "Daily"
    time      = "23:00"
  }

  retention_daily {
    count = 7
  }

  retention_weekly {
    count    = 4
    weekdays = ["Sunday"]
  }

  retention_monthly {
    count    = 12
    weekdays = ["Sunday"]
    weeks    = ["First"]
  }

  retention_yearly {
    count    = 3
    months   = ["January"]
    weekdays = ["Sunday"]
    weeks    = ["First"]
  }
} 