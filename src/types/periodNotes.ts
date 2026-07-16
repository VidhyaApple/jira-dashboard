import type { Squad } from '../config/squads'

export type PeriodNote = {
  text: string
  updatedAt: string
}

/** squad → monthKey (YYYY-MM) → note */
export type PeriodNotesBySquad = Record<Squad, Record<string, PeriodNote>>

export const PERIOD_NOTES_STORAGE_KEY = 'jira-dashboard-period-notes'
