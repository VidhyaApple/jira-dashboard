import type { Squad } from '../config/squads'
import type { RegionKey } from './ticket'

export type SquadCapacity = Record<RegionKey, number>
export type CapacityBySquad = Record<Squad, SquadCapacity>

export type CapacityBaselineMode = 'capacity' | 'filtered'

export type MonthlyBaselineValues = {
  chennai: number
  uk: number
  total: number
  monthsUsed: number
}
