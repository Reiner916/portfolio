// Données de la section À propos (les libellés sont dans i18n/*.json → about.*)

export type DayKind = 'company' | 'school'

// Rythme d'alternance sur 2 semaines (lundi → vendredi) : le mercredi alterne.
export const rhythmWeeks: DayKind[][] = [
  ['company', 'company', 'company', 'school', 'school'],
  ['company', 'company', 'school', 'school', 'school'],
]

// Échelle européenne des langues (CECRL)
export const cefrScale = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

export const languages = [
  { key: 'english', level: 'C1' },
  { key: 'spanish', level: 'B1' },
] as const
