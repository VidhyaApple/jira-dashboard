import type { WorkTypeStoryPointTicket } from '../types/ticket'

export const JIRA_BROWSE_BASE =
  (import.meta.env.VITE_JIRA_BROWSE_BASE as string | undefined)?.replace(/\/$/, '') ?? ''

export function parseParentKey (r: Record<string, unknown>): string | undefined {
  const direct = r['Parent key'] ?? r['Parent Key'] ?? r['Parent issue key'] ?? r['Parent Issue Key']
  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  const parent = r.Parent
  if (typeof parent === 'string' && parent.trim()) {
    const match = parent.trim().match(/^([A-Za-z][A-Za-z0-9]+-\d+)/)
    return match ? match[1] : parent.trim()
  }
  return undefined
}

export function jiraIssueUrl (ticket: Pick<WorkTypeStoryPointTicket, 'key' | 'url'>): string | null {
  if (ticket.url) return ticket.url
  if (!ticket.key || ticket.key === 'No key' || !JIRA_BROWSE_BASE) return null
  return `${JIRA_BROWSE_BASE}/${encodeURIComponent(ticket.key)}`
}
