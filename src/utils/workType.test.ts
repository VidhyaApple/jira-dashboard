import { describe, expect, it } from 'vitest'
import { buildWorkTypeStoryPointBuckets } from './workType'
import type { Ticket } from '../types/ticket'

function ticket (partial: Partial<Ticket>): Ticket {
  return {
    squad: 'SAM',
    developer: partial.region ?? 'uk',
    region: 'uk',
    workType: 'Story',
    storyPoints: 5,
    ...partial
  }
}

describe('buildWorkTypeStoryPointBuckets', () => {
  it('sets totals from Team only (does not add CIEC)', () => {
    const rows: Ticket[] = [
      ticket({ region: 'chennai', developer: 'chennai', key: 'C-1', storyPoints: 3 }),
      ticket({ region: 'uk', key: 'T-1', storyPoints: 8 })
    ]
    const buckets = buildWorkTypeStoryPointBuckets(rows)
    expect(buckets.Story!.chennai.sp).toBe(3)
    expect(buckets.Story!.uk.sp).toBe(8)
    expect(buckets.Story!.totalSp).toBe(8)
    expect(buckets.Story!.totalCount).toBe(1)
  })
})
