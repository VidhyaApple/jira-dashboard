import type { Ticket } from '../types/ticket'
import { jiraIssueUrl } from './jira'
import { effectiveStoryPoints } from './storyPoints'

export type TicketListItem = {
  key: string
  summary?: string
  status?: string
  workType?: string
  storyPoints: number
  region: string
  href: string | null
}

export function toTicketListItems (
  tickets: Ticket[],
  assumeMissingSpAsOne = false
): TicketListItem[] {
  return tickets
    .map(t => ({
      key: t.key || 'No key',
      summary: t.summary,
      status: t.status,
      workType: t.workType,
      storyPoints: effectiveStoryPoints(t, assumeMissingSpAsOne),
      region: t.region,
      href: jiraIssueUrl({ key: t.key || 'No key', url: t.url })
    }))
    .sort((a, b) => b.storyPoints - a.storyPoints || a.key.localeCompare(b.key))
}
