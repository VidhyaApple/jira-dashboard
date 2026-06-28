import type { CategoryTreeNode, HierarchySpOverlap, HierarchyWorkTypeSplit } from '../types/hierarchy'
import type { MergedTicket, Ticket } from '../types/ticket'
import { effectiveStoryPoints } from './storyPoints'
import { issueTypeRank, workTypeColor } from './workType'

export function mergeTicketsForHierarchy (rows: Ticket[]): Map<string, MergedTicket> {
  const map = new Map<string, MergedTicket>()
  for (const t of rows) {
    if (!t.key) continue
    const existing = map.get(t.key)
    if (existing) {
      if (!existing.regions.includes(t.region)) existing.regions.push(t.region)
      existing.storyPoints = Math.max(existing.storyPoints || 0, t.storyPoints || 0)
      if (!existing.parentKey && t.parentKey) existing.parentKey = t.parentKey
      if (!existing.workType && t.workType) existing.workType = t.workType
    } else {
      map.set(t.key, { ...t, regions: [t.region] })
    }
  }
  return map
}

function getDirectChildren (parentKeys: Set<string>, byKey: Map<string, MergedTicket>): MergedTicket[] {
  const children: MergedTicket[] = []
  for (const ticket of byKey.values()) {
    if (ticket.parentKey && parentKeys.has(ticket.parentKey)) children.push(ticket)
  }
  return children
}

function countDescendants (parentKeys: Set<string>, byKey: Map<string, MergedTicket>): number {
  let count = 0
  const queue = [...parentKeys]
  const seen = new Set<string>()
  while (queue.length) {
    const parentKey = queue.shift()!
    for (const ticket of byKey.values()) {
      if (ticket.parentKey !== parentKey || !ticket.key || seen.has(ticket.key)) continue
      seen.add(ticket.key)
      count += 1
      queue.push(ticket.key)
    }
  }
  return count
}

function sumTicketsStoryPoints (tickets: MergedTicket[], assumeMissingSpAsOne: boolean): number {
  return tickets.reduce((sum, ticket) => sum + effectiveStoryPoints(ticket, assumeMissingSpAsOne), 0)
}

function sumDescendantStoryPoints (
  parentKeys: Set<string>,
  byKey: Map<string, MergedTicket>,
  assumeMissingSpAsOne: boolean
): number {
  let total = 0
  const queue = [...parentKeys]
  const seen = new Set<string>()
  while (queue.length) {
    const parentKey = queue.shift()!
    for (const ticket of byKey.values()) {
      if (ticket.parentKey !== parentKey || !ticket.key || seen.has(ticket.key)) continue
      seen.add(ticket.key)
      total += effectiveStoryPoints(ticket, assumeMissingSpAsOne)
      queue.push(ticket.key)
    }
  }
  return total
}

function groupTicketsByWorkType (tickets: MergedTicket[]): Map<string, MergedTicket[]> {
  const groups = new Map<string, MergedTicket[]>()
  for (const ticket of tickets) {
    const workType = ticket.workType || 'Other'
    const bucket = groups.get(workType) || []
    bucket.push(ticket)
    groups.set(workType, bucket)
  }
  return groups
}

function categoryNodeLabel (workType: string, ticketCount: number, storyPoints: number): string {
  const ticketLabel = ticketCount === 1 ? '1 ticket' : `${ticketCount} tickets`
  return `${workType}\n${ticketLabel}\n${storyPoints} SP`
}

export function hierarchyNodeSymbolSize (_value: number, params: any): [number, number] {
  const name = String(params?.data?.name ?? '')
  const lines = name.split('\n')
  const longest = Math.max(...lines.map(line => line.length), 10)
  const width = Math.min(240, Math.max(108, longest * 7 + 36))
  const height = Math.max(56, lines.length * 18 + 24)
  return [width, height]
}

function makeCategoryTreeNode (
  workType: string,
  tickets: MergedTicket[],
  keys: Set<string>,
  byKey: Map<string, MergedTicket>,
  childBranches: CategoryTreeNode[],
  segment: CategoryTreeNode['segment'],
  assumeMissingSpAsOne: boolean,
  options?: { color?: string; subsetNote?: string }
): CategoryTreeNode {
  const ticketCount = tickets.length
  const underCount = countDescendants(keys, byKey)
  const storyPoints = sumTicketsStoryPoints(tickets, assumeMissingSpAsOne)
  const underSp = sumDescendantStoryPoints(keys, byKey, assumeMissingSpAsOne)
  const totalSp = storyPoints + underSp

  return {
    name: categoryNodeLabel(workType, ticketCount, storyPoints),
    workType,
    segment,
    ticketCount,
    underCount,
    storyPoints,
    underSp,
    totalSp,
    value: Math.max(storyPoints, ticketCount, 1),
    subsetNote: options?.subsetNote,
    itemStyle: { color: options?.color ?? workTypeColor(workType) },
    children: childBranches.length ? childBranches : undefined
  }
}

function buildCategoryBranch (
  parentKeys: Set<string>,
  byKey: Map<string, MergedTicket>,
  segment: CategoryTreeNode['segment'],
  assumeMissingSpAsOne: boolean
): CategoryTreeNode[] {
  const directChildren = getDirectChildren(parentKeys, byKey)
  if (!directChildren.length) return []

  const nodes: CategoryTreeNode[] = []
  for (const [workType, tickets] of groupTicketsByWorkType(directChildren)) {
    const keys = new Set(tickets.map(t => t.key!))
    const childBranches = buildCategoryBranch(keys, byKey, segment, assumeMissingSpAsOne)
    nodes.push(makeCategoryTreeNode(workType, tickets, keys, byKey, childBranches, segment, assumeMissingSpAsOne, {
      color: workTypeColor(workType),
      subsetNote: 'Same tickets counted in work-type totals — shown here only for parent link.'
    }))
  }

  nodes.sort((a, b) => issueTypeRank(a.workType) - issueTypeRank(b.workType) || b.ticketCount - a.ticketCount)
  return nodes
}

function getLinkedGraph (byKey: Map<string, MergedTicket>) {
  const linkedChildren = [...byKey.values()].filter(t => t.parentKey && byKey.has(t.parentKey))
  const linkedChildKeys = new Set(linkedChildren.map(t => t.key!))
  const linkedKeys = new Set<string>()
  for (const child of linkedChildren) {
    linkedKeys.add(child.key!)
    linkedKeys.add(child.parentKey!)
  }
  const linkedParents = [...byKey.values()].filter(t => t.key && linkedKeys.has(t.key) && !linkedChildKeys.has(t.key))
  const standaloneTickets = [...byKey.values()].filter(t => t.key && !linkedKeys.has(t.key))
  return { linkedChildren, linkedChildKeys, linkedKeys, linkedParents, standaloneTickets }
}

function buildHierarchySpOverlaps (
  byKey: Map<string, MergedTicket>,
  assumeMissingSpAsOne: boolean
): HierarchySpOverlap[] {
  const pairs: HierarchySpOverlap[] = []
  for (const ticket of byKey.values()) {
    if (!ticket.key || !ticket.parentKey) continue
    const parent = byKey.get(ticket.parentKey)
    const childSp = effectiveStoryPoints(ticket, assumeMissingSpAsOne)
    const parentSp = parent ? effectiveStoryPoints(parent, assumeMissingSpAsOne) : 0
    if (!(childSp > 0 && parentSp > 0)) continue
    pairs.push({
      parentKey: ticket.parentKey,
      childKey: ticket.key,
      parentWorkType: parent?.workType,
      childWorkType: ticket.workType,
      parentSp,
      childSp
    })
  }
  return pairs.sort((a, b) => a.parentKey.localeCompare(b.parentKey) || a.childKey.localeCompare(b.childKey))
}

function buildWorkTypeSplits (
  byKey: Map<string, MergedTicket>,
  linkedChildKeys: Set<string>,
  assumeMissingSpAsOne: boolean
): HierarchyWorkTypeSplit[] {
  const allTickets = [...byKey.values()]
  const workTypes = [...new Set(allTickets.map(t => t.workType || 'Other'))]

  return workTypes.map(workType => {
    const ofType = allTickets.filter(t => (t.workType || 'Other') === workType)
    const linked = ofType.filter(t => t.key && linkedChildKeys.has(t.key))
    const standalone = ofType.filter(t => t.key && !linkedChildKeys.has(t.key))

    const breakdownMap = new Map<string, { count: number; sp: number }>()
    for (const child of linked) {
      const parent = child.parentKey ? byKey.get(child.parentKey) : undefined
      const parentWorkType = parent?.workType || 'Parent'
      const bucket = breakdownMap.get(parentWorkType) || { count: 0, sp: 0 }
      bucket.count += 1
      bucket.sp += effectiveStoryPoints(child, assumeMissingSpAsOne)
      breakdownMap.set(parentWorkType, bucket)
    }

    return {
      workType,
      totalCount: ofType.length,
      totalSp: sumTicketsStoryPoints(ofType, assumeMissingSpAsOne),
      linkedCount: linked.length,
      linkedSp: sumTicketsStoryPoints(linked, assumeMissingSpAsOne),
      standaloneCount: standalone.length,
      standaloneSp: sumTicketsStoryPoints(standalone, assumeMissingSpAsOne),
      linkedBreakdown: [...breakdownMap.entries()]
        .map(([parentWorkType, stats]) => ({ parentWorkType, ...stats }))
        .sort((a, b) => b.count - a.count)
    }
  }).sort((a, b) => issueTypeRank(a.workType) - issueTypeRank(b.workType) || b.totalCount - a.totalCount)
}

function buildLinkedSection (
  linkedParents: MergedTicket[],
  byKey: Map<string, MergedTicket>,
  linkedKeys: Set<string>,
  assumeMissingSpAsOne: boolean
): CategoryTreeNode | null {
  if (!linkedParents.length && !linkedKeys.size) return null

  const parentBranches: CategoryTreeNode[] = []
  for (const [workType, tickets] of groupTicketsByWorkType(linkedParents)) {
    const keys = new Set(tickets.map(t => t.key!))
    const childBranches = buildCategoryBranch(keys, byKey, 'category', assumeMissingSpAsOne)
    parentBranches.push(makeCategoryTreeNode(workType, tickets, keys, byKey, childBranches, 'category', assumeMissingSpAsOne, {
      color: workTypeColor(workType)
    }))
  }
  parentBranches.sort((a, b) => issueTypeRank(a.workType) - issueTypeRank(b.workType) || b.ticketCount - a.ticketCount)

  const participantTickets = [...byKey.values()].filter(t => t.key && linkedKeys.has(t.key))

  return {
    name: categoryNodeLabel('Linked in export', participantTickets.length, sumTicketsStoryPoints(participantTickets, assumeMissingSpAsOne)),
    workType: 'Linked in export',
    segment: 'linked-section',
    ticketCount: participantTickets.length,
    underCount: linkedParents.length,
    storyPoints: sumTicketsStoryPoints(participantTickets, assumeMissingSpAsOne),
    underSp: 0,
    totalSp: sumTicketsStoryPoints(participantTickets, assumeMissingSpAsOne),
    value: Math.max(participantTickets.length, 1),
    subsetNote: 'Parent and child both exist in this export.',
    itemStyle: { color: '#0f766e' },
    children: parentBranches.length ? parentBranches : undefined
  }
}

function buildStandaloneSection (
  standaloneTickets: MergedTicket[],
  assumeMissingSpAsOne: boolean
): CategoryTreeNode | null {
  if (!standaloneTickets.length) return null

  const branches: CategoryTreeNode[] = []
  for (const [workType, tickets] of groupTicketsByWorkType(standaloneTickets)) {
    branches.push(makeCategoryTreeNode(workType, tickets, new Set(), new Map(), [], 'category', assumeMissingSpAsOne, {
      color: '#64748b',
      subsetNote: 'No parent link within this export — different tickets from linked children above.'
    }))
  }
  branches.sort((a, b) => issueTypeRank(a.workType) - issueTypeRank(b.workType) || b.ticketCount - a.ticketCount)

  return {
    name: categoryNodeLabel('Standalone', standaloneTickets.length, sumTicketsStoryPoints(standaloneTickets, assumeMissingSpAsOne)),
    workType: 'Standalone',
    segment: 'standalone-section',
    ticketCount: standaloneTickets.length,
    underCount: 0,
    storyPoints: sumTicketsStoryPoints(standaloneTickets, assumeMissingSpAsOne),
    underSp: 0,
    totalSp: sumTicketsStoryPoints(standaloneTickets, assumeMissingSpAsOne),
    value: Math.max(standaloneTickets.length, 1),
    subsetNote: 'Tickets without a resolvable parent in this export.',
    itemStyle: { color: '#475569' },
    children: branches.length ? branches : undefined
  }
}

export function buildHierarchyAnalysis (rows: Ticket[], assumeMissingSpAsOne = false): {
  tree: CategoryTreeNode | null
  workTypeSplits: HierarchyWorkTypeSplit[]
  spOverlaps: HierarchySpOverlap[]
  linkedChildCount: number
} {
  const byKey = mergeTicketsForHierarchy(rows)
  if (!byKey.size) {
    return { tree: null, workTypeSplits: [], spOverlaps: [], linkedChildCount: 0 }
  }

  const { linkedChildren, linkedChildKeys, linkedKeys, linkedParents, standaloneTickets } = getLinkedGraph(byKey)
  const workTypeSplits = buildWorkTypeSplits(byKey, linkedChildKeys, assumeMissingSpAsOne)
  const spOverlaps = buildHierarchySpOverlaps(byKey, assumeMissingSpAsOne)

  const sections: CategoryTreeNode[] = []
  const linkedSection = buildLinkedSection(linkedParents, byKey, linkedKeys, assumeMissingSpAsOne)
  const standaloneSection = buildStandaloneSection(standaloneTickets, assumeMissingSpAsOne)
  if (linkedSection) sections.push(linkedSection)
  if (standaloneSection) sections.push(standaloneSection)

  const allTickets = [...byKey.values()]
  const totalSp = sumTicketsStoryPoints(allTickets, assumeMissingSpAsOne)

  const tree: CategoryTreeNode = {
    name: categoryNodeLabel('All tickets', byKey.size, totalSp),
    workType: 'All',
    segment: 'all',
    ticketCount: byKey.size,
    underCount: linkedChildren.length,
    storyPoints: totalSp,
    underSp: 0,
    totalSp,
    value: Math.max(totalSp, byKey.size, 1),
    itemStyle: { color: '#334155' },
    children: sections.length ? sections : undefined
  }

  return {
    tree,
    workTypeSplits,
    spOverlaps,
    linkedChildCount: linkedChildren.length
  }
}

export function countCategoryTreeNodes (nodes: CategoryTreeNode[]): number {
  let count = 0
  for (const node of nodes) {
    count += 1
    if (node.children?.length) count += countCategoryTreeNodes(node.children)
  }
  return count
}
