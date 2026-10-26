// Compétences (les libellés sont dans i18n/*.json → skills.items.<clé>)
// level : 1 Découverte · 2 Notions · 3 Intermédiaire · 4 Confirmé · 5 Expert
// Niveaux tirés du CV, à ajuster par Amir.

export type Skill = { key: string; glyph: string; level: 1 | 2 | 3 | 4 | 5; projects?: number }

export const skillGroups: { key: 'support' | 'dev'; skills: Skill[] }[] = [
  {
    key: 'support',
    skills: [
      { key: 'windows', glyph: 'WIN', level: 4 },
      { key: 'hardware', glyph: 'HW', level: 4 },
      { key: 'helpdesk', glyph: 'TKT', level: 4 },
      { key: 'remote', glyph: 'RMT', level: 3 },
      { key: 'office', glyph: 'M365', level: 5 },
    ],
  },
  {
    key: 'dev',
    skills: [
      { key: 'nextjs', glyph: 'NX', level: 2, projects: 1 },
      { key: 'scripts', glyph: '>_', level: 3, projects: 1 },
      { key: 'htmlcss', glyph: '</>', level: 2 },
      { key: 'sql', glyph: 'SQL', level: 2 },
    ],
  },
]

// Défilé des technos (noms propres, non traduits)
export const marqueeTechs = [
  'Windows', 'Next.js', 'React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'SQL', 'GitHub', 'Vercel', 'TeamViewer', 'Parsec',
  'Microsoft 365', 'Outlook', 'Teams', 'Google Workspace', 'SSD NVMe', 'Tickets',
]
