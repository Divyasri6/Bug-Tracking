variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "The region to deploy resources in"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The zone for zonal resources (e.g., GKE cluster)"
  type        = string
  default     = "us-central1-a"
}

variable "db_instance_name" {
  description = "Cloud SQL instance name"
  type        = string
  default     = "bugtracker-db"
}

variable "db_database_name" {
  description = "Primary application database name"
  type        = string
  default     = "bugtracker"
}

variable "db_user" {
  description = "Database user for application access"
  type        = string
  default     = "bugapp"
}

variable "db_password" {
  description = "Password for the application database user"
  type        = string
  default     = "bugapp-pass"
  sensitive   = true
}

