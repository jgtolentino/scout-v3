provider "aws" {
  region = var.aws_region
}

# --- VPC Network ---
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true

  tags = {
    Name = "scout-analytics-vpc"
  }
}

resource "aws_subnet" "public_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "scout-public-subnet-a"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "scout-public-subnet-b"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "scout-internet-gateway"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "scout-public-route-table"
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# --- Security Group for ALB and ECS ---
resource "aws_security_group" "alb" {
  name_prefix = "scout-alb-sg-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_tasks" {
  name_prefix = "scout-ecs-tasks-sg-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- S3 Bucket for static assets/data ---
resource "aws_s3_bucket" "static_assets" {
  bucket = "scout-analytics-static-assets-${var.environment}"

  tags = {
    Name        = "ScoutAnalyticsStaticAssets"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_acl" "static_assets_acl" {
  bucket = aws_s3_bucket.static_assets.id
  acl    = "private" # Or "public-read" if serving directly
}

# --- RDS PostgreSQL Database ---
resource "aws_db_instance" "supabase_db" {
  identifier        = "scout-analytics-supabase-db-${var.environment}"
  engine            = "postgres"
  engine_version    = "14.x" # Adjust as needed
  instance_class    = "db.t3.micro" # Adjust as needed
  allocated_storage = 20
  storage_type      = "gp2"
  db_name           = var.db_name
  username          = var.db_username
  password          = var.db_password
  port              = 5432
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot = true # For demo/dev, set to false for prod
  publicly_accessible = false # Set to true for easier access if needed for testing, but ideally false for prod
  multi_az = false # Set to true for prod

  subnet_group_name = aws_db_subnet_group.main.name

  tags = {
    Name        = "ScoutAnalyticsSupabaseDB"
    Environment = var.environment
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "scout-rds-sg-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id] # Allow ECS tasks to connect
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "main" {
  name_prefix = "scout-db-subnet-group-"
  subnet_ids  = [aws_subnet.public_a.id, aws_subnet.public_b.id] # For simplicity, using public. In prod, use private.

  tags = {
    Name = "ScoutAnalyticsDBSubnetGroup"
  }
}

# --- Secrets Manager ---
resource "aws_secretsmanager_secret" "supabase_db_credentials" {
  name = "scout-analytics/${var.environment}/supabase-db-credentials"
  description = "Credentials for the Supabase PostgreSQL database."
  kms_key_id = "alias/aws/secretsmanager" # Or your custom KMS key

  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    dbname   = var.db_name
    host     = aws_db_instance.supabase_db.address
    port     = aws_db_instance.supabase_db.port
  })
}

resource "aws_secretsmanager_secret" "azure_openai_key" {
  name = "scout-analytics/${var.environment}/azure-openai-key"
  description = "Azure OpenAI API Key"
  kms_key_id = "alias/aws/secretsmanager"

  secret_string = var.azure_openai_key
}

# --- ECS Cluster for Dashboard and RetailBot API ---
resource "aws_ecs_cluster" "main" {
  name = "scout-analytics-cluster-${var.environment}"

  tags = {
    Name        = "ScoutAnalyticsECSCluster"
    Environment = var.environment
  }
}

# ECR Repositories will be created as part of CI/CD or separate Terraform (not covered here for brevity) 