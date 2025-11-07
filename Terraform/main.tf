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

#  3️⃣ Firewall Rules
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

#  4️⃣ GKE Cluster
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
#  5️⃣ Node Pool
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

