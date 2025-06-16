output "vpc_id" {
  description = "The ID of the main VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets."
  value       = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster."
  value       = aws_ecs_cluster.main.name
}

output "supabase_db_endpoint" {
  description = "The endpoint of the Supabase RDS PostgreSQL database."
  value       = aws_db_instance.supabase_db.address
}

output "supabase_db_port" {
  description = "The port of the Supabase RDS PostgreSQL database."
  value       = aws_db_instance.supabase_db.port
}

output "static_assets_bucket_name" {
  description = "The name of the S3 bucket for static assets."
  value       = aws_s3_bucket.static_assets.id
} 