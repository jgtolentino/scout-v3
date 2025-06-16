terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "scout-tfstate-rg"
    storage_account_name = "scouttfstateprod"
    container_name       = "tfstate"
    key                  = "production.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
  environment = "public"
  subscription_id = var.azure_subscription_id
  tenant_id       = var.azure_tenant_id
  client_id       = var.azure_client_id
  client_secret   = var.azure_client_secret

  default_tags {
    tags = {
      Project     = "Scout Analytics"
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
} 