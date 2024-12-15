resource "azurerm_resource_group" "site" {
  name     = "siobhanoca"
  location = "eastus2"
}

resource "azurerm_static_web_app" "siobhanoca" {
  name                = "siobhanoca"
  resource_group_name = azurerm_resource_group.site.name
  location            = azurerm_resource_group.site.location
}