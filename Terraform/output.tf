output "vpc_name" {
  value = google_compute_network.bugtracker_vpc.name
}

output "public_subnet_cidr" {
  value = google_compute_subnetwork.public_subnet.ip_cidr_range
}

output "gke_cluster_name" {
  value = google_container_cluster.bugtracker_cluster.name
}

output "region" {
  value = var.region
}

output "get_credentials_command" {
  value = "gcloud container clusters get-credentials ${google_container_cluster.bugtracker_cluster.name} --region ${var.region} --project ${var.project_id}"
}

output "cloud_sql_instance_connection_name" {
  value = google_sql_database_instance.bugtracker.connection_name
}

output "cloud_sql_private_ip" {
  value = google_sql_database_instance.bugtracker.private_ip_address
}

output "cloud_sql_database" {
  value = google_sql_database.bugtracker_app_db.name
}

output "cloud_sql_user" {
  value = google_sql_user.bugtracker_app_user.name
}
