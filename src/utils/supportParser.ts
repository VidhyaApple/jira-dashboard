import type { Squad } from '../config/squads'
import type { Ticket } from '../types/ticket'
import { parseServiceNowDate } from './dates'

function stripBomKey (key: string): string {
  return key.replace(/^\uFEFF/, '')
}

function normRow (r: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(r)) {
    out[stripBomKey(k)] = v
  }
  return out
}

function parseAgeSeconds (value: unknown): number | undefined {
  if (value == null || String(value).trim() === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function parseSupportRows (json: Record<string, unknown>[], squad: Squad): Ticket[] {
  return json.map(raw => {
    const r = normRow(raw)
    const openedAt = parseServiceNowDate(r.Opened)
    const closedAt = parseServiceNowDate(r.Closed)
    const parent = r['Parent Incident'] as string | undefined

    return {
      key: r.Number as string | undefined,
      summary: r['Short Description'] as string | undefined,
      parentKey: parent?.trim() || undefined,
      squad,
      developer: 'support',
      region: 'uk' as const,
      status: r.State as string | undefined,
      statusCategory: r.State as string | undefined,
      workType: r.Category as string | undefined,
      storyPoints: 0,
      openedAt,
      closedAt,
      priority: r.Priority as string | undefined,
      category: r.Category as string | undefined,
      subcategory: r.Subcategory as string | undefined,
      assignmentGroup: r['Assignment group'] as string | undefined,
      assignedTo: r['Assigned to'] as string | undefined,
      openedBy: r['Opened by'] as string | undefined,
      closedBy: r['Closed by'] as string | undefined,
      ageSeconds: parseAgeSeconds(r['Age of Task'])
    }
  })
}
