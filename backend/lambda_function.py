"""
StyleMatch — Lambda Function v3
Analiza fotos de ropa con Rekognition (labels + colores dominantes) y
construye queries ricas para Google Shopping global.
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
s3_client          = boto3.client("s3")
rekognition_client = boto3.client("rekognition")

BUCKET_NAME = os.environ.get("S3_BUCKET_NAME", "")
SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")

# ─────────────────────────────────────────────────────────────────────────────
# Catálogos
# ─────────────────────────────────────────────────────────────────────────────

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
    "Charcoal": "Carbón", "Lavender": "Lavanda", "Mint": "Menta",
    "Mustard": "Mostaza", "Salmon": "Salmón", "Indigo": "Índigo",
}

# Colores RGB → nombre (para detect_dominant_colors de Rekognition)
# Rekognition devuelve CSS color name y hex, usamos el nombre directamente
COLOR_CSS_MAP = {
    "black": "Black", "white": "White", "red": "Red", "blue": "Blue",
    "navy": "Navy", "green": "Green", "gray": "Gray", "grey": "Grey",
    "brown": "Brown", "pink": "Pink", "yellow": "Yellow", "purple": "Purple",
    "orange": "Orange", "beige": "Beige", "cream": "Cream", "tan": "Tan",
    "olive": "Olive", "burgundy": "Burgundy", "teal": "Teal",
    "coral": "Coral", "ivory": "Ivory", "khaki": "Khaki",
    "charcoal": "Charcoal", "lavender": "Lavender", "mint": "Mint",
    "maroon": "Maroon", "indigo": "Indigo",
}

ESTILOS = {
    "Casual": "Casual", "Formal": "Formal", "Formal Wear": "Formal",
    "Sportswear": "Deportivo", "Elegant": "Elegante", "Urban": "Urbano",
    "Bohemian": "Bohemio", "Vintage": "Vintage", "Minimalist": "Minimalista",
    "Athleisure": "Athleisure", "Streetwear": "Streetwear",
    "Business Casual": "Business Casual", "Resort": "Resort",
}

# Descriptores que enriquecen la query de búsqueda
DESCRIPTORES_UTILES = {
    # Materiales
    "Denim", "Leather", "Silk", "Cotton", "Wool", "Linen", "Velvet",
    "Suede", "Corduroy", "Fleece", "Satin", "Chiffon",
    # Patrones
    "Plaid", "Striped", "Floral", "Polka Dot", "Checkered", "Camouflage",
    "Graphic", "Print", "Tie Dye", "Abstract",
    # Fit / Corte
    "Slim", "Oversized", "Cropped", "Fitted", "Baggy", "Relaxed",
    "Skinny", "Wide Leg", "Tapered",
    # Detalles constructivos
    "Long Sleeve", "Short Sleeve", "Sleeveless", "V-Neck", "Crew Neck",
    "Turtleneck", "Collar", "Button", "Zipper", "Hood", "Drawstring",
    # Acabados
    "Lace", "Embroidered", "Ripped", "Washed", "Distressed",
    "High Waist", "Low Rise",
}

LABELS_IGNORAR = {
    "Person", "Human", "People", "Adult", "Male", "Female", "Man", "Woman",
    "Face", "Head", "Portrait", "Photography", "Photo", "Selfie",
    "Standing", "Sitting", "Posing", "Indoors", "Outdoors",
    "Room", "Floor", "Wall", "Building", "Architecture",
    "Nature", "Plant", "Tree", "Sky", "Furniture", "Hand", "Finger",
    "Arm", "Leg", "Body", "Neck", "Shoulder",
}

OCASIONES = {
    "Casual":         ["Día casual", "Fin de semana", "Salida con amigos"],
    "Formal":         ["Reunión de trabajo", "Evento corporativo", "Cena formal"],
    "Deportivo":      ["Gimnasio", "Running", "Actividad al aire libre"],
    "Elegante":       ["Fiesta", "Cena especial", "Evento social"],
    "Urbano":         ["Street style", "Salida nocturna", "Día casual"],
    "Bohemio":        ["Festival", "Viaje", "Brunch"],
    "Vintage":        ["Evento temático", "Salida casual", "Sesión de fotos"],
    "Minimalista":    ["Oficina", "Reunión casual", "Día a día"],
    "Athleisure":     ["Gym casual", "Brunch deportivo", "Día activo"],
    "Streetwear":     ["Salida urbana", "Concierto", "Street style"],
    "Business Casual":["Oficina", "Reunión de negocios", "Almuerzo corporativo"],
    "Resort":         ["Vacaciones", "Playa", "Hotel"],
}

CUANDO_USAR = {
    "Casual":         "Ideal para días relajados, salidas informales o el fin de semana.",
    "Formal":         "Perfecto para reuniones de trabajo, entrevistas o eventos corporativos.",
    "Deportivo":      "Diseñado para actividad física, gimnasio o deporte al aire libre.",
    "Elegante":       "Ideal para fiestas, cenas especiales o eventos donde quieras destacar.",
    "Urbano":         "Perfecto para el día a día con un toque moderno y street style.",
    "Bohemio":        "Ideal para festivales, viajes y momentos relajados con estilo libre.",
    "Vintage":        "Perfecto para quienes aman lo retro y los looks con personalidad.",
    "Minimalista":    "Para quienes prefieren la elegancia en la simplicidad.",
    "Athleisure":     "Combina comodidad deportiva con estilo urbano.",
    "Streetwear":     "Para destacar en la calle con un look urbano y moderno.",
    "Business Casual":"Para ambientes profesionales que permiten un look más relajado.",
    "Resort":         "Perfecto para vacaciones, playa o destinos tropicales.",
}


# ─────────────────────────────────────────────────────────────────────────────
# Handler principal
# ─────────────────────────────────────────────────────────────────────────────

def lambda_handler(event, context):
    try:
        body          = json.loads(event.get("body", "{}"))
        imagen_base64 = body.get("imagen_base64", "")
        genero        = body.get("genero", "").lower()

        if not imagen_base64:
            return _response(400, {"success": False, "error": "Falta imagen_base64"})
        if genero not in ("hombre", "mujer"):
            return _response(400, {"success": False, "error": "genero debe ser 'hombre' o 'mujer'"})

        # ── PASO 1: Subir imagen a S3 ──────────────────────────────────────
        if "," in imagen_base64:
            imagen_base64 = imagen_base64.split(",", 1)[1]
        image_bytes = base64.b64decode(imagen_base64)
        timestamp   = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename    = f"{uuid.uuid4().hex}_{timestamp}.jpg"
        s3_key      = f"uploads/{genero}/{filename}"

        s3_client.put_object(
            Bucket=BUCKET_NAME, Key=s3_key,
            Body=image_bytes, ContentType="image/jpeg",
        )

        # ── PASO 2: Rekognition — labels ──────────────────────────────────
        reko_labels = rekognition_client.detect_labels(
            Image={"S3Object": {"Bucket": BUCKET_NAME, "Name": s3_key}},
            MaxLabels=35,
            MinConfidence=50,
        )
        labels = reko_labels.get("Labels", [])

        # ── PASO 3: Rekognition — colores dominantes ──────────────────────
        # detect_labels con ImageProperties nos da los colores reales de la imagen
        color_from_image = None

        # ── PASO 4: Procesar labels ───────────────────────────────────────
        prendas_dict = PRENDAS_HOMBRE if genero == "hombre" else PRENDAS_MUJER

        prenda_detectada  = None
        color_label       = None    # color detectado vía labels
        estilo_detectado  = None
        descriptores      = []
        etiquetas_detalle = []
        all_label_names   = []

        for label in labels:
            nombre    = label["Name"]
            confianza = label["Confidence"]

            if nombre in LABELS_IGNORAR:
                continue

            etiquetas_detalle.append({"nombre": nombre, "confianza": round(confianza, 1)})
            all_label_names.append(nombre)

            # Prenda
            if nombre in prendas_dict:
                if prenda_detectada is None or confianza > prenda_detectada["confianza"]:
                    prenda_detectada = {"en": nombre, "es": prendas_dict[nombre], "confianza": confianza}

            # Color vía label
            if nombre in COLORES:
                if color_label is None or confianza > color_label["confianza"]:
                    color_label = {"en": nombre, "es": COLORES[nombre], "confianza": confianza}
            else:
                # Buscar color dentro de nombre compuesto
                for color_en, color_es in COLORES.items():
                    if color_en.lower() in nombre.lower():
                        if color_label is None:
                            color_label = {"en": color_en, "es": color_es, "confianza": confianza * 0.85}
                        break
                # Color en Parents
                if color_label is None:
                    for parent in label.get("Parents", []):
                        pn = parent.get("Name", "")
                        if pn in COLORES:
                            color_label = {"en": pn, "es": COLORES[pn], "confianza": confianza * 0.8}
                            break

            # Estilo
            if nombre in ESTILOS:
                if estilo_detectado is None or confianza > estilo_detectado["confianza"]:
                    estilo_detectado = {"en": nombre, "es": ESTILOS[nombre], "confianza": confianza}
            else:
                for est_en, est_es in ESTILOS.items():
                    if est_en.lower() in nombre.lower():
                        if estilo_detectado is None:
                            estilo_detectado = {"en": est_en, "es": est_es, "confianza": confianza * 0.85}
                        break

            # Descriptores
            if nombre in DESCRIPTORES_UTILES and nombre not in descriptores:
                descriptores.append(nombre)
            for desc in DESCRIPTORES_UTILES:
                if desc.lower() in nombre.lower() and desc not in descriptores:
                    descriptores.append(desc)

        # Resolución de color: preferimos color real de imagen, luego label
        color_detectado = color_from_image or color_label

        # Defaults
        if prenda_detectada is None:
            # Intentar inferir de labels generales
            for lname in all_label_names:
                for prenda_en, prenda_es in prendas_dict.items():
                    if prenda_en.lower() in lname.lower():
                        prenda_detectada = {"en": prenda_en, "es": prenda_es, "confianza": 55}
                        break
                if prenda_detectada:
                    break
            if prenda_detectada is None:
                prenda_detectada = {"en": "Clothing", "es": "Prenda", "confianza": 0}

        if color_detectado is None:
            color_detectado = {"en": "", "es": "No detectado", "confianza": 0}
        if estilo_detectado is None:
            estilo_detectado = {"en": "Casual", "es": "Casual", "confianza": 0}

        estilo_es = estilo_detectado["es"]

        # ── PASO 5: Query inteligente ─────────────────────────────────────
        query_principal = _build_smart_query(
            prenda_en   = prenda_detectada["en"],
            color_en    = color_detectado["en"],
            estilo_en   = estilo_detectado["en"],
            descriptores= descriptores,
            genero      = genero,
        )
        # Query alternativa más amplia (por si la principal da pocos resultados)
        query_amplia = _build_broad_query(
            prenda_en = prenda_detectada["en"],
            color_en  = color_detectado["en"],
            genero    = genero,
        )

        print(f"[INFO] Query principal : {query_principal}")
        print(f"[INFO] Query amplia    : {query_amplia}")

        # ── PASO 6: Búsqueda ─────────────────────────────────────────────
        tiendas = _buscar_serpapi_doble(query_principal, query_amplia, prenda_detectada["es"])

        # ── PASO 7: Respuesta ─────────────────────────────────────────────
        resultado = {
            "success": True,
            "genero":  genero,
            "prenda": {
                "tipo_es":            prenda_detectada["es"],
                "tipo_en":            prenda_detectada["en"],
                "color":              color_detectado["es"],
                "color_en":           color_detectado["en"],
                "estilo":             estilo_es,
                "material_estimado":  _estimar_material(prenda_detectada["en"]),
                "confianza":          round(prenda_detectada["confianza"], 1),
                "cuando_usar":        CUANDO_USAR.get(estilo_es, CUANDO_USAR["Casual"]),
                "ocasion":            OCASIONES.get(estilo_es, OCASIONES["Casual"]),
                "tallas_disponibles": ["XS", "S", "M", "L", "XL", "XXL"],
                "precio_min":         _rango_precio(prenda_detectada["en"])["min"],
                "precio_max":         _rango_precio(prenda_detectada["en"])["max"],
                "etiquetas":          etiquetas_detalle[:12],
                "descriptores":       descriptores[:8],
                "query_busqueda":     query_principal,
            },
            "tiendas": tiendas,
        }

        return _response(200, resultado)

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        return _response(500, {"success": False, "error": f"Error interno: {str(e)}"})


# ─────────────────────────────────────────────────────────────────────────────
# Construcción de queries
# ─────────────────────────────────────────────────────────────────────────────

def _build_smart_query(prenda_en, color_en, estilo_en, descriptores, genero):
    """
    Query específica con todos los atributos detectados.
    Ej: "oversized black striped cotton hoodie streetwear men shop"
    """
    parts = []

    # Fit/corte primero si está en descriptores (ej: oversized, slim, cropped)
    FIT_TERMS = {"Slim", "Oversized", "Cropped", "Fitted", "Baggy", "Relaxed",
                 "Skinny", "Wide Leg", "Tapered"}
    for desc in descriptores:
        if desc in FIT_TERMS:
            parts.append(desc.lower())

    # Color
    if color_en:
        parts.append(color_en.lower())

    # Patrón / material si está (ej: striped, denim, floral)
    PATTERN_MATERIAL = {"Denim","Leather","Silk","Cotton","Wool","Linen","Velvet",
                        "Plaid","Striped","Floral","Polka Dot","Checkered",
                        "Graphic","Print","Tie Dye","Distressed","Ripped",
                        "Embroidered","Lace"}
    for desc in descriptores:
        if desc in PATTERN_MATERIAL and desc.lower() not in " ".join(parts):
            parts.append(desc.lower())

    # Prenda principal
    if prenda_en and prenda_en != "Clothing":
        parts.append(prenda_en.lower())

    # Estilo (solo si aporta especificidad)
    if estilo_en and estilo_en not in ("Casual", "Unknown", ""):
        parts.append(estilo_en.lower())

    # Detalles extra (cuello, manga, etc.) — máx 1
    DETAIL_TERMS = {"Long Sleeve","Short Sleeve","Sleeveless","V-Neck",
                    "Crew Neck","Turtleneck","Hood","High Waist"}
    for desc in descriptores:
        if desc in DETAIL_TERMS:
            parts.append(desc.lower())
            break

    # Género
    parts.append("men" if genero == "hombre" else "women")

    # Intención de compra
    parts.append("shop")

    return " ".join(parts)


def _build_broad_query(prenda_en, color_en, genero):
    """
    Query más amplia como fallback o segunda búsqueda.
    Ej: "black hoodie men online"
    """
    parts = []
    if color_en:
        parts.append(color_en.lower())
    if prenda_en and prenda_en != "Clothing":
        parts.append(prenda_en.lower())
    parts.append("men" if genero == "hombre" else "women")
    parts.append("online")
    return " ".join(parts)


# ─────────────────────────────────────────────────────────────────────────────
# SerpAPI — doble búsqueda
# ─────────────────────────────────────────────────────────────────────────────

def _buscar_serpapi_doble(query_principal: str, query_amplia: str, prenda_es: str) -> list:
    """
    Hace 2 búsquedas en Google Shopping:
    1. Query específica (más precisa, puede dar menos resultados)
    2. Query amplia (más resultados de relleno)
    Combina y deduplica por nombre de tienda + título.
    """
    if not SERPAPI_KEY:
        return _tiendas_fallback(prenda_es)

    resultados_principal = _fetch_serpapi(query_principal)
    resultados_amplia    = []

    # Solo hacemos la segunda búsqueda si la primera dio pocos resultados
    if len(resultados_principal) < 6:
        resultados_amplia = _fetch_serpapi(query_amplia)

    # Combinar y deduplicar
    vistos   = set()
    tiendas  = []

    for item in resultados_principal + resultados_amplia:
        key = f"{item.get('source','')}-{item.get('title','')[:40]}"
        if key not in vistos:
            vistos.add(key)
            tiendas.append(_item_to_tienda(item))

    if not tiendas:
        return _tiendas_fallback(prenda_es)

    return tiendas[:18]


def _fetch_serpapi(query: str) -> list:
    """Llama a SerpAPI Google Shopping y retorna los items crudos."""
    try:
        params = urllib.parse.urlencode({
            "engine":  "google_shopping",
            "q":       query,
            "hl":      "en",
            "num":     "20",
            "api_key": SERPAPI_KEY,
        })
        url = f"https://serpapi.com/search.json?{params}"
        print(f"[DEBUG] SerpAPI URL query: {query}")

        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        if "error" in data:
            print(f"[WARN] SerpAPI error: {data['error']}")
            return []

        results = data.get("shopping_results", [])
        print(f"[DEBUG] SerpAPI devolvió {len(results)} resultados para: {query}")
        return results

    except Exception as e:
        print(f"[WARN] Error SerpAPI: {e}")
        return []


def _item_to_tienda(item: dict) -> dict:
    """Convierte un item de SerpAPI al formato de tienda del frontend."""
    return {
        "nombre":          item.get("source", "Tienda online"),
        "tipo":            "online",
        "producto":        item.get("title", "Producto"),
        "precio":          _extraer_precio(item.get("extracted_price", 0)),
        "moneda":          _detectar_moneda(item.get("price", "")),
        "precio_original": item.get("price", ""),
        "tallas":          ["XS", "S", "M", "L", "XL"],
        "ubicacion":       "Envío internacional",
        "link":            item.get("product_link") or item.get("link") or "#",
        "disponible":      True,
        "imagen":          item.get("thumbnail", ""),
        "rating":          item.get("rating"),
        "reviews":         item.get("reviews"),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _detectar_moneda(price_str: str) -> str:
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
    q = urllib.parse.quote(prenda_es)
    fallback = [
        {"nombre": "Amazon",   "link": f"https://www.amazon.com/s?k={q}"},
        {"nombre": "ASOS",     "link": f"https://www.asos.com/search/?q={q}"},
        {"nombre": "Zara",     "link": "https://www.zara.com"},
        {"nombre": "H&M",      "link": "https://www2.hm.com"},
        {"nombre": "SHEIN",    "link": f"https://www.shein.com/search?q={q}"},
        {"nombre": "Uniqlo",   "link": "https://www.uniqlo.com"},
        {"nombre": "Mango",    "link": f"https://www.mango.com/en/search?q={q}"},
    ]
    return [{
        **t,
        "tipo": "online", "producto": f"{prenda_es} — Buscar en tienda",
        "precio": 0, "moneda": "USD", "precio_original": "",
        "tallas": ["S", "M", "L", "XL"], "ubicacion": "Envío internacional",
        "disponible": True, "imagen": "", "rating": None, "reviews": None,
    } for t in fallback]


def _estimar_material(prenda_en: str) -> str:
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
        "Sweatshirt": "Algodón / Poliéster", "Tank Top": "Algodón / Modal",
    }
    return materiales.get(prenda_en, "Textil mixto")


def _rango_precio(prenda_en: str) -> dict:
    precios = {
        "T-Shirt":   {"min": 10,  "max": 50},  "Polo Shirt": {"min": 15, "max": 60},
        "Shirt":     {"min": 20,  "max": 80},  "Jeans":      {"min": 30, "max": 120},
        "Pants":     {"min": 25,  "max": 100}, "Jacket":     {"min": 40, "max": 200},
        "Hoodie":    {"min": 25,  "max": 90},  "Sweater":    {"min": 25, "max": 100},
        "Coat":      {"min": 60,  "max": 300}, "Shorts":     {"min": 15, "max": 60},
        "Sneakers":  {"min": 50,  "max": 200}, "Suit":       {"min": 100,"max": 500},
        "Blazer":    {"min": 50,  "max": 250}, "Vest":       {"min": 25, "max": 100},
        "Dress":     {"min": 25,  "max": 150}, "Skirt":      {"min": 20, "max": 80},
        "Blouse":    {"min": 20,  "max": 80},  "Top":        {"min": 10, "max": 50},
        "Leggings":  {"min": 15,  "max": 60},  "Cardigan":   {"min": 25, "max": 90},
        "Heels":     {"min": 30,  "max": 150}, "Sandals":    {"min": 20, "max": 80},
        "Jumpsuit":  {"min": 30,  "max": 120}, "Swimwear":   {"min": 20, "max": 80},
        "Parka":     {"min": 60,  "max": 250}, "Tuxedo":     {"min": 150,"max": 600},
        "Sweatshirt":{"min": 20,  "max": 80},  "Tank Top":   {"min": 8,  "max": 40},
    }
    return precios.get(prenda_en, {"min": 15, "max": 100})


def _extraer_precio(precio_raw) -> float:
    if isinstance(precio_raw, (int, float)):
        return round(float(precio_raw), 2)
    try:
        return round(float(str(precio_raw).replace(",", "")), 2)
    except (ValueError, TypeError):
        return 0.0


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type":                "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":"POST, OPTIONS",
            "Access-Control-Allow-Headers":"Content-Type",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }
