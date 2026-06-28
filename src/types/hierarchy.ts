export type CategoryTreeNode = {
  name: string
  workType: string
  segment: 'all' | 'linked-section' | 'standalone-section' | 'category'
  ticketCount: number
  underCount: number
  storyPoints: number
  underSp: number
  totalSp: number
  value: number
  subsetNote?: string
  itemStyle?: { color: string; borderColor?: string; borderWidth?: number }
  children?: CategoryTreeNode[]
}

export type HierarchySpOverlap = {
  parentKey: string
  childKey: string
  parentWorkType?: string
  childWorkType?: string
  parentSp: number
  childSp: number
}

export type HierarchyWorkTypeSplit = {
  workType: string
  totalCount: number
  totalSp: number
  linkedCount: number
  linkedSp: number
  standaloneCount: number
  standaloneSp: number
  linkedBreakdown: { parentWorkType: string; count: number; sp: number }[]
}
