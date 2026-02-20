##############################################
# StyleMatch — IAM Role y Políticas para Lambda
##############################################

# Trust policy: permite que el servicio Lambda asuma este rol
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# Rol que Lambda va a usar
resource "aws_iam_role" "lambda" {
  name               = "${var.project_name}-lambda-role-${random_id.suffix.hex}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

# Política con permisos mínimos necesarios
data "aws_iam_policy_document" "lambda_permissions" {

  # S3: solo leer y escribir en NUESTRO bucket, solo en uploads/
  statement {
    sid     = "S3Access"
    actions = [
      "s3:PutObject",
      "s3:GetObject"
    ]
    resources = [
      "${aws_s3_bucket.images.arn}/uploads/*"
    ]
  }

  # Rekognition: solo detectar etiquetas, nada más
  statement {
    sid     = "RekognitionAccess"
    actions = [
      "rekognition:DetectLabels"
    ]
    resources = ["*"] # Rekognition no soporta resource-level permissions
  }

  # CloudWatch Logs: necesario para debugging
  statement {
    sid     = "CloudWatchLogs"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "arn:aws:logs:${var.aws_region}:*:log-group:/aws/lambda/${var.project_name}-*"
    ]
  }
}

resource "aws_iam_role_policy" "lambda" {
  name   = "${var.project_name}-lambda-policy"
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.lambda_permissions.json
}
