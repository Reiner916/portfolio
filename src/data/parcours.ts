// Parcours (textes dans i18n/*.json → parcours.items.<clé>). Ordre : du plus récent au plus ancien.

// Les étiquettes éventuelles sont dans parcours.items.<clé>.tags
export type ParcoursItem = { key: string }

// Expériences en lien avec l'informatique
export const experiences: ParcoursItem[] = [
  { key: 'devAssistant' },
  { key: 'support' },
  { key: 'selfTaught' },
]

// Formation
export const education: ParcoursItem[] = [{ key: 'bts' }, { key: 'mco' }, { key: 'bac' }]

// Autres expériences (affichées en version discrète)
export const otherJobs = ['warehouse', 'fishmonger', 'site'] as const
