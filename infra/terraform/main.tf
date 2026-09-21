# Terraform Configuration for CampusRide Cloud Infrastructure
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.14"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. VPC & Networking
resource "aws_vpc" "campusride_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "campusride-vpc-${var.environment}"
    Environment = var.environment
  }
}

# 2. Public & Private Subnets
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.campusride_vpc.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, 0)
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "campusride-public-a"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.campusride_vpc.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, 1)
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "campusride-public-b"
  }
}

# 3. ECS Cluster for Containerized Server Tasks
resource "aws_ecs_cluster" "campusride_cluster" {
  name = "campusride-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# 4. ElastiCache Redis Instance (For Rate Limiting & Socket.IO Clustering)
resource "aws_elasticache_cluster" "campusride_redis" {
  cluster_id           = "campusride-redis-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

# 5. S3 Bucket & CloudFront CDN for Single Page Application (Client)
resource "aws_s3_bucket" "client_bucket" {
  bucket = "campusride-client-${var.environment}-${var.aws_region}"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.client_bucket.bucket_regional_domain_name
    origin_id   = "S3-campusride-client"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-campusride-client"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
