# 👗 StyleMatch — Análisis de Ropa con IA

Sube una foto de ropa y StyleMatch te dice qué es, de qué color, el estilo, y te muestra tiendas en Lima donde comprarla.

**Stack:** AWS Lambda + Rekognition + S3 + API Gateway, desplegado 100% con Terraform.

---

## Arquitectura

```
┌──────────┐     POST /analizar     ┌─────────────┐
│ Frontend │ ──────────────────────► │ API Gateway  │
│  (HTML)  │ ◄────────────────────── │   (REST)     │
└──────────┘      JSON response     └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │   Lambda     │
                                    │ (Python 3.11)│
                                    └──┬───┬───┬──┘
                                       │   │   │
                              ┌────────┘   │   └────────┐
                              ▼            ▼            ▼
                        ┌──────────┐ ┌───────────┐ ┌─────────┐
                        │    S3    │ │Rekognition│ │ SerpAPI │
                        │ imágenes │ │  (labels) │ │(tiendas)│
                        └──────────┘ └───────────┘ └─────────┘
```

---

## Requisitos previos

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configurado con credenciales
- Python 3.11 (solo para testing local, Lambda usa su propio runtime)
- Cuenta en [SerpAPI](https://serpapi.com/) (plan gratis: 100 búsquedas/mes)

## Configuración de AWS CLI

```bash
# Si tienes múltiples cuentas, usa named profiles
aws configure --profile free-tier
# Access Key ID: tu-key
# Secret Access Key: tu-secret
# Region: us-east-1
# Output: json

export AWS_PROFILE=free-tier
aws sts get-caller-identity  # Verifica que estás en la cuenta correcta
```

---

## Despliegue

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/stylematch.git
cd stylematch

# 2. Configurar variables
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Editar terraform.tfvars con tu SerpAPI key

# 3. Desplegar infraestructura
cd terraform
terraform init
terraform plan        # Revisar qué se va a crear
terraform apply       # Escribir "yes" para confirmar

# 4. Copiar la URL del output
# api_url = "https://abc123.execute-api.us-east-1.amazonaws.com/prod/analizar"
```

---

## Probar el endpoint

```bash
# Codificar una imagen a base64
BASE64=$(base64 -w 0 tu_foto.jpg)  # Linux/Git Bash
# BASE64=$(base64 -i tu_foto.jpg)  # macOS

# Llamar al API
curl -X POST \
  "$(terraform output -raw api_url)" \
  -H "Content-Type: application/json" \
  -d "{\"imagen_base64\": \"$BASE64\", \"genero\": \"hombre\"}"
```

---

## Conectar al frontend

Copiar la `api_url` del output de Terraform y usarla en el `fetch()` del HTML:

```javascript
const API_URL = "https://abc123.execute-api.us-east-1.amazonaws.com/prod/analizar";

const response = await fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    imagen_base64: imagenEnBase64,
    genero: "mujer"
  })
});

const data = await response.json();
// data.prenda.tipo_es → "Vestido"
// data.tiendas → [{nombre: "Saga Falabella", ...}]
```

---

## Estructura del proyecto

```
stylematch/
├── terraform/
│   ├── main.tf            # Provider AWS, random suffix
│   ├── variables.tf       # Variables configurables
│   ├── terraform.tfvars   # Valores (NO commitear)
│   ├── s3.tf              # Bucket de imágenes temporales
│   ├── iam.tf             # Rol Lambda con mínimo privilegio
│   ├── lambda.tf          # Función Lambda + empaquetado zip
│   ├── api_gateway.tf     # REST API + CORS
│   └── outputs.tf         # URL del API, nombre del bucket
├── backend/
│   ├── lambda_function.py # Lógica principal
│   └── requirements.txt   # Dependencias (referencia)
└── README.md
```

---

## Costos estimados (Free Tier)

| Servicio      | Gratis hasta              | Costo después         |
|---------------|---------------------------|-----------------------|
| Lambda        | 1M requests/mes           | $0.20 por 1M requests |
| S3            | 5 GB storage              | $0.023/GB             |
| Rekognition   | 5,000 imágenes/mes        | $1.00 por 1,000       |
| API Gateway   | 1M llamadas/mes           | $3.50 por 1M          |
| **Total dev** | **$0.00**                 |                       |

Las imágenes se eliminan automáticamente después de 7 días (lifecycle rule en S3).

---

## Destruir infraestructura

```bash
cd terraform
terraform destroy  # Escribir "yes" para confirmar
```

Esto elimina TODOS los recursos creados y evita costos futuros.

---

## Respuesta de ejemplo

```json
{
  "success": true,
  "genero": "hombre",
  "prenda": {
    "tipo_es": "Polo / Camiseta",
    "color": "Negro",
    "estilo": "Casual",
    "material_estimado": "Algodón",
    "confianza": 94.2,
    "cuando_usar": "Ideal para días relajados, salidas informales o el fin de semana.",
    "ocasion": ["Día casual", "Fin de semana", "Salida con amigos"],
    "tallas_disponibles": ["XS", "S", "M", "L", "XL", "XXL"],
    "precio_min": 25,
    "precio_max": 120
  },
  "tiendas": [
    {
      "nombre": "Saga Falabella",
      "tipo": "fisica",
      "producto": "Polo básico algodón — Negro",
      "precio": 89.90,
      "ubicacion": "Jockey Plaza, San Isidro, Miraflores",
      "link": "https://www.falabella.com.pe",
      "disponible": true
    }
  ]
}
```

---

## Tecnologías

- **Terraform** — Infrastructure as Code
- **AWS Lambda** — Serverless compute (Python 3.11)
- **Amazon Rekognition** — Detección de etiquetas en imágenes
- **Amazon S3** — Almacenamiento temporal de imágenes
- **API Gateway** — REST API con CORS
- **SerpAPI** — Búsqueda de productos en Google Shopping
