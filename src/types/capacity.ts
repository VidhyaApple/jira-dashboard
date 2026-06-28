import type { Squad } from '../config/squads'
import type { RegionKey } from './ticket'

export type SquadCapacity = Record<RegionKey, number>
export type CapacityBySquad = Record<Squad, SquadCapacity>
