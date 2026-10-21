import { reducedMotion } from './motionPreference'

// Fond animé du site, en GLSL. Le même code est utilisé :
//  - par le canvas plein écran derrière le site (AnimatedBackground)
//  - par la dalle de l'écran 3D, en coordonnées écran (gl_FragCoord)
// → à travers l'écran on voit exactement, au pixel près, le fond qu'on retrouve après la traversée.

export const backgroundGlsl = /* glsl */ `
uniform vec2 uResolution;
uniform float uTime;
uniform float uDpr;
uniform vec3 uBg;
uniform vec3 uAccent;
uniform vec3 uAccent2;

// Hash "sans sinus" de Dave Hoskins : petits multiplicateurs, donc stable même sur les puces graphiques
// qui calculent en précision réduite (l'ancien hash ×456 y créait des motifs répétés avec des coutures)
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

uniform float uOctaves; // 5 normalement, 3 en mode léger

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    if (float(i) >= uOctaves) break;
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 siteBackground(vec2 fragCoord) {
  vec2 uv = fragCoord / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  // Temps borné (cycle de 20 min) pour garder des coordonnées petites, donc précises
  float t = mod(uTime, 1200.0) * 0.045;

  // Bruit "déformé" : des voiles lumineux qui ondulent lentement (façon aurore)
  vec2 q = vec2(fbm(p * 2.2 + vec2(t, -t * 0.7)), fbm(p * 2.2 + vec2(-t * 0.8, t) + 4.3));
  float n = fbm(p * 1.8 + q * 2.4 + vec2(t * 0.5, -t * 0.3));

  vec3 col = uBg;
  // fbm reste autour de 0.5 : on étire sa plage pour avoir de vrais contrastes
  float veil = smoothstep(0.42, 0.66, n);
  float tint = smoothstep(0.4, 0.62, q.y);
  vec3 glow = mix(uAccent, uAccent2, tint * 0.8);
  col = mix(col, glow * 0.62, 0.3 + veil * 0.6);
  col += glow * pow(veil, 2.0) * 0.32;

  // Vignette
  float vig = smoothstep(1.25, 0.2, length(p * vec2(0.75, 1.05)));
  col = mix(uBg, col, mix(0.65, 1.0, vig));

  // Grille de points (tous les 28 px CSS) pour la touche "tech"
  vec2 cell = mod(fragCoord, 28.0 * uDpr) - 14.0 * uDpr;
  float dotMask = 1.0 - smoothstep(0.55 * uDpr, 1.25 * uDpr, length(cell));
  col += dotMask * 0.045 * vig;

  return col;
}
`

export function cssColorVec3(name: string): [number, number, number] {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace('#', '')
  const n = parseInt(hex, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

// Les deux canvas doivent avoir la même densité de pixels pour que la grille de points tombe au même endroit.
export const SHARED_DPR = Math.min(window.devicePixelRatio || 1, 1.5)


// Horloge commune aux deux canvas (figée si l'utilisateur demande moins d'animations).
export const sharedTime = () => (reducedMotion ? 0 : performance.now() / 1000)
