#!/usr/bin/env python3
"""
Automatizar solicitudes de indexación en Google Search Console
"""
import time
from playwright.sync_api import sync_playwright

URLS_TO_INDEX = [
    "https://tuhr.es/calculadoras/horas-extra/",
    "https://tuhr.es/calculadoras/indemnizacion-despido/",
    "https://tuhr.es/blog/cuanto-cobro-si-me-despiden/",
    "https://tuhr.es/blog/baja-voluntaria-sin-preaviso/",
    "https://tuhr.es/blog/calcular-indemnizacion-despido/",
    "https://tuhr.es/guias/todo-sobre-tu-finiquito/",
    "https://tuhr.es/guias/como-calcular-nomina/",
]

GSC_BASE = "https://search.google.com/search-console?resource_id=sc-domain:tuhr.es"

def main():
    with sync_playwright() as p:
        # Connect to existing Chrome instance
        browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        context = browser.contexts[0]
        
        # Use existing page or create new one
        pages = context.pages
        page = None
        for pg in pages:
            if "search-console" in pg.url:
                page = pg
                break
        
        if not page:
            page = context.new_page()
        
        for url in URLS_TO_INDEX:
            print(f"\n{'='*60}")
            print(f"Procesando: {url}")
            print(f"{'='*60}")
            
            try:
                # Navigate to GSC
                page.goto(GSC_BASE, wait_until="networkidle", timeout=30000)
                time.sleep(2)
                
                # Find and fill search bar
                search_input = page.locator('input[aria-label*="Inspeccionar"]')
                search_input.click()
                search_input.fill(url)
                time.sleep(1)
                
                # Click search button
                search_button = page.locator('button[aria-label="Búsqueda"]')
                search_button.click()
                
                # Wait for inspection to complete
                print("Esperando inspección...")
                page.wait_for_selector('text=Solicitar indexación', timeout=60000)
                time.sleep(2)
                
                # Click "Solicitar indexación"
                print("Solicitando indexación...")
                request_btn = page.locator('button:has-text("Solicitar indexación")')
                request_btn.click()
                
                # Wait for completion dialog
                print("Esperando confirmación...")
                page.wait_for_selector('text=Se ha solicitado la indexación', timeout=120000)
                
                # Close dialog
                close_btn = page.locator('button:has-text("Cerrar")')
                close_btn.click()
                time.sleep(1)
                
                print(f"✅ {url} - Indexación solicitada")
                
            except Exception as e:
                print(f"❌ {url} - Error: {e}")
                # Try to recover
                try:
                    page.goto(GSC_BASE, wait_until="networkidle", timeout=30000)
                except:
                    pass

if __name__ == "__main__":
    main()
