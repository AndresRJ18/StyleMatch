##############################################
# StyleMatch — S3 Bucket para imágenes
##############################################

resource "aws_s3_bucket" "images" {
  bucket = "${var.project_name}-images-${random_id.suffix.hex}"

  # Previene errores si el bucket tiene objetos al destruir
  force_destroy = true

  tags = {
    Name = "${var.project_name}-images"
  }
}

# Bloqueo total de acceso público — las imágenes solo se acceden vía IAM (Lambda)
resource "aws_s3_bucket_public_access_block" "images" {
  bucket = aws_s3_bucket.images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle: eliminar imágenes después de 7 días
# Las fotos son temporales — solo necesitamos que Rekognition las procese
resource "aws_s3_bucket_lifecycle_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  rule {
    id     = "delete-temp-images"
    status = "Enabled"

    filter {
      prefix = "uploads/"
    }

    expiration {
      days = 7
    }
  }
}

# Carpetas lógicas (objetos vacíos que crean la estructura de prefijos)
# Esto facilita la organización y el debugging en la consola de S3
resource "aws_s3_object" "folder_hombre" {
  bucket  = aws_s3_bucket.images.id
  key     = "uploads/hombre/"
  content = ""
}

resource "aws_s3_object" "folder_mujer" {
  bucket  = aws_s3_bucket.images.id
  key     = "uploads/mujer/"
  content = ""
}
