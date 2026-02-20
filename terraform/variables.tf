##############################################
# StyleMatch — Variables
##############################################

variable "aws_region" {
  description = "Región AWS para desplegar la infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto, usado como prefijo en recursos"
  type        = string
  default     = "stylematch"
}

variable "serpapi_key" {
  description = "API key de SerpAPI para búsqueda de productos"
  type        = string
  sensitive   = true # No se muestra en logs ni en plan output
}

variable "environment" {
  description = "Entorno de despliegue (production, staging, dev)"
  type        = string
  default     = "production"
}
