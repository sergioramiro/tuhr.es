#!/usr/bin/env python3
"""
Generador de infografías para tuhr.es
Usa Pillow + Playwright para crear imágenes profesionales
"""

from PIL import Image, ImageDraw, ImageFont
import os
import subprocess
import json

# Colores tuhr.es
PRIMARY = "#0e7c46"
PRIMARY_LIGHT = "#e8f5e9"
SURFACE = "#ffffff"
TEXT_DARK = "#1a1a1a"
TEXT_LIGHT = "#666666"

OUTPUT_DIR = "/home/sramiro/Repositories/tuhr.es/public/images"

def create_og_image(title, subtitle, filename, width=1200, height=630):
    """Crear imagen Open Graph para redes sociales"""
    img = Image.new('RGB', (width, height), SURFACE)
    draw = ImageDraw.Draw(img)

    # Fondo degradado verde
    for y in range(height):
        r = int(14 + (232-14) * y/height)
        g = int(124 + (245-124) * y/height)
        b = int(70 + (233-70) * y/height)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Logo/marca
    draw.text((60, 50), "tuhr.es", fill=SURFACE, font=get_font(36, bold=True))

    # Título
    draw.text((60, 200), title, fill=SURFACE, font=get_font(48, bold=True))

    # Subtítulo
    draw.text((60, 300), subtitle, fill=SURFACE, font=get_font(28))

    # Footer
    draw.text((60, height-80), "Herramientas gratuitas para trabajadores", fill=SURFACE, font=get_font(20))

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    img.save(os.path.join(OUTPUT_DIR, filename), quality=95)
    return os.path.join(OUTPUT_DIR, filename)

def create_infographic_svg(data, filename):
    """Crear infografía SVG para artículos"""
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="{SURFACE}"/>
    <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="{TEXT_DARK}">{data['title']}</text>
    {data['content']}
    <text x="400" y="580" text-anchor="middle" font-size="14" fill="{TEXT_LIGHT}">tuhr.es - Herramientas gratuitas para trabajadores</text>
</svg>'''

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, filename), 'w') as f:
        f.write(svg)
    return os.path.join(OUTPUT_DIR, filename)

def get_font(size, bold=False):
    """Obtener fuente del sistema"""
    try:
        if bold:
            return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except:
        return ImageFont.load_default()

def generate_finiquito_infographic():
    """Generar infografía del finiquito"""
    data = {
        'title': '¿Qué incluye tu finiquito?',
        'content': '''
        <rect x="300" y="80" width="200" height="60" rx="10" fill="#0e7c46"/>
        <text x="400" y="115" text-anchor="middle" font-size="18" font-weight="bold" fill="white">FINIQUITO</text>

        <line x1="400" y1="140" x2="400" y2="180" stroke="#0e7c46" stroke-width="3"/>
        <line x1="200" y1="180" x2="600" y2="180" stroke="#0e7c46" stroke-width="3"/>

        <line x1="150" y1="180" x2="150" y2="200" stroke="#0e7c46" stroke-width="2"/>
        <rect x="50" y="200" width="200" height="100" rx="8" fill="#e8f5e9" stroke="#0e7c46"/>
        <text x="150" y="230" text-anchor="middle" font-size="14" font-weight="bold" fill="#0e7c46">Salario del mes</text>
        <text x="150" y="255" text-anchor="middle" font-size="12" fill="#666">Días trabajados</text>
        <text x="150" y="280" text-anchor="middle" font-size="12" fill="#0e7c46">Ej: 871€</text>

        <line x1="350" y1="180" x2="350" y2="200" stroke="#0e7c46" stroke-width="2"/>
        <rect x="250" y="200" width="200" height="100" rx="8" fill="#e8f5e9" stroke="#0e7c46"/>
        <text x="350" y="230" text-anchor="middle" font-size="14" font-weight="bold" fill="#0e7c46">Pagas extras</text>
        <text x="350" y="255" text-anchor="middle" font-size="12" fill="#666">Parte proporcional</text>
        <text x="350" y="280" text-anchor="middle" font-size="12" fill="#0e7c46">Ej: 2.839€</text>

        <line x1="500" y1="180" x2="500" y2="200" stroke="#0e7c46" stroke-width="2"/>
        <rect x="450" y="200" width="200" height="100" rx="8" fill="#e8f5e9" stroke="#0e7c46"/>
        <text x="550" y="230" text-anchor="middle" font-size="14" font-weight="bold" fill="#0e7c46">Vacaciones</text>
        <text x="550" y="255" text-anchor="middle" font-size="12" fill="#666">Días pendientes</text>
        <text x="550" y="280" text-anchor="middle" font-size="12" fill="#0e7c46">Ej: 516€</text>

        <line x1="650" y1="180" x2="650" y2="200" stroke="#0e7c46" stroke-width="2"/>
        <rect x="550" y="200" width="200" height="100" rx="8" fill="#e8f5e9" stroke="#0e7c46"/>
        <text x="650" y="230" text-anchor="middle" font-size="14" font-weight="bold" fill="#0e7c46">Horas extra</text>
        <text x="650" y="255" text-anchor="middle" font-size="12" fill="#666">Pendientes</text>
        <text x="650" y="280" text-anchor="middle" font-size="12" fill="#0e7c46">Ej: 360€</text>

        <line x1="400" y1="300" x2="400" y2="350" stroke="#0e7c46" stroke-width="3"/>
        <rect x="250" y="350" width="300" height="80" rx="10" fill="#0e7c46"/>
        <text x="400" y="380" text-anchor="middle" font-size="18" font-weight="bold" fill="white">TOTAL: 4.586€</text>
        <text x="400" y="405" text-anchor="middle" font-size="14" fill="white">brutos</text>

        <text x="400" y="500" text-anchor="middle" font-size="16" fill="#666">Calcula tu finiquito en tuhr.es</text>
        '''
    }
    return create_infographic_svg(data, "infographic-finiquito.svg")

def generate_nomina_infographic():
    """Generar infografía de nómina"""
    data = {
        'title': 'Estructura de tu nómina',
        'content': '''
        <rect x="50" y="80" width="320" height="40" rx="6" fill="#0e7c46"/>
        <text x="210" y="105" text-anchor="middle" font-size="16" font-weight="bold" fill="white">DEVENGOS</text>

        <rect x="50" y="130" width="320" height="150" rx="6" fill="#e8f5e9" stroke="#0e7c46"/>
        <text x="70" y="160" font-size="14" fill="#1a1a1a">• Salario base</text>
        <text x="70" y="185" font-size="14" fill="#1a1a1a">• Complementos</text>
        <text x="70" y="210" font-size="14" fill="#1a1a1a">• Horas extra</text>
        <text x="70" y="235" font-size="14" fill="#1a1a1a">• Pagas extras</text>
        <text x="70" y="260" font-size="14" fill="#1a1a1a">• Plus varios</text>

        <rect x="430" y="80" width="320" height="40" rx="6" fill="#c62828"/>
        <text x="590" y="105" text-anchor="middle" font-size="16" font-weight="bold" fill="white">DEDUCCIONES</text>

        <rect x="430" y="130" width="320" height="150" rx="6" fill="#ffebee" stroke="#c62828"/>
        <text x="450" y="160" font-size="14" fill="#1a1a1a">• Seguridad Social (6,35%)</text>
        <text x="450" y="185" font-size="14" fill="#1a1a1a">• IRPF (19-47%)</text>
        <text x="450" y="210" font-size="14" fill="#1a1a1a">• Desempleo (1,55%)</text>
        <text x="450" y="235" font-size="14" fill="#1a1a1a">• Formación (0,10%)</text>
        <text x="450" y="260" font-size="14" fill="#1a1a1a">• Otros</text>

        <line x1="210" y1="280" x2="400" y2="350" stroke="#555" stroke-width="2"/>
        <line x1="590" y1="280" x2="400" y2="350" stroke="#555" stroke-width="2"/>

        <rect x="250" y="350" width="300" height="60" rx="8" fill="#1a1a1a"/>
        <text x="400" y="375" text-anchor="middle" font-size="16" font-weight="bold" fill="white">NÓMINA LÍQUIDA</text>
        <text x="400" y="395" text-anchor="middle" font-size="14" fill="#ccc">= Devengos − Deducciones</text>

        <text x="400" y="500" text-anchor="middle" font-size="16" fill="#666">Calcula tu nómina en tuhr.es</text>
        '''
    }
    return create_infographic_svg(data, "infographic-nomina.svg")

if __name__ == "__main__":
    print("Generando infografías...")

    # Infografías SVG
    finiquito_svg = generate_finiquito_infographic()
    print(f"✅ Finiquito SVG: {finiquito_svg}")

    nomina_svg = generate_nomina_infographic()
    print(f"✅ Nómina SVG: {nomina_svg}")

    # Imágenes Open Graph
    og_finiquito = create_og_image(
        "Todo sobre tu finiquito",
        "Guía completa: qué es, cómo calcularlo y tus derechos",
        "og-finiquito.jpg"
    )
    print(f"✅ OG Finiquito: {og_finiquito}")

    og_nomina = create_og_image(
        "Cómo calcular tu nómina",
        "Aprende a leer y calcular tu nómina paso a paso",
        "og-nomina.jpg"
    )
    print(f"✅ OG Nómina: {og_nomina}")

    print("\nInfografías generadas en:", OUTPUT_DIR)
