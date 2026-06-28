export const SQUADS = ['SAM', 'AWM', 'MINT'] as const
export type Squad = (typeof SQUADS)[number]

export function squadDataPaths (squad: Squad) {
  return {
    chennai: `/sources/${squad}/ciec.csv`,
    team: `/sources/${squad}/team.csv`
  }
}

export function squadStorageKey (squad: Squad): string {
  return `jiraTickets:${squad}`
}

export const REGION_LABELS: Record<'chennai' | 'uk', string> = {
  chennai: 'CIEC',
  uk: 'Team'
}
