// Génère l'image d'aperçu de partage (1200 × 630) à partir de og/og.html avec Chrome en mode headless.
// Usage (depuis le dossier site) : node og/build-og.mjs
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--virtual-time-budget=6000',
  '--window-size=1200,630',
  `--screenshot=${resolve(here, '../public/og.png')}`,
  pathToFileURL(resolve(here, 'og.html')).href,
])
console.log('Image générée : public/og.png')
