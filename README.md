<div align="center">

# StyleMatch

### Fashion Finder con visión por computadora en AWS

[![AWS Lambda](https://img.shields.io/badge/AWS%20Lambda-Python%203.11-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![AWS Rekognition](https://img.shields.io/badge/AWS%20Rekognition-Computer%20Vision-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/rekognition/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

Sube una foto de tu ropa → AWS Rekognition detecta la prenda → StyleMatch te muestra dónde comprarla en Lima, Perú.

<a href="https://andresrj18.github.io/StyleMatch" target="_blank">Ver Presentación</a> · <a href="#arquitectura">Arquitectura</a> · <a href="#deployment">Deploy</a>

<br/>

<!-- Cuando tengas el video: reemplaza TU_VIDEO_ID con el ID de YouTube (lo que va después de ?v=) -->
[![Ver demo en YouTube](https://img.youtube.com/vi/SjBJ0mtn7ZA/maxresdefault.jpg)](https://www.youtube.com/watch?v=SjBJ0mtn7ZA)

*Click en la imagen para ver la demo*

</div>

---

## Qué hace

StyleMatch analiza fotos de ropa usando inteligencia artificial y devuelve una lista de tiendas reales en Lima donde conseguir esa prenda, con precios estimados y sedes físicas (Jockey Plaza, Mall del Sur, Larcomar, entre otras).

El proyecto tiene un frontend de doble personalidad: modo hombre con estética oscura y dorada, modo mujer con tonos blush y rosa. Cada modo mantiene su propia paleta, tipografía y animaciones.

---

## Arquitectura

```
Usuario → React (Vercel) → API Gateway (REST) → Lambda (Python 3.11) → Rekognition
                                                                     → S3
                                                                     → SerpAPI (Google Shopping)
```

Todo el backend está desplegado con **Terraform** en AWS región `us-east-1`, 100 % free tier.

| Servicio | Rol |
|----------|-----|
| **AWS Lambda** | Lógica principal — recibe imagen, llama a Rekognition y SerpAPI |
| **AWS Rekognition** | Detecta prenda, color y estilo desde la foto |
| **AWS API Gateway** | REST API con CORS, stage `prod` |
| **AWS S3** | Almacena imágenes temporalmente (lifecycle 7 días) |
| **SerpAPI** | Busca resultados en Google Shopping con query `{prenda} Lima Peru` |
| **Terraform** | IaC — levanta todo el backend desde cero con un solo `apply` |
| **Vercel** | Hosting del frontend con deploy automático desde GitHub |

---

## Stack

**Backend**
- Python 3.11 con `boto3` (pre-instalado en Lambda)
- Lambda 512 MB · 30 s timeout
- IAM con least privilege (`s3:PutObject uploads/*`, `rekognition:DetectLabels`, `logs:*`)
- CloudWatch Logs con retención de 14 días

**Frontend**
- React 18 — toda la app en `App.jsx` (~355 líneas)
- Tipografías: Cormorant Garamond (títulos) · Montserrat (body) · Courier Prime (badges)
- Animaciones CSS puras: `float`, `shimmer`, `fadeUp`, `bgDrift`
- Sin librerías de UI — estilos propios en `styles.css`

**Infraestructura**
- `random_id` para nombres únicos globales en S3 y Lambda
- `archive_file` para auto-zip del código Lambda con hash de fuente
- Secretos en `terraform.tfvars` (fuera de git, incluido en `.gitignore`)

---

## Estructura del proyecto

```
stylematch/
├── terraform/
│   ├── main.tf              # Provider, random_id, default_tags
│   ├── variables.tf          # aws_region, project_name, serpapi_key, environment
│   ├── s3.tf                 # Bucket con lifecycle 7 días
│   ├── iam.tf                # Rol Lambda con least privilege
│   ├── lambda.tf             # Lambda + archive_file
│   ├── api_gateway.tf        # REST API con CORS
│   └── outputs.tf            # api_url, bucket_name, lambda_name
├── backend/
│   ├── lambda_function.py    # Lógica principal (~500 líneas)
│   └── requirements.txt
└── frontend/
    ├── public/
    │   ├── index.html        # Google Fonts precargadas
    │   └── images/           # 8 fotos para el collage
    └── src/
        ├── App.jsx           # Toda la app
        └── styles.css        # Animaciones
```

---

## Flujo del Lambda

1. Recibe `POST { imagen_base64, genero }` — limpia prefijo `data:image/jpeg;base64,` si viene del frontend
2. Sube la imagen a S3 en `uploads/{genero}/{uuid}_{timestamp}.jpg`
3. Llama a `rekognition.detect_labels` (MaxLabels=20, MinConfidence=70)
4. Extrae prenda, color y estilo de los labels (busca en label directo, nombres compuestos y campo `Parents`)
5. Construye query para SerpAPI: `{prenda} {color} tienda Lima Peru`
6. Combina resultados de SerpAPI con fallback de tiendas físicas hardcodeadas
7. Devuelve JSON con prenda detectada, lista de tiendas (hasta 18), precios, ubicaciones y badges

---

## Ejecución local

### Prerrequisitos

- AWS CLI configurado (`aws configure` o perfil en `~/.aws/credentials`)
- Terraform >= 1.5
- Node.js 18+ para el frontend
- Cuenta en [SerpAPI](https://serpapi.com) (plan free: 250 queries/mes)

### Backend con Terraform

```bash
git clone https://github.com/AndresRJ18/stylematch.git
cd stylematch/terraform

# Crear archivo de variables (nunca commitear)
cat > terraform.tfvars <<EOF
aws_region    = "us-east-1"
project_name  = "stylematch"
environment   = "prod"
serpapi_key   = "TU_KEY_AQUI"
EOF

export AWS_PROFILE=tu-perfil
terraform init
terraform apply -auto-approve
```

Al terminar, `terraform output api_url` devuelve el endpoint a pegar en el frontend.

### Frontend

```bash
cd frontend
npm install

# Pegar el endpoint en App.jsx (línea con API_URL o la constante del fetch)
npm start
```

---

## Deployment

### Backend

El backend se gestiona completamente con Terraform. Para forzar redeploy del Lambda después de cambiar código:

```bash
# Opción 1 — taint
terraform taint aws_lambda_function.stylematch
terraform apply -auto-approve

# Opción 2 — si taint falla con "already managed"
terraform state rm aws_lambda_function.stylematch
terraform import aws_lambda_function.stylematch stylematch-analyzer-XXXXXXXX
terraform apply -auto-approve
```

### Ver logs en tiempo real

```bash
# En Git Bash usar MSYS_NO_PATHCONV=1 para evitar que convierta el path
MSYS_NO_PATHCONV=1 aws logs tail /aws/lambda/stylematch-analyzer-XXXX \
  --since 5m --format short --profile tu-perfil
```

### Frontend en Vercel

Conectar el repo de GitHub a Vercel. Deploy automático en cada push a `main`. No requiere configuración adicional — Vercel detecta React y hace el build solo.

---

## Test desde CLI

```bash
BASE64=$(base64 -w 0 /ruta/a/foto.jpeg)
echo "{\"imagen_base64\": \"$BASE64\", \"genero\": \"hombre\"}" > /tmp/payload.json

curl -s -X POST "https://{tu-api-id}.execute-api.us-east-1.amazonaws.com/prod/analizar" \
  -H "Content-Type: application/json" \
  -d @/tmp/payload.json | python -m json.tool
```

---

## Costos estimados (Free Tier)

| Servicio | Límite gratuito |
|----------|----------------|
| Lambda | 1 M requests/mes |
| S3 | 5 GB (lifecycle borra a los 7 días) |
| Rekognition | 5 000 imágenes/mes (primeros 12 meses) |
| API Gateway | 1 M calls/mes |
| SerpAPI | 250 queries/mes (plan free) |
| Vercel | Gratis para proyectos personales |

**Costo mensual real del proyecto: $0**

---

## Problemas conocidos

- **Encoding UTF-8**: caracteres como `é`, `ó` pueden aparecer mal codificados en las respuestas JSON del Lambda. Pendiente de fix.
- **Detección de color**: Rekognition no siempre incluye colores. El Lambda busca en labels directos, nombres compuestos y campo `Parents`. Si no encuentra, el frontend oculta ese campo.
- **Responsive mobile**: el collage de fotos no se adapta bien en pantallas pequeñas. Pendiente.
- **SerpAPI**: no soporta `gl=pe`. Se compensa metiendo "Lima Peru" en la query directamente.

---

## Mejoras planeadas

- [ ] Fix de encoding UTF-8 en respuestas Lambda
- [ ] Detección de color por análisis de píxeles dominantes con Pillow
- [ ] Imágenes de productos de SerpAPI en las tarjetas (campo `thumbnail` ya disponible)
- [ ] Caché de resultados para ahorrar queries de SerpAPI
- [ ] Responsive mobile completo
- [ ] Tests unitarios para el Lambda
- [ ] CI/CD con GitHub Actions para auto-deploy del backend

---

## Autor

**Andrés Rodas** — Estudiante de Ingeniería Informática en UPCH, enfocado en Cloud Computing e IA.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Andrés_Rodas-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/andres-rodas-802309272)
[![GitHub](https://img.shields.io/badge/GitHub-@AndresRJ18-181717?style=flat-square&logo=github)](https://github.com/AndresRJ18)
[![Email](https://img.shields.io/badge/Email-andrescloud18sj@gmail.com-D14836?style=flat-square&logo=gmail)](mailto:andrescloud18sj@gmail.com)

---

Hecho con cariño por Andres & Chiara · Lima, Perú · 2025
