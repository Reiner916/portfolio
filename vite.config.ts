import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Ajoute l'adresse publique du site aux balises de partage (canonical, og:url, og:image absolue),
// seulement si VITE_SITE_URL est renseignée dans .env (LinkedIn exige une image en URL absolue).
function siteUrl(url: string): Plugin {
  return {
    name: 'site-url',
    transformIndexHtml(html) {
      if (!url) return html
      return html
        .replace('content="/og.png"', `content="${url}/og.png"`)
        .replace('<meta property="og:type"', `<link rel="canonical" href="${url}/" />
    <meta property="og:url" content="${url}/" />
    <meta property="og:type"`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react(), tailwindcss(), siteUrl((env.VITE_SITE_URL ?? '').replace(/\/$/, ''))],
  }
})
