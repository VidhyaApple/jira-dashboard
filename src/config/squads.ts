export const SQUADS = ['SAM', 'AWM', 'MINT'] as const
export type Squad = (typeof SQUADS)[number]

export type SquadProfile = 'delivery' | 'support'

export const SQUAD_PROFILES: Record<Squad, SquadProfile> = {
  SAM: 'delivery',
  AWM: 'delivery',
  MINT: 'support'
}

export function squadProfile (squad: Squad): SquadProfile {
  return SQUAD_PROFILES[squad]
}

export function isSupportSquad (squad: Squad): boolean {
  return squadProfile(squad) === 'support'
}

export function supportDataPath (squad: Squad): string {
  return `/sources/${squad}/support.csv`
}

export function squadDataPaths (squad: Squad) {
  if (isSupportSquad(squad)) {
    return { support: supportDataPath(squad) }
  }
  return {
    chennai: `/sources/${squad}/ciec.csv`,
    team: `/sources/${squad}/team.csv`
  }
}

export function squadStorageKey (squad: Squad): string {
  if (isSupportSquad(squad)) return `supportTickets:${squad}`
  return `jiraTickets:${squad}`
}

export const REGION_LABELS: Record<'chennai' | 'uk', string> = {
  chennai: 'CIEC',
  uk: 'Team'
}
