<div align="center">

# StyleMatch

### Fashion Finder con visión por computadora en AWS

[![AWS Lambda](https://img.shields.io/badge/AWS%20Lambda-Python%203.11-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![AWS Rekognition](https://img.shields.io/badge/AWS%20Rekognition-Computer%20Vision-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/rekognition/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

Sube una foto de tu ropa → AWS Rekognition detecta la prenda → StyleMatch te muestra dónde comprarla online.

[🌐 Presentación](https://andresrj18.github.io/StyleMatch/) · [Arquitectura](#arquitectura) · [Deploy](#deployment) · [Costos](costos-estimados-free-tier)

</div>

---

## Demo

<table>
  <tr>
    <td align="center" width="50%">
      <b>Modo Hombre</b><br/><br/>
      <img src="docs/hombre-stylematch.gif" alt="Demo Hombre" width="100%"/>
    </td>
    <td align="center" width="50%">
      <b>Modo Mujer</b><br/><br/>
      <img src="docs/mujer-stylematch.gif" alt="Demo Mujer" width="100%"/>
    </td>
  </tr>
</table>

---

## Qué hace

StyleMatch analiza fotos de ropa usando inteligencia artificial y devuelve una lista de tiendas online donde conseguir esa prenda, con precios reales, imágenes de producto y envío internacional.

El proyecto tiene un frontend de doble personalidad: modo **Hombre** con estética oscura y dorada, modo **Mujer** con tonos blush y rosa. Cada modo mantiene su propia paleta, tipografía y animaciones.

---

## Arquitectura

```
Usuario → React → API Gateway (REST) → Lambda (Python 3.11) → Rekognition
                                                             → S3
                                                             → SerpAPI (Google Shopping)
```

Todo el backend está desplegado con **Terraform** en AWS región `us-east-1`, 100% free tier.

| Servicio | Rol |
|----------|-----|
| **AWS Lambda** | Lógica principal — recibe imagen, llama a Rekognition y SerpAPI |
| **AWS Rekognition** | Detecta prenda, color y estilo desde la foto |
| **AWS API Gateway** | REST API con CORS, stage `prod` |
| **AWS S3** | Almacena imágenes temporalmente (lifecycle 7 días) |
| **SerpAPI** | Busca en Google Shopping con query rica en inglés (`black oversized hoodie streetwear men shop`) |
| **Terraform** | IaC — levanta todo el backend desde cero con un solo `apply` |

---

## Stack

**Backend**
- Python 3.11 con `boto3` (pre-instalado en Lambda)
- Lambda 512 MB · 30 s timeout
- IAM con least privilege (`s3:PutObject uploads/*`, `rekognition:DetectLabels`, `logs:*`)
- CloudWatch Logs con retención de 14 días
- Dual query strategy: query específica + query broad como fallback, hasta 18 resultados

**Frontend**
- React 18 — toda la app en `App.jsx`
- Tipografías: Cormorant Garamond (títulos) · Montserrat (UI) · Courier Prime (labels/badges)
- Animaciones CSS puras: `fadeUp`, `shimmer`, `bgDrift`, `scanLaser`, `floatFlower`, `floatParticle`
- Glassmorphism en upload zone (`backdrop-filter: blur(14px)`)
- Reveal radial animado al entrar a cada modo
- Sin librerías de UI — estilos propios en `styles.css`

**Infraestructura**
- `random_id` para nombres únicos globales en S3 y Lambda
- `archive_file` para auto-zip del código Lambda con hash de fuente
- Secretos en `terraform.tfvars` (fuera de git, en `.gitignore`)

---

## Estructura del proyecto

```
stylematch/
├── docs/
│   ├── hombre-stylematch.gif
│   └── mujer-stylematch.gif
├── terraform/
│   ├── main.tf              # Provider, random_id, default_tags
│   ├── variables.tf         # aws_region, project_name, serpapi_key, environment
│   ├── s3.tf                # Bucket con lifecycle 7 días
│   ├── iam.tf               # Rol Lambda con least privilege
│   ├── lambda.tf            # Lambda + archive_file (auto-zip)
│   ├── api_gateway.tf       # REST API con CORS
│   └── outputs.tf           # api_url, bucket_name, lambda_name
├── backend/
│   ├── lambda_function.py   # Lógica principal
│   └── requirements.txt
└── frontend/
    ├── public/
    │   ├── index.html       # Google Fonts precargadas
    │   └── images/          # 8 fotos para el collage
    └── src/
        ├── App.jsx          # Toda la app
        └── styles.css       # Animaciones y clases CSS
```

---

## Flujo del Lambda

1. Recibe `POST { imagen_base64, genero }` desde el frontend
2. Sube la imagen a S3 en `uploads/{genero}/{uuid}_{timestamp}.jpg`
3. Llama a `rekognition.detect_labels` (MaxLabels=35, MinConfidence=50)
4. Extrae prenda, color y estilo de los labels (busca en label directo, nombres compuestos y campo `Parents`)
5. Construye query rica en inglés: `oversized black striped hoodie streetwear men shop`
6. Ejecuta búsqueda principal en SerpAPI (Google Shopping, sin restricción geográfica)
7. Si hay menos de 6 resultados, ejecuta query broad de respaldo
8. Devuelve JSON con prenda detectada + hasta 18 tiendas con imagen, precio, rating y reviews

---

## Ejecución local

### Prerrequisitos

- AWS CLI configurado (`aws configure` o perfil en `~/.aws/credentials`)
- Terraform >= 1.5
- Node.js 18+
- Cuenta en [SerpAPI](https://serpapi.com) (plan free: 100 queries/mes)

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

export AWS_PROFILE=tu-perfil   # o setear en PowerShell: $env:AWS_PROFILE="tu-perfil"
terraform init
terraform apply -auto-approve
```

Al terminar, `terraform output api_url` devuelve el endpoint — pegarlo en `API_URL` dentro de `App.jsx`.

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## Deployment

### Actualizar el Lambda

Después de modificar `lambda_function.py`:

```bash
# Windows PowerShell
$env:AWS_PROFILE="tu-perfil"
cd backend
Compress-Archive -Path lambda_function.py -DestinationPath lambda_function.zip -Force
cd ../terraform
terraform apply -auto-approve
# Resultado esperado: 1 changed, 0 added, 0 destroyed
```

### Ver logs en tiempo real

```powershell
# PowerShell (no Git Bash — interpreta /aws/ como ruta de Windows)
aws logs tail /aws/lambda/stylematch-analyzer-XXXX --follow --profile tu-perfil
```

---

## Test desde CLI

```bash
BASE64=$(base64 -w 0 foto.jpg)
curl -s -X POST "https://TU-API-ID.execute-api.us-east-1.amazonaws.com/prod/analizar" \
  -H "Content-Type: application/json" \
  -d "{\"imagen_base64\": \"$BASE64\", \"genero\": \"hombre\"}" | python -m json.tool
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

**Costo mensual real del proyecto: $0**

---

## Problemas conocidos

- **Detección de color**: `IMAGE_PROPERTIES` de Rekognition no está disponible en el runtime actual. El color se extrae de los labels de texto.
- **Responsive mobile**: el collage de fotos no se adapta bien en pantallas pequeñas.
- **SerpAPI free tier**: 100 queries/mes — suficiente para demos y portafolio.

---

## Mejoras planeadas

- [ ] Modo cámara — activar cámara del celular directo desde el browser
- [ ] Historial de búsquedas con localStorage
- [ ] Compartir resultado como imagen para Instagram/WhatsApp
- [ ] Responsive mobile completo
- [ ] Tests unitarios para el Lambda
- [ ] CI/CD con GitHub Actions

---

## Autores

**Andrés Rodas** — Ingeniería Informática, UPCH · Cloud Computing & IA

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Andrés_Rodas-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/andres-rodas-802309272)
[![GitHub](https://img.shields.io/badge/GitHub-@AndresRJ18-181717?style=flat-square&logo=github)](https://github.com/AndresRJ18)
[![Email](https://img.shields.io/badge/Email-andrescloud18sj@gmail.com-D14836?style=flat-square&logo=gmail)](mailto:andrescloud18sj@gmail.com)


---

<div align="center">
Hecho con cariño por Andres & Chiarita · Lima, Perú · 2026
</div>
