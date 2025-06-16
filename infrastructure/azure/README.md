# Scout Analytics Azure Infrastructure

This directory contains the Terraform configuration for the Scout Analytics Azure infrastructure. The infrastructure is designed to be compliant with Philippine data residency requirements and follows Azure best practices for security and scalability.

## Infrastructure Components

### Core Services
- **PostgreSQL Flexible Server**: Primary database with private endpoint
- **Azure Data Lake Storage**: Data storage with geo-replication
- **Azure OpenAI**: AI services with network isolation
- **Azure Key Vault**: Secrets management
- **Azure Data Factory**: ETL processes

### Networking
- Virtual Network with three subnets:
  - Data subnet (10.0.1.0/24)
  - App subnet (10.0.2.0/24)
  - AI subnet (10.0.3.0/24)
- Network Security Groups for each subnet
- Private DNS Zones for all services
- Service endpoints for Azure services

### Monitoring & Logging
- Application Insights
- Log Analytics Workspace
- Metric Alerts for:
  - Database CPU/Memory
  - Storage Errors
  - Backup Failures
- Custom Dashboard

### Backup & Disaster Recovery
- Azure Backup Vault
- Daily/Weekly/Monthly backup policies
- Geo-redundant storage
- Point-in-Time Restore for database
- Disaster Recovery Plan

## Prerequisites

1. Azure CLI installed and configured
2. Terraform v1.0.0 or later
3. Azure subscription with appropriate permissions
4. Required environment variables:
   - `ARM_SUBSCRIPTION_ID`
   - `ARM_TENANT_ID`
   - `ARM_CLIENT_ID`
   - `ARM_CLIENT_SECRET`

## Deployment

1. Initialize Terraform:
   ```bash
   terraform init
   ```

2. Create a `terraform.tfvars` file from the example:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

3. Update the variables in `terraform.tfvars` with your values

4. Plan the deployment:
   ```bash
   terraform plan -out scout_azure_ph.plan
   ```

5. Apply the configuration:
   ```bash
   terraform apply scout_azure_ph.plan
   ```

## Data Migration

Use the provided migration script to transfer existing data:

```bash
./migrate.sh
```

The script will:
1. Initialize and apply Terraform configuration
2. Export Supabase migrations
3. Upload files to ADLS2
4. Maintain file organization
5. Preserve data residency in the Philippines

## Security

- All services are deployed with private endpoints
- Network security groups restrict access
- Key Vault for secrets management
- TLS 1.2 enforced
- Regular security updates
- Compliance with Philippine data residency

## Monitoring

Access the monitoring dashboard at:
```
https://portal.azure.com/#@${ARM_TENANT_ID}/resource/subscriptions/${ARM_SUBSCRIPTION_ID}/resourceGroups/scout-analytics-${environment}-rg/providers/microsoft.portal/dashboards/scout-dashboard-${environment}
```

## Backup & Recovery

- Daily backups at 23:00
- 7-day retention for daily backups
- 4-week retention for weekly backups
- 12-month retention for monthly backups
- 3-year retention for yearly backups
- Geo-redundant storage for critical data

## Maintenance

Regular maintenance tasks:
1. Review and update security groups
2. Monitor backup success rates
3. Check alert configurations
4. Update TLS certificates
5. Review access policies

## Support

For infrastructure support:
1. Check Azure Monitor for alerts
2. Review Log Analytics for issues
3. Contact Azure support if needed
4. Document all changes in the change log 