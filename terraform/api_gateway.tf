##############################################
# StyleMatch — API Gateway REST
##############################################

resource "aws_api_gateway_rest_api" "stylematch" {
  name        = "${var.project_name}-api"
  description = "API REST para StyleMatch — análisis de ropa con IA"

  endpoint_configuration {
    types = ["REGIONAL"] # Más barato que EDGE para una app en Lima
  }
}

# ─── Recurso /analizar ───
resource "aws_api_gateway_resource" "analizar" {
  rest_api_id = aws_api_gateway_rest_api.stylematch.id
  parent_id   = aws_api_gateway_rest_api.stylematch.root_resource_id
  path_part   = "analizar"
}

# ─── Método POST /analizar → Lambda ───
resource "aws_api_gateway_method" "post_analizar" {
  rest_api_id   = aws_api_gateway_rest_api.stylematch.id
  resource_id   = aws_api_gateway_resource.analizar.id
  http_method   = "POST"
  authorization = "NONE" # Público por ahora, para el frontend
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.stylematch.id
  resource_id             = aws_api_gateway_resource.analizar.id
  http_method             = aws_api_gateway_method.post_analizar.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST" # Lambda siempre se invoca con POST
  uri                     = aws_lambda_function.stylematch.invoke_arn
}

# ─── CORS: Método OPTIONS (preflight) ───
resource "aws_api_gateway_method" "options_analizar" {
  rest_api_id   = aws_api_gateway_rest_api.stylematch.id
  resource_id   = aws_api_gateway_resource.analizar.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# OPTIONS usa MOCK integration — no necesita Lambda
resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id = aws_api_gateway_rest_api.stylematch.id
  resource_id = aws_api_gateway_resource.analizar.id
  http_method = aws_api_gateway_method.options_analizar.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_method_response" "options_200" {
  rest_api_id = aws_api_gateway_rest_api.stylematch.id
  resource_id = aws_api_gateway_resource.analizar.id
  http_method = aws_api_gateway_method.options_analizar.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "options_response" {
  rest_api_id = aws_api_gateway_rest_api.stylematch.id
  resource_id = aws_api_gateway_resource.analizar.id
  http_method = aws_api_gateway_method.options_analizar.http_method
  status_code = aws_api_gateway_method_response.options_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.options_integration]
}

# ─── Deploy y Stage ───
resource "aws_api_gateway_deployment" "prod" {
  rest_api_id = aws_api_gateway_rest_api.stylematch.id

  # Forzar re-deploy cuando cambian los recursos del API
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.analizar.id,
      aws_api_gateway_method.post_analizar.id,
      aws_api_gateway_integration.lambda_integration.id,
      aws_api_gateway_method.options_analizar.id,
      aws_api_gateway_integration.options_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.prod.id
  rest_api_id   = aws_api_gateway_rest_api.stylematch.id
  stage_name    = "prod"

  tags = {
    Name = "${var.project_name}-prod"
  }
}

# ─── Permiso para que API Gateway invoque Lambda ───
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stylematch.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.stylematch.execution_arn}/*/*"
}
