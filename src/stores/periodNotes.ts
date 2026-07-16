import { defineStore } from 'pinia'
import type { Squad } from '../config/squads'
import type { PeriodNote, PeriodNotesBySquad } from '../types/periodNotes'
import {
  exportPeriodNotesJson,
  loadPeriodNotes,
  parsePeriodNotesImport,
  savePeriodNotes
} from '../utils/periodNotes'

export const usePeriodNotesStore = defineStore('periodNotes', {
  state: () => ({
    bySquad: loadPeriodNotes() as PeriodNotesBySquad
  }),

  getters: {
    getNote: state => (squad: Squad, monthKey: string): PeriodNote | null => {
      return state.bySquad[squad]?.[monthKey] ?? null
    },

    noteText: state => (squad: Squad, monthKey: string): string => {
      return state.bySquad[squad]?.[monthKey]?.text ?? ''
    },

    notesForMonths: state => (squad: Squad, monthKeys: string[]): Record<string, string> => {
      const out: Record<string, string> = {}
      const squadNotes = state.bySquad[squad] ?? {}
      for (const key of monthKeys) {
        const text = squadNotes[key]?.text
        if (text) out[key] = text
      }
      return out
    }
  },

  actions: {
    persist () {
      savePeriodNotes(this.bySquad)
    },

    setNote (squad: Squad, monthKey: string, text: string) {
      const trimmed = text.trim()
      if (!this.bySquad[squad]) this.bySquad[squad] = {}
      if (!trimmed) {
        delete this.bySquad[squad][monthKey]
      } else {
        this.bySquad[squad][monthKey] = {
          text: trimmed,
          updatedAt: new Date().toISOString()
        }
      }
      this.persist()
    },

    exportJson (): string {
      return exportPeriodNotesJson(this.bySquad)
    },

    importJson (raw: string): boolean {
      const parsed = parsePeriodNotesImport(raw)
      if (!parsed) return false
      this.bySquad = parsed
      this.persist()
      return true
    }
  }
})
