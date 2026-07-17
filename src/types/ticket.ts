import type { Squad } from '../config/squads'

export type RegionKey = 'chennai' | 'uk'

export type Ticket = {
  key?: string
  url?: string
  parentKey?: string
  summary?: string
  squad: Squad
  developer: string
  region: RegionKey
  status?: string
  statusCategory?: string
  workType?: string
  storyPoints?: number
  statusCategoryChanged?: string
  updated?: string
  /** ServiceNow support fields (Service OPS) */
  openedAt?: string
  closedAt?: string
  priority?: string
  category?: string
  subcategory?: string
  assignmentGroup?: string
  assignedTo?: string
  openedBy?: string
  closedBy?: string
  ageSeconds?: number
}

export type MergedTicket = Ticket & { regions: RegionKey[] }

export type WorkTypeStoryPointTicket = { key: string; storyPoints: number; url?: string }

export type WorkTypeStoryPointSide = { sp: number; count: number; noSpCount: number; tickets: WorkTypeStoryPointTicket[] }

export type WorkTypeStoryPointBucket = Record<RegionKey, WorkTypeStoryPointSide> & {
  totalSp: number
  totalCount: number
  totalNoSpCount: number
}

export type WorkTypeStoryPointTableTicket = WorkTypeStoryPointTicket & { href: string | null }

export type WorkTypeStoryPointTableSide = WorkTypeStoryPointSide & {
  visibleTickets: WorkTypeStoryPointTableTicket[]
  moreCount: number
}

export type WorkTypeStoryPointTableRow = {
  workType: string
  chennai: WorkTypeStoryPointTableSide
  uk: WorkTypeStoryPointTableSide
  totalSp: number
  totalCount: number
  totalNoSpCount: number
}
