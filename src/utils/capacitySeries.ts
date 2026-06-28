import { monthlyCapacitySp } from '../config/capacity'
import { sumSeries } from './baselineSeries'
import type { buildMonthlySeries } from './timelineSeries'

export type MonthlyCapacityComparison = {
  labels: string[]
  chennaiSp: number[]
  ukSp: number[]
  totalSp: number[]
  chennaiCapacity: number
  ukCapacity: number
  totalCapacity: number
  chennaiPct: (number | null)[]
  ukPct: (number | null)[]
  totalPct: (number | null)[]
  hasCapacity: boolean
}

function pctOfCapacity (actual: number, capacity: number): number | null {
  if (capacity <= 0) return null
  return Math.round((actual / capacity) * 1000) / 10
}

export function buildMonthlyCapacityComparison (
  monthlySeries: ReturnType<typeof buildMonthlySeries>,
  chennaiDevs: number,
  ukDevs: number
): MonthlyCapacityComparison {
  const { labels, chennaiSp, ukSp } = monthlySeries
  const totalSp = sumSeries(chennaiSp, ukSp)
  const chennaiCapacity = monthlyCapacitySp(chennaiDevs)
  const ukCapacity = monthlyCapacitySp(ukDevs)
  const totalCapacity = chennaiCapacity + ukCapacity

  return {
    labels,
    chennaiSp,
    ukSp,
    totalSp,
    chennaiCapacity,
    ukCapacity,
    totalCapacity,
    chennaiPct: chennaiSp.map(v => pctOfCapacity(v, chennaiCapacity)),
    ukPct: ukSp.map(v => pctOfCapacity(v, ukCapacity)),
    totalPct: totalSp.map(v => pctOfCapacity(v, totalCapacity)),
    hasCapacity: totalCapacity > 0
  }
}
