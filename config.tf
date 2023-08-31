terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
    }
  }
}

provider "google" {
  project     = "percy-k8s-csci5709"
  region      = "us-central1-c"
}

resource "google_container_cluster" "my_cluster" {
  name               = "k8s-standard-cluster"
  location           = "us-central1-c"
  remove_default_node_pool = false
  initial_node_count = 1
  node_config {
    machine_type    = "e2-small"
    preemptible     = false
    disk_size_gb    = 10
    disk_type       = "pd-standard"
    image_type      = "COS_CONTAINERD"
  }
}