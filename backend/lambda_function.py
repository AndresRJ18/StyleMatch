"""
StyleMatch — Lambda Function v2
Analiza fotos de ropa con Rekognition y busca productos similares online (global).
"""

import json
import boto3
import base64
import uuid
import os
import urllib.request
import urllib.parse
from datetime import datetime

# Clients AWS
s3_client = boto3.client("s3")
rekognition_client = boto3.client("rekognition")

# Variables de entorno
BUCKET_NAME = os.environ.get("S3_BUCKET_NAME", "")
SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")

# ─────────────────────────────────────────────
# Catálogo de prendas (EN → ES)
# ─────────────────────────────────────────────

PRENDAS_HOMBRE = {
    "Shirt": "Camisa", "T-Shirt": "Polo / Camiseta", "Polo Shirt": "Polo",
    "Pants": "Pantalón", "Jeans": "Jean", "Jacket": "Chaqueta",
    "Hoodie": "Hoodie / Polera", "Sweater": "Suéter", "Coat": "Abrigo",
    "Shorts": "Short", "Sneakers": "Zapatillas", "Suit": "Traje",
    "Blazer": "Blazer", "Vest": "Chaleco", "Tank Top": "Polo sin mangas",
    "Overcoat": "Sobretodo", "Parka": "Parka", "Denim": "Jean",
    "Sweatshirt": "Buzo", "Cardigan": "Cardigan", "Tuxedo": "Esmoquin",
}

PRENDAS_MUJER = {
    "Dress": "Vestido", "Skirt": "Falda", "Blouse": "Blusa",
    "Top": "Top", "Leggings": "Leggings", "Cardigan": "Cardigan",
    "Heels": "Tacones", "Sandals": "Sandalias", "Jumpsuit": "Enterizo",
    "Swimwear": "Ropa de baño", "Blazer": "Blazer", "Coat": "Abrigo",
    "Jacket": "Chaqueta", "Pants": "Pantalón", "Jeans": "Jean",
    "Sweater": "Suéter", "Hoodie": "Hoodie", "Tank Top": "Top sin mangas",
    "Maxi Dress": "Vestido largo", "Mini Skirt": "Minifalda",
    "Romper": "Enterizo corto", "Bodysuit": "Body",
}

COLORES = {
    "Black": "Negro", "White": "Blanco", "Red": "Rojo", "Blue": "Azul",
    "Green": "Verde", "Gray": "Gris", "Grey": "Gris", "Brown": "Marrón",
    "Pink": "Rosado", "Yellow": "Amarillo", "Purple": "Morado",
    "Orange": "Naranja", "Beige": "Beige", "Navy": "Azul marino",
    "Maroon": "Guinda", "Cream": "Crema", "Tan": "Bronceado",
    "Olive": "Verde oliva", "Burgundy": "Burdeos", "Teal": "Verde azulado",
    "Coral": "Coral", "Ivory": "Marfil", "Khaki": "Caqui",
}

ESTILOS = {
    "Casual": "Casual", "Formal": "Formal", "Formal Wear": "Formal",
    "Sportswear": "Deportivo", "Elegant": "Elegante", "Urban": "Urbano",
    "Bohemian": "Bohemio", "Vintage": "Vintage", "Minimalist": "Minimalista",
    "Athleisure": "Athleisure", "Streetwear": "Streetwear",
}

# Palabras clave de Rekognition que sirven como descriptores para la búsqueda
# Estos no son prendas ni colores, pero ayudan a refinar la query
DESCRIPTORES_UTILES = {
    "Denim", "Leather", "Silk", "Cotton", "Wool", "Linen", "Velvet",
    "Plaid", "Striped", "Floral", "Polka Dot", "Checkered", "Camouflage",
    "Slim", "Oversize", "Cropped", "Long Sleeve", "Short Sleeve",
    "V-Neck", "Crew Neck", "Collar", "Button", "Zipper", "Hood",
    "Lace", "Embroidered", "Printed", "Knit", "Woven",
    "High Waist", "Low Rise", "Skinny", "Baggy", "Fitted",
    "Accessories", "Belt", "Tie", "Scarf", "Hat", "Sunglasses",
    "Watch", "Jewelry", "Necklace", "Bracelet", "Ring",
}

# Labels que NO aportan a la búsqueda de ropa (filtrar ruido)
LABELS_IGNORAR = {
    "Person", "Human", "People", "Adult", "Male", "Female", "Man", "Woman",
    "Face", "Head", "Portrait", "Photography", "Photo", "Selfie",
    "Standing", "Sitting", "Posing", "Indoors", "Outdoors",
    "Room", "Floor", "Wall", "Building", "Architecture",
    "Nature", "Plant", "Tree", "Sky", "Furniture",
}

OCASIONES = {
    "Casual": ["Día casual", "Fin de semana", "Salida con amigos"],
    "Formal": ["Reunión de trabajo", "Evento corporativo", "Cena formal"],
    "Deportivo": ["Gimnasio", "Running", "Actividad al aire libre"],
    "Elegante": ["Fiesta", "Cena especial", "Evento social"],
    "Urbano": ["Street style", "Salida nocturna", "Día casual"],
    "Bohemio": ["Festival", "Viaje", "Brunch"],
    "Vintage": ["Evento temático", "Salida casual", "Sesión de fotos"],
    "Minimalista": ["Oficina", "Reunión casual", "Día a día"],
    "Athleisure": ["Gym casual", "Brunch deportivo", "Día activo"],
    "Streetwear": ["Salida urbana", "Concierto", "Street style"],
}

CUANDO_USAR = {
    "Casual": "Ideal para días relajados, salidas informales o el fin de semana.",
    "Formal": "Perfecto para reuniones de trabajo, entrevistas o eventos corporativos.",
    "Deportivo": "Diseñado para actividad física, gimnasio o deporte al aire libre.",
    "Elegante": "Ideal para fiestas, cenas especiales o eventos donde quieras destacar.",
    "Urbano": "Perfecto para el día a día con un toque moderno y street style.",
    "Bohemio": "Ideal para festivales, viajes y momentos relajados con estilo libre.",
    "Vintage": "Perfecto para quienes aman lo retro y los looks con personalidad.",
    "Minimalista": "Para quienes prefieren la elegancia en la simplicidad.",
    "Athleisure": "Combina comodidad deportiva con estilo urbano.",
    "Streetwear": "Para destacar en la calle con un look urbano y moderno.",
}


def lambda_handler(event, context):
    """Handler principal de la Lambda."""
    try:
        # ─── PASO 1: Parsear body ───
        body = json.loads(event.get("body", "{}"))
        imagen_base64 = body.get("imagen_base64", "")
        genero = body.get("genero", "").lower()

        if not imagen_base64:
            return _response(400, {"success": False, "error": "Falta imagen_base64"})
        if genero not in ("hombre", "mujer"):
            return _response(400, {"success": False, "error": "genero debe ser 'hombre' o 'mujer'"})

        # ─── PASO 2: Subir imagen a S3 ───
        if "," in imagen_base64:
            imagen_base64 = imagen_base64.split(",", 1)[1]
        image_bytes = base64.b64decode(imagen_base64)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{uuid.uuid4().hex}_{timestamp}.jpg"
        s3_key = f"uploads/{genero}/{filename}"

        s3_client.put_object(
            Bucket=BUCKET_NAME, Key=s3_key,
            Body=image_bytes, ContentType="image/jpeg",
        )

        # ─── PASO 3: Rekognition con más detalle ───
        rekognition_response = rekognition_client.detect_labels(
            Image={"S3Object": {"Bucket": BUCKET_NAME, "Name": s3_key}},
            MaxLabels=30,       # Más labels para capturar detalles
            MinConfidence=55,   # Umbral más bajo para no perder descriptores
        )
        labels = rekognition_response.get("Labels", [])

        # ─── PASO 4: Procesar TODAS las etiquetas ───
        prendas_dict = {**PRENDAS_HOMBRE, **PRENDAS_MUJER} if genero == "mujer" else {**PRENDAS_MUJER, **PRENDAS_HOMBRE}
        # Priorizar el diccionario del género correcto
        prendas_dict = PRENDAS_HOMBRE if genero == "hombre" else PRENDAS_MUJER

        prenda_detectada = None
        color_detectado = None
        estilo_detectado = None
        descriptores = []       # Extras que enriquecen la búsqueda
        etiquetas_detalle = []
        all_label_names = []    # Todos los nombres para construir query inteligente

        for label in labels:
            nombre = label["Name"]
            confianza = label["Confidence"]

            # Ignorar labels que no aportan
            if nombre in LABELS_IGNORAR:
                continue

            etiquetas_detalle.append({"nombre": nombre, "confianza": round(confianza, 1)})
            all_label_names.append(nombre)

            # ── Detectar PRENDA ──
            if nombre in prendas_dict and (prenda_detectada is None or confianza > prenda_detectada["confianza"]):
                prenda_detectada = {"en": nombre, "es": prendas_dict[nombre], "confianza": confianza}

            # ── Detectar COLOR (3 estrategias) ──
            # 1. Label directo
            if nombre in COLORES and (color_detectado is None or confianza > color_detectado["confianza"]):
                color_detectado = {"en": nombre, "es": COLORES[nombre], "confianza": confianza}

            # 2. Color dentro del nombre compuesto (ej: "Black Jacket")
            if color_detectado is None:
                for color_en, color_es in COLORES.items():
                    if color_en.lower() in nombre.lower() and color_en != nombre:
                        color_detectado = {"en": color_en, "es": color_es, "confianza": confianza * 0.9}
                        break

            # 3. Color en Parents
            if color_detectado is None:
                for parent in label.get("Parents", []):
                    pn = parent.get("Name", "")
                    if pn in COLORES:
                        color_detectado = {"en": pn, "es": COLORES[pn], "confianza": confianza * 0.85}
                        break

            # ── Detectar ESTILO ──
            if nombre in ESTILOS and (estilo_detectado is None or confianza > estilo_detectado["confianza"]):
                estilo_detectado = {"en": nombre, "es": ESTILOS[nombre], "confianza": confianza}
            if estilo_detectado is None:
                for est_en, est_es in ESTILOS.items():
                    if est_en.lower() in nombre.lower():
                        estilo_detectado = {"en": est_en, "es": est_es, "confianza": confianza * 0.85}

            # ── Capturar DESCRIPTORES útiles ──
            if nombre in DESCRIPTORES_UTILES:
                descriptores.append(nombre)
            # También buscar descriptores dentro de nombres compuestos
            for desc in DESCRIPTORES_UTILES:
                if desc.lower() in nombre.lower() and desc not in descriptores:
                    descriptores.append(desc)

        # Defaults
        if prenda_detectada is None:
            prenda_detectada = {"en": "Clothing", "es": "Prenda no identificada", "confianza": 0}
        if color_detectado is None:
            color_detectado = {"en": "", "es": "No detectado", "confianza": 0}
        if estilo_detectado is None:
            estilo_detectado = {"en": "Casual", "es": "Casual", "confianza": 0}

        estilo_es = estilo_detectado["es"]

        # ─── PASO 5: Construir query INTELIGENTE en inglés ───
        query_en = _build_smart_query(
            prenda_en=prenda_detectada["en"],
            color_en=color_detectado["en"],
            estilo_en=estilo_detectado["en"],
            descriptores=descriptores,
            genero=genero,
            all_labels=all_label_names,
        )
        print(f"[INFO] Smart query: {query_en}")

        tiendas = _buscar_serpapi(query_en, prenda_detectada["es"])

        # ─── PASO 6: Respuesta ───
        resultado = {
            "success": True,
            "genero": genero,
            "prenda": {
                "tipo_es": prenda_detectada["es"],
                "tipo_en": prenda_detectada["en"],
                "color": color_detectado["es"],
                "color_en": color_detectado["en"],
                "estilo": estilo_es,
                "material_estimado": _estimar_material(prenda_detectada["en"]),
                "confianza": round(prenda_detectada["confianza"], 1),
                "cuando_usar": CUANDO_USAR.get(estilo_es, CUANDO_USAR["Casual"]),
                "ocasion": OCASIONES.get(estilo_es, OCASIONES["Casual"]),
                "tallas_disponibles": ["XS", "S", "M", "L", "XL", "XXL"],
                "precio_min": _rango_precio(prenda_detectada["en"])["min"],
                "precio_max": _rango_precio(prenda_detectada["en"])["max"],
                "etiquetas": etiquetas_detalle[:12],
                "descriptores": descriptores[:6],
                "query_busqueda": query_en,
            },
            "tiendas": tiendas,
        }

        return _response(200, resultado)

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return _response(500, {"success": False, "error": f"Error interno: {str(e)}"})


def _build_smart_query(prenda_en, color_en, estilo_en, descriptores, genero, all_labels):
    """
    Construye una query rica en inglés para Google Shopping.
    Ejemplo: "black formal blazer slim fit men" en vez de "Abrigo tienda Lima Peru"
    """
    parts = []

    # 1. Color primero (más importante para encontrar algo parecido)
    if color_en and color_en != "Unknown":
        parts.append(color_en.lower())

    # 2. Estilo si no es genérico
    if estilo_en and estilo_en not in ("Casual", "Unknown"):
        parts.append(estilo_en.lower())

    # 3. Prenda principal
    if prenda_en and prenda_en != "Clothing":
        parts.append(prenda_en.lower())
    else:
        # Si no detectó prenda, usar las labels de ropa más relevantes
        clothing_labels = [l for l in all_labels if l in {
            "Clothing", "Apparel", "Fashion", "Outfit", "Garment",
            "Blazer", "Jacket", "Shirt", "Pants", "Dress", "Coat",
        }]
        if clothing_labels:
            parts.append(clothing_labels[0].lower())

    # 4. Descriptores (máximo 3 para no hacer la query demasiado larga)
    desc_added = 0
    for desc in descriptores[:3]:
        if desc.lower() not in " ".join(parts):
            parts.append(desc.lower())
            desc_added += 1

    # 5. Género
    gender_word = "men" if genero == "hombre" else "women"
    parts.append(gender_word)

    # 6. "buy online" para resultados de compra
    parts.append("buy online")

    query = " ".join(parts)
    print(f"[DEBUG] Query parts: {parts}")
    return query


def _buscar_serpapi(query: str, prenda_es: str) -> list:
    """Busca productos en Google Shopping vía SerpAPI. Búsqueda global."""
    if not SERPAPI_KEY:
        print("[WARN] SERPAPI_KEY no configurada, usando fallback")
        return _tiendas_fallback(prenda_es)

    try:
        params = urllib.parse.urlencode({
            "engine": "google_shopping",
            "q": query,
            "hl": "en",    # Inglés para mejores resultados globales
            "api_key": SERPAPI_KEY,
        })
        url = f"https://serpapi.com/search.json?{params}"
        print(f"[DEBUG] SerpAPI query: {query}")

        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        if "error" in data:
            print(f"[WARN] SerpAPI error: {data['error']}")
            return _tiendas_fallback(prenda_es)

        shopping_results = data.get("shopping_results", [])
        print(f"[DEBUG] SerpAPI results: {len(shopping_results)}")

        if not shopping_results:
            print("[WARN] SerpAPI sin resultados, usando fallback")
            return _tiendas_fallback(prenda_es)

        tiendas = []
        for item in shopping_results[:18]:
            product_link = item.get("product_link") or item.get("link") or "#"

            tiendas.append({
                "nombre": item.get("source", "Tienda online"),
                "tipo": "online",
                "producto": item.get("title", "Producto"),
                "precio": _extraer_precio(item.get("extracted_price", 0)),
                "moneda": _detectar_moneda(item.get("price", "")),
                "precio_original": item.get("price", ""),
                "tallas": ["S", "M", "L", "XL"],
                "ubicacion": "Envío internacional",
                "link": product_link,
                "disponible": True,
                "imagen": item.get("thumbnail", ""),
                "rating": item.get("rating", None),
                "reviews": item.get("reviews", None),
            })

        return tiendas[:18]

    except Exception as e:
        print(f"[WARN] Error SerpAPI: {str(e)}, usando fallback")
        return _tiendas_fallback(prenda_es)


def _detectar_moneda(price_str: str) -> str:
    """Detecta la moneda del precio."""
    if not price_str:
        return "USD"
    if "S/" in price_str or "PEN" in price_str:
        return "PEN"
    if "€" in price_str or "EUR" in price_str:
        return "EUR"
    if "£" in price_str or "GBP" in price_str:
        return "GBP"
    return "USD"


def _tiendas_fallback(prenda_es: str) -> list:
    """Tiendas online globales como fallback."""
    fallback = [
        {"nombre": "Amazon", "link": f"https://www.amazon.com/s?k={urllib.parse.quote(prenda_es)}"},
        {"nombre": "ASOS", "link": f"https://www.asos.com/search/?q={urllib.parse.quote(prenda_es)}"},
        {"nombre": "Zara", "link": "https://www.zara.com"},
        {"nombre": "H&M", "link": "https://www2.hm.com"},
        {"nombre": "SHEIN", "link": f"https://www.shein.com/search?q={urllib.parse.quote(prenda_es)}"},
    ]
    return [{
        **t, "tipo": "online", "producto": f"{prenda_es} — Buscar en tienda",
        "precio": 0, "moneda": "USD", "precio_original": "",
        "tallas": ["S", "M", "L", "XL"], "ubicacion": "Envío internacional",
        "disponible": True, "imagen": "", "rating": None, "reviews": None,
    } for t in fallback]


def _estimar_material(prenda_en: str) -> str:
    """Estima material probable según tipo de prenda."""
    materiales = {
        "T-Shirt": "Algodón", "Polo Shirt": "Algodón / Piqué",
        "Shirt": "Algodón / Poliéster", "Jeans": "Denim / Algodón",
        "Pants": "Algodón / Poliéster", "Jacket": "Poliéster / Nylon",
        "Hoodie": "Algodón / Poliéster", "Sweater": "Lana / Acrílico",
        "Coat": "Lana / Poliéster", "Shorts": "Algodón / Nylon",
        "Sneakers": "Sintético / Mesh", "Suit": "Lana / Poliéster",
        "Blazer": "Lana / Poliéster", "Vest": "Poliéster / Lana",
        "Dress": "Poliéster / Algodón", "Skirt": "Poliéster / Algodón",
        "Blouse": "Seda / Poliéster", "Top": "Algodón / Lycra",
        "Leggings": "Lycra / Spandex", "Cardigan": "Lana / Acrílico",
        "Heels": "Cuero sintético", "Sandals": "Cuero / Sintético",
        "Jumpsuit": "Poliéster / Algodón", "Swimwear": "Lycra / Nylon",
        "Parka": "Nylon / Poliéster", "Tuxedo": "Lana / Seda",
        "Sweatshirt": "Algodón / Poliéster",
    }
    return materiales.get(prenda_en, "Textil mixto")


def _rango_precio(prenda_en: str) -> dict:
    """Rango de precio estimado en USD."""
    precios = {
        "T-Shirt": {"min": 10, "max": 50}, "Polo Shirt": {"min": 15, "max": 60},
        "Shirt": {"min": 20, "max": 80}, "Jeans": {"min": 30, "max": 120},
        "Pants": {"min": 25, "max": 100}, "Jacket": {"min": 40, "max": 200},
        "Hoodie": {"min": 25, "max": 90}, "Sweater": {"min": 25, "max": 100},
        "Coat": {"min": 60, "max": 300}, "Shorts": {"min": 15, "max": 60},
        "Sneakers": {"min": 50, "max": 200}, "Suit": {"min": 100, "max": 500},
        "Blazer": {"min": 50, "max": 250}, "Vest": {"min": 25, "max": 100},
        "Dress": {"min": 25, "max": 150}, "Skirt": {"min": 20, "max": 80},
        "Blouse": {"min": 20, "max": 80}, "Top": {"min": 10, "max": 50},
        "Leggings": {"min": 15, "max": 60}, "Cardigan": {"min": 25, "max": 90},
        "Heels": {"min": 30, "max": 150}, "Sandals": {"min": 20, "max": 80},
        "Jumpsuit": {"min": 30, "max": 120}, "Swimwear": {"min": 20, "max": 80},
    }
    return precios.get(prenda_en, {"min": 15, "max": 100})


def _extraer_precio(precio_raw) -> float:
    """Extrae precio numérico limpio."""
    if isinstance(precio_raw, (int, float)):
        return round(float(precio_raw), 2)
    try:
        return round(float(str(precio_raw).replace(",", "")), 2)
    except (ValueError, TypeError):
        return 0.0


def _response(status_code: int, body: dict) -> dict:
    """Helper para respuestas HTTP con CORS."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }
