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

