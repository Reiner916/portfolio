// Dimensions de la scène, en mètres (échelle réelle : bureau de 1,70 m, écran 27").

export const DESK = { y: 0.74, w: 1.7, d: 0.72, z: -0.07, thickness: 0.035 }
export const WALL_Z = -0.5

export const SCREEN = { w: 0.6, h: 0.3375 }
export const BEZEL = { side: 0.009, top: 0.009, bottom: 0.016, depth: 0.022 }
export const MONITOR = {
  w: SCREEN.w + BEZEL.side * 2,
  h: SCREEN.h + BEZEL.top + BEZEL.bottom,
  z: -0.22,
}
// Centre de la dalle (point visé par la caméra pendant la plongée)
export const SCREEN_CENTER = { x: 0, y: DESK.y + 0.31, z: MONITOR.z + BEZEL.depth / 2 + 0.0005 }

export const FOV = 30
