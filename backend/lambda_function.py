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
    "Shoe": "Zapato", "Boot": "Bota", "Hat": "Sombrero", "Cap": "Gorra",
    "Beanie": "Gorro", "Tie": "Corbata", "Belt": "Cinturón",
    "Sock": "Calcetines", "Underwear": "Ropa interior", "Tracksuit": "Buzo deportivo",
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
    "Shoe": "Zapato", "Boot": "Bota", "Hat": "Sombrero", "Cap": "Gorra",
    "Bag": "Bolso", "Purse": "Cartera", "Scarf": "Bufanda",
    "Bikini": "Bikini", "Lingerie": "Lencería", "Tights": "Medias",
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

# Mapa extendido de nombres CSS → color en nuestro catálogo
COLOR_CSS_MAP = {
    # Negros
    "black": "Black",
    # Blancos
    "white": "White", "snow": "White", "ivory": "Ivory", "floralwhite": "White",
    "ghostwhite": "White", "whitesmoke": "White", "mintcream": "White",
    "aliceblue": "White", "honeydew": "White", "azure": "White",
    "lavenderblush": "White", "mistyrose": "White",
    # Grises
    "gray": "Gray", "grey": "Gray", "silver": "Gray",
    "lightgray": "Gray", "lightgrey": "Gray", "gainsboro": "Gray",
    "dimgray": "Gray", "dimgrey": "Gray",
    "slategray": "Gray", "slategrey": "Gray",
    "lightslategray": "Gray", "lightslategrey": "Gray",
    # Carbón / Gris oscuro
    "charcoal": "Charcoal",
    "darkgray": "Charcoal", "darkgrey": "Charcoal",
    "darkslategray": "Charcoal", "darkslategrey": "Charcoal",
    # Azules
    "blue": "Blue", "mediumblue": "Blue", "royalblue": "Blue",
    "dodgerblue": "Blue", "cornflowerblue": "Blue", "steelblue": "Blue",
    "deepskyblue": "Blue", "lightskyblue": "Blue", "skyblue": "Blue",
    "lightblue": "Blue", "powderblue": "Blue",
    # Azul marino
    "navy": "Navy", "navyblue": "Navy", "darkblue": "Navy",
    "midnightblue": "Navy",
    # Índigo
    "indigo": "Indigo", "slateblue": "Indigo", "mediumslateblue": "Indigo",
    "darkslateblue": "Indigo", "blueviolet": "Indigo",
    # Teal / Cian
    "teal": "Teal", "darkcyan": "Teal", "cyan": "Teal", "aqua": "Teal",
    "lightcyan": "Teal", "aquamarine": "Teal", "turquoise": "Teal",
    "mediumturquoise": "Teal", "darkturquoise": "Teal",
    "paleturquoise": "Teal", "cadetblue": "Teal",
    # Verdes
    "green": "Green", "darkgreen": "Green", "forestgreen": "Green",
    "limegreen": "Green", "seagreen": "Green", "mediumseagreen": "Green",
    "springgreen": "Green", "palegreen": "Green", "lightgreen": "Green",
    "darkseagreen": "Green", "lime": "Green",
    # Oliva
    "olive": "Olive", "olivedrab": "Olive", "darkolivegreen": "Olive",
    "yellowgreen": "Olive",
    # Menta
    "mint": "Mint", "mintcream": "Mint", "mediumaquamarine": "Mint",
    # Rojos
    "red": "Red", "darkred": "Red", "crimson": "Red",
    "firebrick": "Red", "indianred": "Red", "tomato": "Red",
    # Coral / Salmón
    "coral": "Coral", "lightcoral": "Coral",
    "salmon": "Salmon", "darksalmon": "Salmon", "lightsalmon": "Salmon",
    # Rosas
    "pink": "Pink", "hotpink": "Pink", "deeppink": "Pink",
    "lightpink": "Pink", "palevioletred": "Pink", "mediumvioletred": "Pink",
    "fuchsia": "Pink", "magenta": "Pink",
    # Morados
    "purple": "Purple", "darkviolet": "Purple", "violet": "Purple",
    "darkorchid": "Purple", "orchid": "Purple",
    "mediumpurple": "Purple", "thistle": "Lavender", "plum": "Purple",
    "mediumorchid": "Purple",
    # Lavanda
    "lavender": "Lavender",
    # Marrones
    "brown": "Brown", "saddlebrown": "Brown", "sienna": "Brown",
    "chocolate": "Brown", "peru": "Brown", "rosybrown": "Brown",
    "sandybrown": "Brown",
    # Beige / Crema
    "beige": "Beige", "cream": "Cream", "tan": "Tan",
    "burlywood": "Beige", "wheat": "Beige", "navajowhite": "Beige",
    "bisque": "Beige", "moccasin": "Beige", "linen": "Beige",
    "antiquewhite": "Beige", "cornsilk": "Beige", "blanchedalmond": "Beige",
    "peachpuff": "Beige", "papayawhip": "Beige", "oldlace": "Beige",
    # Naranja
    "orange": "Orange", "darkorange": "Orange", "orangered": "Red",
    # Amarillo / Mostaza
    "yellow": "Yellow", "lightyellow": "Yellow", "lemonchiffon": "Yellow",
    "gold": "Mustard", "goldenrod": "Mustard", "darkgoldenrod": "Mustard",
    "palegoldenrod": "Beige",
    # Caqui
    "khaki": "Khaki", "darkkhaki": "Khaki",
    # Guinda / Burdeos
    "maroon": "Maroon", "burgundy": "Burgundy",
    "darkmagenta": "Maroon", "rebeccapurple": "Purple",
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

PATRONES = {
    "Plaid":         "a cuadros",
    "Striped":       "a rayas",
    "Floral":        "floral",
    "Polka Dot":     "con lunares",
    "Checkered":     "a cuadros",
    "Camouflage":    "camuflaje",
    "Graphic":       "gráfico",
    "Print":         "estampado",
    "Tie Dye":       "tie-dye",
    "Abstract":      "abstracto",
    "Animal Print":  "animal print",
    "Paisley":       "paisley",
    "Houndstooth":   "pata de gallo",
    "Argyle":        "argyle",
    "Leopard":       "leopardo",
    "Zebra":         "cebra",
    "Tartan":        "tartán",
    "Geometric":     "geométrico",
    "Solid":         "liso",
}

LABELS_IGNORAR = {
    "Person", "Human", "People", "Adult", "Male", "Female", "Man", "Woman",
    "Face", "Head", "Portrait", "Photography", "Photo", "Selfie",
    "Standing", "Sitting", "Posing", "Indoors", "Outdoors",
    "Room", "Floor", "Wall", "Building", "Architecture",
    "Nature", "Plant", "Tree", "Sky", "Furniture", "Hand", "Finger",
    "Arm", "Leg", "Body", "Neck", "Shoulder",
}

CATEGORIA_PRENDA = {
    "T-Shirt": "top", "Shirt": "top", "Polo Shirt": "top",
    "Blouse": "top", "Top": "top", "Tank Top": "top",
    "Sweatshirt": "top", "Hoodie": "top", "Sweater": "top", "Cardigan": "top",
    "Pants": "bottom", "Jeans": "bottom", "Shorts": "bottom",
    "Skirt": "bottom", "Leggings": "bottom", "Mini Skirt": "bottom",
    "Jacket": "outerwear", "Coat": "outerwear", "Blazer": "outerwear",
    "Parka": "outerwear", "Vest": "outerwear", "Overcoat": "outerwear",
    "Sneakers": "footwear", "Shoe": "footwear", "Boot": "footwear",
    "Heels": "footwear", "Sandals": "footwear",
    "Dress": "full", "Jumpsuit": "full", "Romper": "full",
    "Tuxedo": "full", "Suit": "full", "Tracksuit": "full", "Swimwear": "full",
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

        # ── PASO 2: Rekognition — labels + colores dominantes ────────────
        reko_labels = rekognition_client.detect_labels(
            Image={"S3Object": {"Bucket": BUCKET_NAME, "Name": s3_key}},
            MaxLabels=40,
            MinConfidence=50,
            Features=["GENERAL_LABELS", "IMAGE_PROPERTIES"],
        )
        labels = reko_labels.get("Labels", [])
        # Debug: mostrar colores de instancias con RGB
        for lbl in labels:
            if lbl.get("Instances"):
                info = []
                for inst in lbl["Instances"]:
                    for ic in inst.get("DominantColors", [])[:2]:
                        css = ic.get("CSSColor","?")
                        rgb = (ic.get("Red",0), ic.get("Green",0), ic.get("Blue",0))
                        info.append(f"{css}{rgb}")
                if info:
                    print(f"[DEBUG] {lbl['Name']} → {info}")

        # ── PASO 3: Extraer colores dominantes de ImageProperties ────────
        dom_colors_list = []
        dom_colors = reko_labels.get("ImageProperties", {}).get("DominantColors", [])
        for dc in dom_colors[:8]:
            css  = dc.get("CSSColor", "").lower().strip()
            simp = dc.get("SimplifiedColor", "").lower().strip()
            pct  = dc.get("PixelPercent", 0)
            r, g, b = dc.get("Red", 0), dc.get("Green", 0), dc.get("Blue", 0)
            mapped = COLOR_CSS_MAP.get(css) or COLOR_CSS_MAP.get(simp)
            if not mapped and (r or g or b):
                mapped = _rgb_to_color_name(r, g, b)
            if mapped and mapped in COLORES:
                if not dom_colors_list or dom_colors_list[-1]["en"] != mapped:
                    dom_colors_list.append({
                        "en": mapped, "es": COLORES[mapped], "confianza": round(pct, 1),
                    })
        color_from_image = dom_colors_list[0] if dom_colors_list else None

        # Foreground colors — más específicos para ropa que la imagen completa
        fg_colors_list = []
        fg_dom = reko_labels.get("ImageProperties", {}).get("Foreground", {}).get("DominantColors", [])
        for dc in fg_dom[:8]:
            css  = dc.get("CSSColor", "").lower().strip()
            simp = dc.get("SimplifiedColor", "").lower().strip()
            pct  = dc.get("PixelPercent", 0)
            r, g, b = dc.get("Red", 0), dc.get("Green", 0), dc.get("Blue", 0)
            mapped = COLOR_CSS_MAP.get(css) or COLOR_CSS_MAP.get(simp)
            if not mapped and (r or g or b):
                mapped = _rgb_to_color_name(r, g, b)
            if mapped and mapped in COLORES:
                if not fg_colors_list or fg_colors_list[-1]["en"] != mapped:
                    fg_colors_list.append({"en": mapped, "es": COLORES[mapped], "confianza": round(pct, 1)})

        if fg_colors_list:
            print(f"[DEBUG] Foreground colors: {[(c['en'], c['confianza']) for c in fg_colors_list[:4]]}")

        # Preferir foreground si tiene datos, sino usar lista global
        best_colors_list = fg_colors_list if fg_colors_list else dom_colors_list
        color_from_image = best_colors_list[0] if best_colors_list else color_from_image

        # ── PASO 4: Procesar labels ───────────────────────────────────────
        prendas_dict = PRENDAS_HOMBRE if genero == "hombre" else PRENDAS_MUJER

        prendas_por_categoria = {}   # categoria → mejor prenda en esa categoría
        color_label           = None    # color detectado vía labels
        estilo_detectado  = None
        descriptores      = []
        etiquetas_detalle = []
        all_label_names   = []
        patrones_detectados = []

        for label in labels:
            nombre    = label["Name"]
            confianza = label["Confidence"]

            if nombre in LABELS_IGNORAR:
                continue

            etiquetas_detalle.append({"nombre": nombre, "confianza": round(confianza, 1)})
            all_label_names.append(nombre)

            # Prenda — track por categoría, con color específico de la instancia detectada
            if nombre in prendas_dict:
                cat = CATEGORIA_PRENDA.get(nombre, "other")
                prev = prendas_por_categoria.get(cat)
                prenda_color_hint = None

                # 1. DominantColors de la instancia del label (color del objeto específico)
                for instance in label.get("Instances", []):
                    for ic in instance.get("DominantColors", [])[:3]:
                        css  = ic.get("CSSColor", "").lower().strip()
                        simp = ic.get("SimplifiedColor", "").lower().strip()
                        ir, ig, ib = ic.get("Red", 0), ic.get("Green", 0), ic.get("Blue", 0)
                        mapped = COLOR_CSS_MAP.get(css) or COLOR_CSS_MAP.get(simp)
                        if not mapped and (ir or ig or ib):
                            mapped = _rgb_to_color_name(ir, ig, ib)
                        if mapped and mapped in COLORES:
                            prenda_color_hint = {"en": mapped, "es": COLORES[mapped], "confianza": ic.get("PixelPercent", 0)}
                            break
                    if prenda_color_hint:
                        break

                # 2. Color en el nombre del label (ej: "Blue Denim Jeans")
                if not prenda_color_hint:
                    label_text = nombre.lower()
                    for alias in label.get("Aliases", []):
                        label_text += " " + alias.get("Name", "").lower()
                    for color_en, color_es in COLORES.items():
                        if color_en.lower() in label_text:
                            prenda_color_hint = {"en": color_en, "es": color_es, "confianza": confianza}
                            break

                # 3. Color en Parents del label
                if not prenda_color_hint:
                    for parent in label.get("Parents", []):
                        pn = parent.get("Name", "")
                        if pn in COLORES:
                            prenda_color_hint = {"en": pn, "es": COLORES[pn], "confianza": confianza * 0.8}
                            break

                if prev is None or confianza > prev["confianza"]:
                    prendas_por_categoria[cat] = {
                        "en": nombre, "es": prendas_dict[nombre],
                        "confianza": confianza, "color": prenda_color_hint,
                    }

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

            # Patrón de la prenda
            if nombre in PATRONES and nombre not in [pt["en"] for pt in patrones_detectados]:
                patrones_detectados.append({"en": nombre, "es": PATRONES[nombre], "confianza": confianza})
            else:
                for pat_en, pat_es in PATRONES.items():
                    if pat_en.lower() in nombre.lower() and pat_en not in [pt["en"] for pt in patrones_detectados]:
                        patrones_detectados.append({"en": pat_en, "es": pat_es, "confianza": confianza * 0.85})
                        break

        patrones_detectados.sort(key=lambda x: x["confianza"], reverse=True)

        # Resolución de color: preferimos color real de imagen, luego label
        color_detectado = color_from_image or color_label

        # Resolver lista de prendas candidatas
        prendas_candidatas = sorted(
            prendas_por_categoria.values(),
            key=lambda x: x["confianza"], reverse=True
        )
        prendas_candidatas = [p for p in prendas_candidatas if p["confianza"] >= 55][:3]

        # Si alguna categoría "full" (vestido, traje), no dividir
        if any(CATEGORIA_PRENDA.get(p["en"]) == "full" for p in prendas_candidatas):
            prendas_candidatas = prendas_candidatas[:1]

        # Fallback si no se detectó ninguna
        if not prendas_candidatas:
            prenda_fallback = None
            for lname in all_label_names:
                for prenda_en, prenda_es in prendas_dict.items():
                    if prenda_en.lower() in lname.lower():
                        prenda_fallback = {"en": prenda_en, "es": prenda_es, "confianza": 55}
                        break
                if prenda_fallback:
                    break
            if prenda_fallback is None:
                prenda_fallback = {"en": "Clothing", "es": "Prenda", "confianza": 0}
            prendas_candidatas = [prenda_fallback]

        es_outfit = len(prendas_candidatas) >= 2
        prenda_detectada = prendas_candidatas[0]  # backward compat para queries

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
        # Query alternativa más amplia (segunda búsqueda siempre)
        query_amplia = _build_broad_query(
            prenda_en = prenda_detectada["en"],
            color_en  = color_detectado["en"],
            genero    = genero,
        )
        # Query de variante por estilo (tercer nivel, solo si pocas tiendas)
        query_variante = _build_style_query(
            prenda_en = prenda_detectada["en"],
            estilo_en = estilo_detectado["en"],
            genero    = genero,
        )

        print(f"[INFO] Query principal : {query_principal}")
        print(f"[INFO] Query amplia    : {query_amplia}")
        print(f"[INFO] Query variante  : {query_variante}")

        # ── PASO 6: Búsqueda por cada prenda ─────────────────────────────
        prendas_resultado = []
        for idx_p, prenda in enumerate(prendas_candidatas):
            # Color específico por prenda:
            # 1. Color extraído del nombre del label (más fiable)
            # 2. Color dominante por índice (cada prenda usa un color distinto)
            # 3. Color global detectado (fallback)
            color_prenda = prenda.get("color")
            if not color_prenda and idx_p < len(best_colors_list):
                color_prenda = best_colors_list[idx_p]
            if not color_prenda:
                color_prenda = color_detectado
            if not color_prenda:
                color_prenda = {"en": "", "es": "No detectado", "confianza": 0}

            print(f"[INFO] Prenda {idx_p+1}: {prenda['en']} → color: {color_prenda['en']}")

            if es_outfit:
                q = _build_broad_query(prenda["en"], color_prenda["en"], genero)
                tiendas_prenda = _buscar_serpapi_simple(q, prenda["es"])
            else:
                tiendas_prenda = _buscar_serpapi_doble(
                    query_principal, query_amplia, prenda["es"], query_variante
                )
            patron = patrones_detectados[0] if patrones_detectados else None
            prendas_resultado.append({
                "tipo_es":            prenda["es"],
                "tipo_en":            prenda["en"],
                "color":              color_prenda["es"],
                "color_en":           color_prenda["en"],
                "patron":             patron["es"] if patron else None,
                "patron_en":          patron["en"] if patron else None,
                "estilo":             estilo_es,
                "material_estimado":  _estimar_material(prenda["en"]),
                "confianza":          round(prenda["confianza"], 1),
                "cuando_usar":        CUANDO_USAR.get(estilo_es, CUANDO_USAR["Casual"]),
                "ocasion":            OCASIONES.get(estilo_es, OCASIONES["Casual"]),
                "tallas_disponibles": ["XS", "S", "M", "L", "XL", "XXL"],
                "precio_min":         _rango_precio(prenda["en"])["min"],
                "precio_max":         _rango_precio(prenda["en"])["max"],
                "etiquetas":          etiquetas_detalle[:12],
                "descriptores":       descriptores[:8],
                "query_busqueda":     _build_broad_query(prenda["en"], color_prenda["en"], genero) if es_outfit else query_principal,
                "tiendas":            tiendas_prenda,
            })

        # ── PASO 7: Respuesta ─────────────────────────────────────────────
        resultado = {
            "success":   True,
            "genero":    genero,
            "es_outfit": es_outfit,
            "prendas":   prendas_resultado,
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
    Query más amplia como segunda búsqueda.
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


def _build_style_query(prenda_en, estilo_en, genero):
    """
    Query por estilo/prenda pura sin color — tercer nivel de variedad.
    Ej: "streetwear hoodie men buy"
    """
    parts = []
    if estilo_en and estilo_en not in ("Casual", "Unknown", ""):
        parts.append(estilo_en.lower())
    if prenda_en and prenda_en != "Clothing":
        parts.append(prenda_en.lower())
    parts.append("men" if genero == "hombre" else "women")
    parts.append("buy")
    return " ".join(parts)


# ─────────────────────────────────────────────────────────────────────────────
# SerpAPI — doble búsqueda
# ─────────────────────────────────────────────────────────────────────────────

def _score_tienda(t: dict) -> float:
    """Score de calidad para ordenar tiendas: imagen > precio > rating > reviews."""
    score = 0.0
    if t.get("imagen"):                      score += 5.0
    if t.get("precio", 0) > 0:              score += 3.0
    if t.get("rating"):                      score += float(t["rating"]) * 1.5
    if t.get("reviews"):                     score += min(float(t["reviews"]) / 100, 3.0)
    return score


def _buscar_serpapi_doble(query_principal: str, query_amplia: str, prenda_es: str,
                          query_variante: str = "") -> list:
    """
    Hace hasta 3 búsquedas en Google Shopping:
    1. Query específica (siempre)
    2. Query amplia (siempre)
    3. Query de estilo/variante (solo si < 12 resultados únicos tras 1+2)
    Aplica cap de 3 productos por fuente, ordena por calidad y retorna hasta 18.
    """
    if not SERPAPI_KEY:
        return _tiendas_fallback(prenda_es)

    # Siempre ejecutar ambas queries
    resultados_principal = _fetch_serpapi(query_principal)
    resultados_amplia    = _fetch_serpapi(query_amplia)

    # Combinar con cap de 3 por fuente y deduplicar
    vistos        = set()
    tiendas       = []
    conteo_fuente = {}

    for item in resultados_principal + resultados_amplia:
        fuente = item.get("source", "")
        if conteo_fuente.get(fuente, 0) >= 3:
            continue
        conteo_fuente[fuente] = conteo_fuente.get(fuente, 0) + 1
        key = f"{fuente}-{item.get('title','')[:40]}"
        if key not in vistos:
            vistos.add(key)
            tiendas.append(_item_to_tienda(item))

    # Tercera query de variante si hay pocas opciones diversas
    if len(tiendas) < 12 and query_variante:
        resultados_variante = _fetch_serpapi(query_variante)
        for item in resultados_variante:
            fuente = item.get("source", "")
            if conteo_fuente.get(fuente, 0) >= 3:
                continue
            conteo_fuente[fuente] = conteo_fuente.get(fuente, 0) + 1
            key = f"{fuente}-{item.get('title','')[:40]}"
            if key not in vistos:
                vistos.add(key)
                tiendas.append(_item_to_tienda(item))

    if not tiendas:
        return _tiendas_fallback(prenda_es)

    # Ordenar por calidad y retornar los mejores 18
    tiendas.sort(key=_score_tienda, reverse=True)
    return tiendas[:18]


def _buscar_serpapi_simple(query: str, prenda_es: str) -> list:
    """Un solo fetch para outfit mode — source-capped, quality-sorted."""
    if not SERPAPI_KEY:
        return _tiendas_fallback(prenda_es)
    resultados = _fetch_serpapi(query)
    vistos, tiendas, conteo_fuente = set(), [], {}
    for item in resultados:
        fuente = item.get("source", "")
        if conteo_fuente.get(fuente, 0) >= 3:
            continue
        conteo_fuente[fuente] = conteo_fuente.get(fuente, 0) + 1
        key = f"{fuente}-{item.get('title','')[:40]}"
        if key not in vistos:
            vistos.add(key)
            tiendas.append(_item_to_tienda(item))
    if not tiendas:
        return _tiendas_fallback(prenda_es)
    tiendas.sort(key=_score_tienda, reverse=True)
    return tiendas[:18]


def _rgb_to_color_name(r: int, g: int, b: int) -> str:
    """Clasifica valores RGB al color más cercano en nuestro catálogo."""
    lum   = r * 0.299 + g * 0.587 + b * 0.114
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    delta = max_c - min_c
    sat   = delta / max_c if max_c > 0 else 0

    # Acromático (poco saturado)
    if sat < 0.12 or delta < 20:
        if lum < 45:   return "Black"
        if lum < 90:   return "Charcoal"
        if lum < 175:  return "Gray"
        return "White"

    # Calcular tono
    if max_c == r:
        hue = 60 * ((g - b) / delta % 6)
    elif max_c == g:
        hue = 60 * ((b - r) / delta + 2)
    else:
        hue = 60 * ((r - g) / delta + 4)
    hue = hue % 360

    if hue < 20 or hue >= 340:           # Rojo
        return "Maroon" if lum < 70 else ("Coral" if lum > 180 else "Red")
    elif hue < 45:                        # Naranja
        return "Orange"
    elif hue < 65:                        # Amarillo-naranja / Mostaza
        return "Mustard" if lum < 160 else "Yellow"
    elif hue < 80:                        # Amarillo
        return "Yellow"
    elif hue < 150:                       # Verde
        return "Olive" if lum < 90 else "Green"
    elif hue < 195:                       # Verde-cian / Teal
        return "Teal"
    elif hue < 255:                       # Azul
        if lum < 50:  return "Navy"
        if hue > 235: return "Indigo"
        return "Blue"
    elif hue < 285:                       # Azul-morado / Índigo
        return "Indigo"
    elif hue < 325:                       # Morado
        return "Purple"
    else:                                 # Rosa-rojo
        return "Pink" if lum > 150 else "Red"


def _fetch_serpapi(query: str) -> list:
    """Llama a SerpAPI Google Shopping y retorna los items crudos."""
    try:
        params = urllib.parse.urlencode({
            "engine":  "google_shopping",
            "q":       query,
            "hl":      "en",
            "gl":      "us",
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
