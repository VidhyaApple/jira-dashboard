import type {
  Ticket,
  WorkTypeStoryPointBucket,
  WorkTypeStoryPointSide,
  WorkTypeStoryPointTableSide,
  WorkTypeStoryPointTicket
} from '../types/ticket'
import { jiraIssueUrl } from './jira'
import { effectiveStoryPoints, isMissingStoryPoints } from './storyPoints'

export const ISSUE_TYPE_ORDER = ['Epic', 'Story', 'Task', 'Sub-task', 'Subtask', 'Bug']

export const WORK_TYPE_COLORS: Record<string, string> = {
  Epic: '#8b5cf6',
  Story: '#6366f1',
  Task: '#0ea5e9',
  'Sub-task': '#06b6d4',
  Subtask: '#06b6d4',
  Bug: '#f43f5e'
}

export function issueTypeRank (workType?: string): number {
  if (!workType) return 99
  const idx = ISSUE_TYPE_ORDER.findIndex(t => t.toLowerCase() === workType.toLowerCase())
  return idx === -1 ? 50 : idx
}

export function workTypeColor (workType?: string): string {
  if (!workType) return '#64748b'
  const exact = WORK_TYPE_COLORS[workType]
  if (exact) return exact
  const match = Object.entries(WORK_TYPE_COLORS).find(([name]) => name.toLowerCase() === workType.toLowerCase())
  return match?.[1] ?? '#64748b'
}

export function sumStoryPointsByWorkType (tickets: Ticket[], assumeMissingSpAsOne = false): Record<string, number> {
  const m: Record<string, number> = {}
  for (const t of tickets) {
    if (!t.workType) continue
    m[t.workType] = (m[t.workType] || 0) + effectiveStoryPoints(t, assumeMissingSpAsOne)
  }
  return m
}

function makeWorkTypeStoryPointSide (): WorkTypeStoryPointSide {
  return { sp: 0, count: 0, noSpCount: 0, tickets: [] }
}

export function sortWorkTypeStoryPointTickets (tickets: WorkTypeStoryPointTicket[]): WorkTypeStoryPointTicket[] {
  return [...tickets].sort((a, b) => {
    const aHasSp = a.storyPoints > 0
    const bHasSp = b.storyPoints > 0
    if (aHasSp !== bHasSp) return aHasSp ? -1 : 1
    return b.storyPoints - a.storyPoints || a.key.localeCompare(b.key)
  })
}

export function buildWorkTypeStoryPointBuckets (
  rows: Ticket[],
  assumeMissingSpAsOne = false
): Record<string, WorkTypeStoryPointBucket> {
  const buckets: Record<string, WorkTypeStoryPointBucket> = {}
  for (const t of rows) {
    if (!t.workType) continue
    if (!buckets[t.workType]) {
      buckets[t.workType] = {
        chennai: makeWorkTypeStoryPointSide(),
        uk: makeWorkTypeStoryPointSide(),
        totalSp: 0,
        totalCount: 0,
        totalNoSpCount: 0
      }
    }
    const storyPoints = effectiveStoryPoints(t, assumeMissingSpAsOne)
    const side = buckets[t.workType]![t.region]
    side.sp += storyPoints
    side.count += 1
    if (isMissingStoryPoints(t)) {
      side.noSpCount += 1
    }
    side.tickets.push({ key: t.key || 'No key', storyPoints, url: t.url })
    if (t.region === 'uk') {
      buckets[t.workType]!.totalSp += storyPoints
      buckets[t.workType]!.totalCount += 1
      if (isMissingStoryPoints(t)) {
        buckets[t.workType]!.totalNoSpCount += 1
      }
    }
  }
  for (const bucket of Object.values(buckets)) {
    bucket.chennai.tickets = sortWorkTypeStoryPointTickets(bucket.chennai.tickets)
    bucket.uk.tickets = sortWorkTypeStoryPointTickets(bucket.uk.tickets)
  }
  return buckets
}

export function sortedWorkTypeStoryPointEntries (buckets: Record<string, WorkTypeStoryPointBucket>): [string, WorkTypeStoryPointBucket][] {
  return Object.entries(buckets).sort((a, b) => b[1].totalSp - a[1].totalSp || b[1].totalCount - a[1].totalCount)
}

export function toWorkTypeStoryPointTableSide (side: WorkTypeStoryPointSide): WorkTypeStoryPointTableSide {
  const visibleTickets = side.tickets.slice(0, 6).map(ticket => ({
    ...ticket,
    href: jiraIssueUrl(ticket)
  }))
  return {
    ...side,
    visibleTickets,
    moreCount: Math.max(side.tickets.length - visibleTickets.length, 0)
  }
}
