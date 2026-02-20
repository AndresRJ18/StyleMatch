"""
StyleMatch — Lambda Function
Analiza fotos de ropa con Rekognition y busca tiendas en Lima.
"""

import json
import boto3
import base64
import uuid
import os
import urllib.request
import urllib.parse
from datetime import datetime

# Clients AWS — se inicializan fuera del handler para reutilizar entre invocaciones
s3_client = boto3.client("s3")
rekognition_client = boto3.client("rekognition")

# Variables de entorno inyectadas por Terraform
BUCKET_NAME = os.environ.get("S3_BUCKET_NAME", "")
SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")
REGION = os.environ.get("AWS_REGION_NAME", "us-east-1")

# ─────────────────────────────────────────────
# Catálogo de prendas, colores y estilos
# ─────────────────────────────────────────────

PRENDAS_HOMBRE = {
    "Shirt": "Camisa",
    "T-Shirt": "Polo / Camiseta",
    "Polo Shirt": "Polo",
    "Pants": "Pantalón",
    "Jeans": "Jean",
    "Jacket": "Chaqueta",
    "Hoodie": "Hoodie / Polera",
    "Sweater": "Suéter",
    "Coat": "Abrigo",
    "Shorts": "Short",
    "Sneakers": "Zapatillas",
    "Suit": "Traje",
}

PRENDAS_MUJER = {
    "Dress": "Vestido",
    "Skirt": "Falda",
    "Blouse": "Blusa",
    "Top": "Top",
    "Leggings": "Leggings",
    "Cardigan": "Cardigan",
    "Heels": "Tacones",
    "Sandals": "Sandalias",
    "Jumpsuit": "Enterizo",
    "Swimwear": "Ropa de baño",
}

COLORES = {
    "Black": "Negro",
    "White": "Blanco",
    "Red": "Rojo",
    "Blue": "Azul",
    "Green": "Verde",
    "Gray": "Gris",
    "Brown": "Marrón",
    "Pink": "Rosado",
    "Yellow": "Amarillo",
    "Purple": "Morado",
    "Orange": "Naranja",
    "Beige": "Beige",
}

ESTILOS = {
    "Casual": "Casual",
    "Formal": "Formal",
    "Sportswear": "Deportivo",
    "Elegant": "Elegante",
    "Urban": "Urbano",
}

# Recomendaciones según estilo detectado
OCASIONES = {
    "Casual": ["Día casual", "Fin de semana", "Salida con amigos"],
    "Formal": ["Reunión de trabajo", "Evento corporativo", "Cena formal"],
    "Deportivo": ["Gimnasio", "Running", "Actividad al aire libre"],
    "Elegante": ["Fiesta", "Cena especial", "Evento social"],
    "Urbano": ["Street style", "Salida nocturna", "Día casual"],
}

CUANDO_USAR = {
    "Casual": "Ideal para días relajados, salidas informales o el fin de semana.",
    "Formal": "Perfecto para reuniones de trabajo, entrevistas o eventos corporativos.",
    "Deportivo": "Diseñado para actividad física, gimnasio o deporte al aire libre.",
    "Elegante": "Ideal para fiestas, cenas especiales o eventos donde quieras destacar.",
    "Urbano": "Perfecto para el día a día con un toque moderno y street style.",
}

# Tiendas fallback en Lima por tipo de prenda
TIENDAS_FALLBACK = {
    "default": [
        {
            "nombre": "Saga Falabella",
            "tipo": "fisica",
            "ubicacion": "Jockey Plaza, San Isidro, Miraflores",
            "link": "https://www.falabella.com.pe",
            "disponible": True,
        },
        {
            "nombre": "Ripley",
            "tipo": "fisica",
            "ubicacion": "Jockey Plaza, San Miguel, Mega Plaza",
            "link": "https://simple.ripley.com.pe",
            "disponible": True,
        },
        {
            "nombre": "Oechsle",
            "tipo": "fisica",
            "ubicacion": "Real Plaza, Jockey Plaza",
            "link": "https://www.oechsle.pe",
            "disponible": True,
        },
        {
            "nombre": "H&M",
            "tipo": "fisica",
            "ubicacion": "Jockey Plaza, Real Plaza Salaverry",
            "link": "https://www2.hm.com/es_pe",
            "disponible": True,
        },
        {
            "nombre": "Zara",
            "tipo": "fisica",
            "ubicacion": "Jockey Plaza",
            "link": "https://www.zara.com/pe",
            "disponible": True,
        },
    ],
    "Zapatillas": [
        {
            "nombre": "Marathon Sports",
            "tipo": "fisica",
            "ubicacion": "Jockey Plaza, Real Plaza, Mall del Sur",
            "link": "https://www.marathon.pe",
            "disponible": True,
        },
        {
            "nombre": "Footloose",
            "tipo": "fisica",
            "ubicacion": "Múltiples sedes en Lima",
            "link": "https://www.footloose.pe",
            "disponible": True,
        },
    ],
}

# Tiendas conocidas en Lima para filtrar resultados de SerpAPI
TIENDAS_LIMA = [
    "falabella", "ripley", "oechsle", "hm", "h&m", "zara",
    "marathon", "footloose", "platanitos", "passarela", "bata",
    "topitop", "gamarra", "paris", "pillin", "linio", "mercado libre",
]


def lambda_handler(event, context):
    """Handler principal de la Lambda."""
    try:
        # ─── PASO 1: Parsear el body del request ───
        body = json.loads(event.get("body", "{}"))
        imagen_base64 = body.get("imagen_base64", "")
        genero = body.get("genero", "").lower()

        if not imagen_base64:
            return _response(400, {"success": False, "error": "Falta imagen_base64"})

        if genero not in ("hombre", "mujer"):
            return _response(400, {"success": False, "error": "genero debe ser 'hombre' o 'mujer'"})

        # ─── PASO 2: Subir imagen a S3 ───
        # Limpiar prefijo data URI si viene del frontend (data:image/jpeg;base64,...)
        if "," in imagen_base64:
            imagen_base64 = imagen_base64.split(",", 1)[1]
        image_bytes = base64.b64decode(imagen_base64)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{uuid.uuid4().hex}_{timestamp}.jpg"
        s3_key = f"uploads/{genero}/{filename}"

        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=image_bytes,
            ContentType="image/jpeg",
        )

        # ─── PASO 3: Llamar a Rekognition ───
        rekognition_response = rekognition_client.detect_labels(
            Image={"S3Object": {"Bucket": BUCKET_NAME, "Name": s3_key}},
            MaxLabels=20,
            MinConfidence=70,
        )

        labels = rekognition_response.get("Labels", [])

        # ─── PASO 4: Procesar etiquetas ───
        prendas_dict = PRENDAS_HOMBRE if genero == "hombre" else PRENDAS_MUJER
        prenda_detectada = None
        color_detectado = None
        estilo_detectado = None
        etiquetas_detalle = []

        for label in labels:
            nombre = label["Name"]
            confianza = label["Confidence"]
            etiquetas_detalle.append({"nombre": nombre, "confianza": round(confianza, 1)})

            # Buscar prenda (quedarse con la de mayor confianza)
            if nombre in prendas_dict and (prenda_detectada is None or confianza > prenda_detectada["confianza"]):
                prenda_detectada = {
                    "en": nombre,
                    "es": prendas_dict[nombre],
                    "confianza": confianza,
                }

            # Buscar color — primero como label directo
            if nombre in COLORES and (color_detectado is None or confianza > color_detectado["confianza"]):
                color_detectado = {
                    "en": nombre,
                    "es": COLORES[nombre],
                    "confianza": confianza,
                }

            # Buscar color dentro del nombre compuesto (ej: "Black Jacket" → Black)
            if color_detectado is None:
                for color_en, color_es in COLORES.items():
                    if color_en.lower() in nombre.lower() and color_en != nombre:
                        color_detectado = {
                            "en": color_en,
                            "es": color_es,
                            "confianza": confianza * 0.9,
                        }
                        break

            # Buscar color en Parents de cada label
            if color_detectado is None:
                for parent in label.get("Parents", []):
                    parent_name = parent.get("Name", "")
                    if parent_name in COLORES:
                        color_detectado = {
                            "en": parent_name,
                            "es": COLORES[parent_name],
                            "confianza": confianza * 0.85,
                        }
                        break

            # Buscar estilo
            if nombre in ESTILOS and (estilo_detectado is None or confianza > estilo_detectado["confianza"]):
                estilo_detectado = {
                    "en": nombre,
                    "es": ESTILOS[nombre],
                    "confianza": confianza,
                }

            # Buscar estilo en nombre compuesto
            if estilo_detectado is None:
                for estilo_en, estilo_es in ESTILOS.items():
                    if estilo_en.lower() in nombre.lower():
                        estilo_detectado = {
                            "en": estilo_en,
                            "es": estilo_es,
                            "confianza": confianza * 0.85,
                        }

        # Defaults si no se detectó algo
        if prenda_detectada is None:
            prenda_detectada = {"en": "Clothing", "es": "Prenda no identificada", "confianza": 0}

        if color_detectado is None:
            color_detectado = {"en": "Unknown", "es": "No detectado", "confianza": 0}

        if estilo_detectado is None:
            estilo_detectado = {"en": "Casual", "es": "Casual", "confianza": 0}

        estilo_es = estilo_detectado["es"]

        # ─── PASO 5: Buscar en SerpAPI ───
        # Solo incluir color si fue detectado
        color_query = color_detectado['es'] if color_detectado['es'] != "No detectado" else ""
        query_busqueda = f"{prenda_detectada['es']} {color_query}".strip()
        print(f"[INFO] Query SerpAPI: {query_busqueda}")
        tiendas = _buscar_serpapi(query_busqueda, prenda_detectada["es"])

        # ─── PASO 6: Armar y devolver respuesta ───
        resultado = {
            "success": True,
            "genero": genero,
            "prenda": {
                "tipo_es": prenda_detectada["es"],
                "color": color_detectado["es"],
                "estilo": estilo_es,
                "material_estimado": _estimar_material(prenda_detectada["en"]),
                "confianza": round(prenda_detectada["confianza"], 1),
                "cuando_usar": CUANDO_USAR.get(estilo_es, CUANDO_USAR["Casual"]),
                "ocasion": OCASIONES.get(estilo_es, OCASIONES["Casual"]),
                "tallas_disponibles": ["XS", "S", "M", "L", "XL", "XXL"],
                "precio_min": _rango_precio(prenda_detectada["en"])["min"],
                "precio_max": _rango_precio(prenda_detectada["en"])["max"],
                "etiquetas": etiquetas_detalle[:10],
            },
            "tiendas": tiendas,
        }

        return _response(200, resultado)

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return _response(500, {"success": False, "error": f"Error interno: {str(e)}"})


def _buscar_serpapi(query: str, prenda_es: str) -> list:
    """Busca productos en Google Shopping vía SerpAPI. Fallback si falla."""
    if not SERPAPI_KEY:
        print("[WARN] SERPAPI_KEY no configurada, usando fallback")
        return _tiendas_fallback(prenda_es)

    try:
        # gl=pe NO es soportado por SerpAPI, metemos "Lima" en la query
        search_query = f"{query} tienda Lima Peru"
        params = urllib.parse.urlencode({
            "engine": "google_shopping",
            "q": search_query,
            "hl": "es",
            "api_key": SERPAPI_KEY,
        })
        url = f"https://serpapi.com/search.json?{params}"
        print(f"[DEBUG] SerpAPI URL query: {search_query}")

        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        print(f"[DEBUG] SerpAPI response keys: {list(data.keys())}")

        # Verificar si hay error en la respuesta
        if "error" in data:
            print(f"[WARN] SerpAPI error: {data['error']}")
            return _tiendas_fallback(prenda_es)

        shopping_results = data.get("shopping_results", [])
        print(f"[DEBUG] SerpAPI shopping_results count: {len(shopping_results)}")

        if not shopping_results:
            print("[WARN] SerpAPI no devolvió resultados, usando fallback")
            return _tiendas_fallback(prenda_es)

        # Debug: ver campos disponibles del primer resultado
        if shopping_results:
            print(f"[DEBUG] First result keys: {list(shopping_results[0].keys())}")
            print(f"[DEBUG] First result: {json.dumps(shopping_results[0], default=str)[:500]}")

        tiendas = []
        for item in shopping_results[:8]:
            source = item.get("source", "").lower()
            es_tienda_lima = any(t in source for t in TIENDAS_LIMA)

            # Asignar ubicación real si es tienda conocida
            ubicacion = _ubicacion_tienda(source) if es_tienda_lima else "Envío a Lima"

            # SerpAPI usa product_link o link según el resultado
            product_link = item.get("product_link") or item.get("link") or item.get("serpapi_product_api") or "#"

            tiendas.append({
                "nombre": item.get("source", "Tienda online"),
                "tipo": "fisica" if es_tienda_lima else "online",
                "producto": item.get("title", "Producto"),
                "precio": _extraer_precio(item.get("extracted_price", 0)),
                "tallas": ["S", "M", "L", "XL"],
                "ubicacion": ubicacion,
                "link": product_link,
                "disponible": True,
                "imagen": item.get("thumbnail", ""),
            })

        # Siempre agregar tiendas físicas de Lima para que esa sección no quede vacía
        tiendas_fisicas_fallback = _tiendas_fallback(prenda_es)
        tiendas.extend(tiendas_fisicas_fallback)

        return tiendas[:18]

    except Exception as e:
        print(f"[WARN] Error en SerpAPI: {str(e)}, usando fallback")
        return _tiendas_fallback(prenda_es)


def _ubicacion_tienda(source: str) -> str:
    """Devuelve ubicaciones reales en Lima para tiendas conocidas."""
    ubicaciones = {
        "falabella": "Jockey Plaza · San Isidro · Miraflores · Mall del Sur",
        "ripley": "Jockey Plaza · San Miguel · Mega Plaza · Mall del Sur",
        "oechsle": "Real Plaza Salaverry · Jockey Plaza · Plaza Norte",
        "hm": "Jockey Plaza · Real Plaza Salaverry",
        "h&m": "Jockey Plaza · Real Plaza Salaverry",
        "zara": "Jockey Plaza · Real Plaza Salaverry",
        "marathon": "Jockey Plaza · Real Plaza · Mall del Sur · Plaza Norte",
        "footloose": "Jockey Plaza · Mega Plaza · Mall Aventura",
        "platanitos": "Jockey Plaza · Real Plaza · Mall del Sur",
        "topitop": "Gamarra · Mega Plaza · Plaza Norte · Mall del Sur",
        "mercado libre": "Envío a todo Lima",
        "linio": "Envío a todo Lima",
    }
    for key, ubi in ubicaciones.items():
        if key in source:
            return ubi
    return "Lima, Perú"


def _tiendas_fallback(prenda_es: str) -> list:
    """Tiendas hardcodeadas en Lima como fallback."""
    tiendas_base = TIENDAS_FALLBACK.get(prenda_es, TIENDAS_FALLBACK["default"])

    # Agregar info del producto a cada tienda
    resultado = []
    for tienda in tiendas_base:
        resultado.append({
            **tienda,
            "producto": f"{prenda_es} — Disponible en tienda",
            "precio": 0,
            "tallas": ["S", "M", "L", "XL"],
            "imagen": "",
        })

    return resultado


def _estimar_material(prenda_en: str) -> str:
    """Estima material probable según tipo de prenda."""
    materiales = {
        "T-Shirt": "Algodón",
        "Polo Shirt": "Algodón / Piqué",
        "Shirt": "Algodón / Poliéster",
        "Jeans": "Denim / Algodón",
        "Pants": "Algodón / Poliéster",
        "Jacket": "Poliéster / Nylon",
        "Hoodie": "Algodón / Poliéster",
        "Sweater": "Lana / Acrílico",
        "Coat": "Lana / Poliéster",
        "Shorts": "Algodón / Nylon",
        "Sneakers": "Sintético / Mesh",
        "Suit": "Lana / Poliéster",
        "Dress": "Poliéster / Algodón",
        "Skirt": "Poliéster / Algodón",
        "Blouse": "Seda / Poliéster",
        "Top": "Algodón / Lycra",
        "Leggings": "Lycra / Spandex",
        "Cardigan": "Lana / Acrílico",
        "Heels": "Cuero sintético",
        "Sandals": "Cuero / Sintético",
        "Jumpsuit": "Poliéster / Algodón",
        "Swimwear": "Lycra / Nylon",
    }
    return materiales.get(prenda_en, "Textil mixto")


def _rango_precio(prenda_en: str) -> dict:
    """Rango de precio estimado en soles (PEN) para Lima."""
    precios = {
        "T-Shirt": {"min": 25, "max": 120},
        "Polo Shirt": {"min": 35, "max": 150},
        "Shirt": {"min": 60, "max": 250},
        "Jeans": {"min": 80, "max": 350},
        "Pants": {"min": 70, "max": 300},
        "Jacket": {"min": 120, "max": 500},
        "Hoodie": {"min": 80, "max": 250},
        "Sweater": {"min": 70, "max": 280},
        "Coat": {"min": 200, "max": 800},
        "Shorts": {"min": 40, "max": 150},
        "Sneakers": {"min": 150, "max": 600},
        "Suit": {"min": 300, "max": 1500},
        "Dress": {"min": 80, "max": 400},
        "Skirt": {"min": 50, "max": 200},
        "Blouse": {"min": 50, "max": 200},
        "Top": {"min": 30, "max": 120},
        "Leggings": {"min": 40, "max": 150},
        "Cardigan": {"min": 70, "max": 250},
        "Heels": {"min": 100, "max": 450},
        "Sandals": {"min": 60, "max": 250},
        "Jumpsuit": {"min": 100, "max": 350},
        "Swimwear": {"min": 60, "max": 250},
    }
    return precios.get(prenda_en, {"min": 50, "max": 300})


def _extraer_precio(precio_raw) -> float:
    """Extrae precio numérico limpio."""
    if isinstance(precio_raw, (int, float)):
        return round(float(precio_raw), 2)
    try:
        return round(float(str(precio_raw).replace(",", "")), 2)
    except (ValueError, TypeError):
        return 0.0


def _response(status_code: int, body: dict) -> dict:
    """Helper para respuestas HTTP con CORS headers."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }
