export const SQUADS = ['SAM', 'AWM', 'Service OPS'] as const
export type Squad = (typeof SQUADS)[number]

export type SquadProfile = 'delivery' | 'support'

export const SQUAD_PROFILES: Record<Squad, SquadProfile> = {
  SAM: 'delivery',
  AWM: 'delivery',
  'Service OPS': 'support'
}

/** Folder name under public/sources/ (may differ from display label). */
export const SQUAD_DATA_DIRS: Record<Squad, string> = {
  SAM: 'SAM',
  AWM: 'AWM',
  'Service OPS': 'service_ops'
}

export function squadProfile (squad: Squad): SquadProfile {
  return SQUAD_PROFILES[squad]
}

export function isSupportSquad (squad: Squad): boolean {
  return squadProfile(squad) === 'support'
}

/** Display name (squad id is already the label). */
export function squadLabel (squad: Squad | string): string {
  return squad
}

export function squadDataDir (squad: Squad): string {
  return SQUAD_DATA_DIRS[squad]
}

export function supportDataPath (squad: Squad): string {
  return `/sources/${squadDataDir(squad)}/support.csv`
}

export function squadDataPaths (squad: Squad) {
  if (isSupportSquad(squad)) {
    return { support: supportDataPath(squad) }
  }
  const dir = squadDataDir(squad)
  return {
    chennai: `/sources/${dir}/ciec.csv`,
    team: `/sources/${dir}/team.csv`
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
