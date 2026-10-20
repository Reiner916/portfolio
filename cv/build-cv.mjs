// Génère le PDF du CV (et un aperçu PNG) à partir de cv/cv.html avec Chrome en mode headless.
// Usage (depuis le dossier site) : node cv/build-cv.mjs
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const source = pathToFileURL(resolve(here, 'cv.html')).href
const outDir = resolve(here, '../public/cv')
mkdirSync(outDir, { recursive: true })

const common = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=8000']
execFileSync(chrome, [...common, '--no-pdf-header-footer', `--print-to-pdf=${resolve(outDir, 'CV_Amir_Chouchane.pdf')}`, source])
// Aperçu (A4 à 96 dpi ×2). Le site utilise cv-preview.webp (vignette, 900 px) et cv-full.webp (lecteur, 1588 px) :
// convertir ensuite le PNG (ex. avec Python/Pillow) puis supprimer le PNG.
execFileSync(chrome, [...common, '--window-size=794,1123', '--force-device-scale-factor=2', `--screenshot=${resolve(outDir, 'cv-preview.png')}`, source])
console.log('CV généré dans public/cv/')
