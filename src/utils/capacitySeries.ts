import { monthlyCapacitySp } from '../config/capacity'
import type { CapacityBaselineMode, MonthlyBaselineValues } from '../types/capacity'
import type { buildMonthlySeries } from './timelineSeries'

export type MonthlyCapacityComparison = {
  labels: string[]
  monthKeys: string[]
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
  baselineMode: CapacityBaselineMode
  monthsUsed: number
}

function pctOfCapacity (actual: number, capacity: number): number | null {
  if (capacity <= 0) return null
  return Math.round((actual / capacity) * 1000) / 10
}

function roundSp (value: number): number {
  return Math.round(value * 10) / 10
}

function averageAll (values: number[]): number {
  if (!values.length) return 0
  return roundSp(values.reduce((sum, v) => sum + v, 0) / values.length)
}

/** Average monthly SP across the filtered period (Team = uk only). */
export function computeFilteredPeriodBaseline (
  monthlySeries: ReturnType<typeof buildMonthlySeries>
): MonthlyBaselineValues {
  const { labels, chennaiSp, ukSp } = monthlySeries
  const monthsUsed = labels.length
  if (monthsUsed < 1) {
    return { chennai: 0, uk: 0, total: 0, monthsUsed: 0 }
  }
  return {
    chennai: averageAll(chennaiSp),
    uk: averageAll(ukSp),
    total: averageAll(ukSp),
    monthsUsed
  }
}

export function buildMonthlyCapacityComparison (
  monthlySeries: ReturnType<typeof buildMonthlySeries>,
  chennaiDevs: number,
  ukDevs: number,
  baselineMode: CapacityBaselineMode = 'filtered',
  filteredBaseline?: MonthlyBaselineValues | null
): MonthlyCapacityComparison {
  const { labels, monthKeys, chennaiSp, ukSp } = monthlySeries
  const totalSp = [...ukSp]

  let chennaiCapacity: number
  let ukCapacity: number
  let totalCapacity: number
  let monthsUsed = 0
  let hasCapacity: boolean

  if (baselineMode === 'capacity') {
    chennaiCapacity = monthlyCapacitySp(chennaiDevs)
    ukCapacity = monthlyCapacitySp(ukDevs)
    totalCapacity = ukCapacity
    hasCapacity = ukCapacity > 0 || chennaiCapacity > 0
  } else {
    const hist = filteredBaseline ?? { chennai: 0, uk: 0, total: 0, monthsUsed: 0 }
    chennaiCapacity = hist.chennai
    ukCapacity = hist.uk
    totalCapacity = hist.uk
    monthsUsed = hist.monthsUsed
    hasCapacity = monthsUsed >= 1 && (hist.chennai > 0 || hist.uk > 0)
  }

  return {
    labels,
    monthKeys,
    chennaiSp,
    ukSp,
    totalSp,
    chennaiCapacity,
    ukCapacity,
    totalCapacity,
    chennaiPct: chennaiSp.map(v => pctOfCapacity(v, chennaiCapacity)),
    ukPct: ukSp.map(v => pctOfCapacity(v, ukCapacity)),
    totalPct: totalSp.map(v => pctOfCapacity(v, totalCapacity)),
    hasCapacity,
    baselineMode,
    monthsUsed
  }
}

export function baselineModeLabel (mode: CapacityBaselineMode): string {
  if (mode === 'filtered') return 'filtered-period avg'
  return 'team capacity'
}

export function baselineSeriesSuffix (mode: CapacityBaselineMode): string {
  if (mode === 'filtered') return 'baseline (period avg)'
  return 'capacity'
}
