##############################################
# StyleMatch — Lambda Function
##############################################

# Empaqueta lambda_function.py en zip automáticamente.
# Se regenera si el archivo fuente cambia (source_content_filename hash).
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/lambda_function.py"
  output_path = "${path.module}/../backend/lambda_function.zip"
}

resource "aws_lambda_function" "stylematch" {
  function_name = "${var.project_name}-analyzer-${random_id.suffix.hex}"
  description   = "Analiza fotos de ropa con Rekognition y busca tiendas en Lima"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.11"

  role    = aws_iam_role.lambda.arn
  timeout = 30
  memory_size = 512 # Rekognition responses pueden ser pesadas

  environment {
    variables = {
      S3_BUCKET_NAME  = aws_s3_bucket.images.id
      SERPAPI_KEY      = var.serpapi_key
      AWS_REGION_NAME  = var.aws_region
    }
  }

  tags = {
    Name = "${var.project_name}-analyzer"
  }
}

# Log group explícito para controlar retención y evitar logs huérfanos
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.stylematch.function_name}"
  retention_in_days = 14 # 2 semanas es suficiente para debugging

  tags = {
    Name = "${var.project_name}-logs"
  }
}
