import { defineStore } from 'pinia'
import { SQUADS, type Squad } from '../config/squads'
import {
  CAPACITY_STORAGE_KEY,
  monthlyCapacitySp,
  SP_PER_DEV_PER_DAY,
  WORKING_DAYS_PER_MONTH
} from '../config/capacity'
import type { CapacityBySquad, SquadCapacity } from '../types/capacity'
import type { RegionKey } from '../types/ticket'

function emptyCapacity (): SquadCapacity {
  return { chennai: 0, uk: 0 }
}

function defaultCapacityBySquad (): CapacityBySquad {
  return Object.fromEntries(SQUADS.map(s => [s, emptyCapacity()])) as CapacityBySquad
}

function loadCapacity (): CapacityBySquad {
  if (typeof window === 'undefined') return defaultCapacityBySquad()
  const stored = localStorage.getItem(CAPACITY_STORAGE_KEY)
  if (!stored) return defaultCapacityBySquad()
  try {
    const parsed = JSON.parse(stored) as Partial<CapacityBySquad>
    const base = defaultCapacityBySquad()
    for (const squad of SQUADS) {
      const row = parsed[squad]
      if (!row) continue
      base[squad] = {
        chennai: Math.max(0, Number(row.chennai) || 0),
        uk: Math.max(0, Number(row.uk) || 0)
      }
    }
    return base
  } catch {
    return defaultCapacityBySquad()
  }
}

export const useCapacityStore = defineStore('capacity', {
  state: () => ({
    bySquad: loadCapacity()
  }),

  getters: {
    spPerDevPerDay: () => SP_PER_DEV_PER_DAY,
    workingDaysPerMonth: () => WORKING_DAYS_PER_MONTH,

    squadCapacity: state => (squad: Squad): SquadCapacity => {
      return state.bySquad[squad] ?? emptyCapacity()
    },

    regionMonthlyBaseline: state => (squad: Squad, region: RegionKey): number => {
      const devs = state.bySquad[squad]?.[region] ?? 0
      return monthlyCapacitySp(devs)
    },

    squadMonthlyBaseline: state => (squad: Squad) => {
      const cap = state.bySquad[squad] ?? emptyCapacity()
      const chennai = monthlyCapacitySp(cap.chennai)
      const uk = monthlyCapacitySp(cap.uk)
      return { chennai, uk, total: chennai + uk }
    },

    hasSquadCapacity: state => (squad: Squad): boolean => {
      const cap = state.bySquad[squad] ?? emptyCapacity()
      return cap.chennai > 0 || cap.uk > 0
    }
  },

  actions: {
    save () {
      localStorage.setItem(CAPACITY_STORAGE_KEY, JSON.stringify(this.bySquad))
    },

    setDevelopers (squad: Squad, region: RegionKey, count: number) {
      if (!this.bySquad[squad]) this.bySquad[squad] = emptyCapacity()
      this.bySquad[squad][region] = Math.max(0, Math.floor(count) || 0)
      this.save()
    }
  }
})
