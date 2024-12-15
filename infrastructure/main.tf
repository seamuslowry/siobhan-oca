terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }

    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }

  # the storage container for this backend is not managed but lives under the same subscription
  backend "azurerm" {
      resource_group_name  = "state"
      storage_account_name = "siteinfrastate"
      container_name       = "tfstate"
      key                  = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

provider "github" {}