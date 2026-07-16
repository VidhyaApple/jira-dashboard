import { SQUADS } from '../config/squads'
import type { PeriodNote, PeriodNotesBySquad } from '../types/periodNotes'
import { PERIOD_NOTES_STORAGE_KEY } from '../types/periodNotes'

function emptyNotesBySquad (): PeriodNotesBySquad {
  return Object.fromEntries(SQUADS.map(s => [s, {}])) as PeriodNotesBySquad
}

export function loadPeriodNotes (): PeriodNotesBySquad {
  if (typeof window === 'undefined') return emptyNotesBySquad()
  const stored = localStorage.getItem(PERIOD_NOTES_STORAGE_KEY)
  if (!stored) return emptyNotesBySquad()
  try {
    const parsed = JSON.parse(stored) as Partial<PeriodNotesBySquad>
    const base = emptyNotesBySquad()
    for (const squad of SQUADS) {
      const row = parsed[squad]
      if (!row || typeof row !== 'object') continue
      const cleaned: Record<string, PeriodNote> = {}
      for (const [monthKey, note] of Object.entries(row)) {
        if (!note || typeof note.text !== 'string') continue
        const text = note.text.trim()
        if (!text) continue
        cleaned[monthKey] = {
          text,
          updatedAt: typeof note.updatedAt === 'string' ? note.updatedAt : new Date().toISOString()
        }
      }
      base[squad] = cleaned
    }
    return base
  } catch {
    return emptyNotesBySquad()
  }
}

export function savePeriodNotes (notes: PeriodNotesBySquad) {
  localStorage.setItem(PERIOD_NOTES_STORAGE_KEY, JSON.stringify(notes))
}

export function exportPeriodNotesJson (notes: PeriodNotesBySquad): string {
  return JSON.stringify(notes, null, 2)
}

export function parsePeriodNotesImport (raw: string): PeriodNotesBySquad | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PeriodNotesBySquad>
    const base = emptyNotesBySquad()
    for (const squad of SQUADS) {
      const row = parsed[squad]
      if (!row || typeof row !== 'object') continue
      const cleaned: Record<string, PeriodNote> = {}
      for (const [monthKey, note] of Object.entries(row)) {
        if (!note || typeof note.text !== 'string') continue
        const text = note.text.trim()
        if (!text) continue
        cleaned[monthKey] = {
          text,
          updatedAt: typeof note.updatedAt === 'string' ? note.updatedAt : new Date().toISOString()
        }
      }
      base[squad] = cleaned
    }
    return base
  } catch {
    return null
  }
}
