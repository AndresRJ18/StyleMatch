##############################################
# StyleMatch — Outputs
##############################################

output "api_url" {
  description = "URL completa del endpoint POST /analizar"
  value       = "${aws_api_gateway_stage.prod.invoke_url}/analizar"
}

output "bucket_name" {
  description = "Nombre del bucket S3 para imágenes"
  value       = aws_s3_bucket.images.id
}

output "lambda_name" {
  description = "Nombre de la función Lambda"
  value       = aws_lambda_function.stylematch.function_name
}
