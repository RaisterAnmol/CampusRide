output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.campusride_vpc.id
}

output "ecs_cluster_name" {
  description = "Name of the ECS container cluster"
  value       = aws_ecs_cluster.campusride_cluster.name
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name for client SPA"
  value       = aws_cloudfront_distribution.s3_distribution.domain_name
}

output "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = aws_elasticache_cluster.campusride_redis.cache_nodes[0].address
}
