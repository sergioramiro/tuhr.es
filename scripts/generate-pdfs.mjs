#!/usr/bin/env node

/**
 * Generador de PDFs para plantillas de tuhr.es
 *
 * Convierte los archivos HTML de src/templates/ a PDF usando puppeteer-core.
 * Requiere Google Chrome o Chromium instalado.
 *
 * Uso: node scripts/generate-pdfs.mjs
 */

import puppeteer from 'puppeteer-core';
import { readdir, readFile } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'src', 'templates');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'plantillas', 'pdf');

// Chrome paths to try
const CHROME_PATHS = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
];

async function findChrome() {
  for (const p of CHROME_PATHS) {
    try {
      await readFile(p); // just check it exists
      return p;
    } catch {
      continue;
    }
  }
  throw new Error('Chrome/Chromium not found. Install google-chrome or chromium.');
}

async function generatePDFs() {
  const chromePath = await findChrome();
  console.log(`Using Chrome: ${chromePath}`);

  // Ensure output dir exists
  const { mkdir } = await import('fs/promises');
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Find all HTML files
  const files = (await readdir(TEMPLATES_DIR)).filter(f => f.endsWith('.html'));
  console.log(`Found ${files.length} templates\n`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const file of files) {
    const htmlPath = join(TEMPLATES_DIR, file);
    const pdfName = basename(file, '.html') + '.pdf';
    const pdfPath = join(OUTPUT_DIR, pdfName);

    try {
      const page = await browser.newPage();

      // Load HTML
      const html = await readFile(htmlPath, 'utf-8');
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: { top: '2cm', bottom: '2cm', left: '2.5cm', right: '2.5cm' },
        printBackground: true,
      });

      await page.close();
      console.log(`✓ ${pdfName}`);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\nDone! PDFs saved to ${OUTPUT_DIR}`);
}

generatePDFs().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
