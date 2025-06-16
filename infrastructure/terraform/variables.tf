variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "service_name" {
  description = "Service name prefix"
  type        = string
  default     = "scout-analytics"
}

variable "retailbot_image" {
  description = "Docker image for RetailBot API"
  type        = string
}

variable "dashboard_image" {
  description = "Docker image for Dashboard"
  type        = string
}

variable "database_username" {
  description = "RDS master username"
  type        = string
  sensitive   = true
}

variable "database_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "The name of the PostgreSQL database."
  type        = string
  default     = "scout_analytics"
}

variable "db_username" {
  description = "The username for the PostgreSQL database."
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "The password for the PostgreSQL database."
  type        = string
  sensitive   = true
}

variable "azure_openai_key" {
  description = "The API key for Azure OpenAI service."
  type        = string
  sensitive   = true
}

variable "azure_region" {
  description = "The Azure region to deploy resources (e.g., Southeast Asia, East US)."
  type        = string
  default     = "southeastasia"
}

variable "azure_subscription_id" {
  description = "The Azure Subscription ID."
  type        = string
  sensitive   = true
}

variable "azure_tenant_id" {
  description = "The Azure Tenant ID for authentication."
  type        = string
  sensitive   = true
}

variable "azure_client_id" {
  description = "The Azure Client ID (Application ID) for the Service Principal."
  type        = string
  sensitive   = true
}

variable "azure_client_secret" {
  description = "The Azure Client Secret for the Service Principal."
  type        = string
  sensitive   = true
}

variable "resource_group_name" {
  description = "The name of the Azure Resource Group to deploy all resources into."
  type        = string
  default     = "scout-analytics-prod-rg"
}

variable "service_name_prefix" {
  description = "A prefix for all Azure resources to ensure uniqueness and identification."
  type        = string
  default     = "scoutprod"
}

variable "retailbot_image" {
  description = "Docker image for RetailBot API from Azure Container Registry."
  type        = string
}

variable "dashboard_image" {
  description = "Docker image for Dashboard from Azure Container Registry."
  type        = string
}

variable "postgresql_admin_username" {
  description = "Admin username for Azure PostgreSQL."
  type        = string
}

variable "postgresql_admin_password" {
  description = "Admin password for Azure PostgreSQL."
  type        = string
  sensitive   = true
}

variable "postgresql_database_name" {
  description = "The name of the PostgreSQL database within Azure PostgreSQL."
  type        = string
  default     = "scoutdb"
}

variable "adls2_container_name_raw" {
  description = "Name of the ADLS2 container for raw data."
  type        = string
  default     = "raw-data"
}

variable "adls2_container_name_processed" {
  description = "Name of the ADLS2 container for processed data/insights."
  type        = string
  default     = "processed-insights"
}

variable "azure_openai_resource_name" {
  description = "The name of the Azure OpenAI resource."
  type        = string
}

variable "azure_openai_deployment_name" {
  description = "The name of the Azure OpenAI deployment (e.g., gpt-4-turbo)."
  type        = string
}

variable "azure_openai_api_key" {
  description = "API Key for Azure OpenAI service."
  type        = string
  sensitive   = true
} 