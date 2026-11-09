// Projets (textes dans i18n/*.json → projects.items.<clé>).
// Pour ajouter un projet : une entrée ici + ses textes dans fr.json / en.json.
// shots : captures dans /public/projects. night = capture principale, day = même page en mode jour
// (révélée par un balayage au scroll), extra = capture flottante en superposition.
// Sans capture, la maquette animée correspondant à `visual` est affichée.

export type Project = {
  key: string
  featured?: boolean
  stack: string[]
  visual: 'browser' | 'terminal' | 'vision'
  shots?: { night: string; day?: string; extra?: string }
  demo?: string
  github?: string
}

export const projects: Project[] = [
  {
    key: 'directory',
    featured: true,
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    visual: 'browser',
    shots: { night: '/projects/annuaire-home.webp', day: '/projects/annuaire-home-light.webp', extra: '/projects/annuaire-offre.webp' },
    github: 'https://github.com/Reiner916/codes-parrainage',
  },
  {
    key: 'cleaner',
    stack: ['Batch (.bat)', 'Windows'],
    visual: 'terminal',
  },
  {
    key: 'bot7ds',
    stack: ['Python', 'YOLO11 · ONNX', 'OpenCV', 'API Win32'],
    visual: 'vision',
    github: 'https://github.com/Reiner916/7ds-grand-cross-story-bot',
  },
]

// Étapes vues par le bot 7DS (images tirées du GIF de démo, légendes dans projects.items.bot7ds.steps)
export const botSteps = Array.from({ length: 7 }, (_, i) => `/projects/bot7ds/step-${i + 1}.webp`)

// Ce qu'affiche le terminal du script de nettoyage (les vraies commandes du .bat)
export const cleanerTerminal = {
  file: 'Clean Temporary Files.bat',
  lines: [
    { text: 'Delete All Temporary Files?', tone: 'prompt' },
    { text: 'Del /S /F /Q %temp%', tone: 'command' },
    { text: 'Del /S /F /Q %Windir%\\Temp', tone: 'command' },
    { text: 'Del /S /F /Q C:\\WINDOWS\\Prefetch', tone: 'command' },
    { text: 'All Temporary Files Successfully Deleted!', tone: 'success' },
  ],
} as const
