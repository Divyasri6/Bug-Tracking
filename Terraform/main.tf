###########################################################
#  Terraform Setup: Bug Tracker Infrastructure on GCP
###########################################################

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.4.0"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

data "google_client_config" "default" {}

provider "kubernetes" {
  host                   = "https://${google_container_cluster.bugtracker_cluster.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(google_container_cluster.bugtracker_cluster.master_auth[0].cluster_ca_certificate)
}

###########################################################
#  1️⃣ VPC Network
###########################################################
resource "google_compute_network" "bugtracker_vpc" {
  name                    = "bugtracker-vpc"
  auto_create_subnetworks = false
}

###########################################################
#  2️⃣ Subnets
###########################################################
resource "google_compute_subnetwork" "public_subnet" {
  name          = "public-subnet"
  ip_cidr_range = "10.10.1.0/24"
  region        = var.region
  network       = google_compute_network.bugtracker_vpc.id
}

resource "google_compute_subnetwork" "private_subnet" {
  name          = "private-subnet"
  ip_cidr_range = "10.10.2.0/24"
  region        = var.region
  network       = google_compute_network.bugtracker_vpc.id
}

#  3️⃣ Private Service Connect Range for Cloud SQL
###########################################################
resource "google_compute_global_address" "cloudsql_private_range" {
  name          = "bugtracker-cloudsql-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.bugtracker_vpc.self_link
}

resource "google_service_networking_connection" "cloudsql_vpc_connection" {
  network                 = google_compute_network.bugtracker_vpc.self_link
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.cloudsql_private_range.name]
}

#  4️⃣ Firewall Rules
###########################################################
resource "google_compute_firewall" "allow_http_https_ssh" {
  name    = "allow-http-https-ssh"
  network = google_compute_network.bugtracker_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080", "5001", "5173"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["bugtracker-server"]
}

#  5️⃣ Cloud SQL for PostgreSQL
###########################################################
resource "google_sql_database_instance" "bugtracker" {
  name                = var.db_instance_name
  database_version    = "POSTGRES_14"
  region              = var.region
  deletion_protection = false

  depends_on = [google_service_networking_connection.cloudsql_vpc_connection]

  settings {
    tier              = "db-custom-1-3840"
    availability_type = "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = 20

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.bugtracker_vpc.self_link
    }

    backup_configuration {
      enabled = true
    }
  }
}

resource "google_sql_database" "bugtracker_app_db" {
  name     = var.db_database_name
  instance = google_sql_database_instance.bugtracker.name
}

resource "google_sql_user" "bugtracker_app_user" {
  instance = google_sql_database_instance.bugtracker.name
  name     = var.db_user
  password = var.db_password
}

#  6️⃣ GKE Cluster
###########################################################
resource "google_container_cluster" "bugtracker_cluster" {
  name               = "bugtracker-cluster"
  location           = var.zone
  network            = google_compute_network.bugtracker_vpc.id
  subnetwork         = google_compute_subnetwork.public_subnet.id
  remove_default_node_pool = true
  initial_node_count = 1

  ip_allocation_policy {}
}

###########################################################
#  7️⃣ Node Pool
###########################################################
resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-node-pool"
  location   = var.zone
  cluster    = google_container_cluster.bugtracker_cluster.name

  node_config {
    preemptible  = false
    machine_type = "e2-medium"

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    tags = ["bugtracker-server"]
  }

  initial_node_count = 2
}

#  8️⃣ Kubernetes Secret for Backend DB Credentials
###########################################################
resource "kubernetes_secret" "backend_db_credentials" {
  metadata {
    name      = "backend-db-credentials"
    namespace = "default"
  }

  data = {
    DB_URL      = "jdbc:postgresql://${google_sql_database_instance.bugtracker.private_ip_address}:5432/${var.db_database_name}"
    DB_USERNAME = var.db_user
    DB_PASSWORD = var.db_password
  }

  depends_on = [
    google_sql_database_instance.bugtracker,
    google_container_node_pool.primary_nodes
  ]
}

