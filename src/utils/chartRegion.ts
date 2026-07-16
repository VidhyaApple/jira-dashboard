import { REGION_LABELS } from '../config/squads'
import type { RegionKey } from '../types/ticket'

export type CombinedChartRegionFilter = 'all' | RegionKey

export const CHENNAI_STYLE = {
  main: '#465fff',
  light: '#7592ff',
  area: 'rgba(70, 95, 255, 0.12)',
  areaStrong: 'rgba(70, 95, 255, 0.45)'
}

export const UK_STYLE = {
  main: '#12b76a',
  light: '#32d583',
  area: 'rgba(16, 185, 129, 0.12)',
  areaStrong: 'rgba(18, 183, 106, 0.4)'
}

export function pickRegionSp (
  filter: CombinedChartRegionFilter,
  chennai: number[],
  uk: number[]
): { chennai: number[]; uk: number[] } {
  if (filter === 'chennai') return { chennai, uk: chennai.map(() => 0) }
  if (filter === 'uk') return { chennai: uk.map(() => 0), uk }
  return { chennai, uk }
}

export function activeRegionValues (
  filter: CombinedChartRegionFilter,
  chennai: number[],
  uk: number[]
): number[] {
  if (filter === 'chennai') return chennai
  if (filter === 'uk') return uk
  return uk.length ? uk : chennai
}

export function showChennaiSeries (filter: CombinedChartRegionFilter): boolean {
  return filter === 'all' || filter === 'chennai'
}

export function showUkSeries (filter: CombinedChartRegionFilter): boolean {
  return filter === 'all' || filter === 'uk'
}

export function regionFilterLabel (filter: CombinedChartRegionFilter): string {
  if (filter === 'all') return 'All regions'
  return REGION_LABELS[filter]
}
