/** Period-over-period % change; index 0 is null (baseline period). */
export function periodOverPeriodPct (values: number[]): (number | null)[] {
  return values.map((v, i) => {
    if (i === 0) return null
    const prev = values[i - 1]!
    if (prev === 0) return v === 0 ? 0 : 100
    return Math.round(((v - prev) / prev) * 1000) / 10
  })
}

export function sumSeries (...arrays: number[][]): number[] {
  const len = arrays[0]?.length ?? 0
  return Array.from({ length: len }, (_, i) =>
    arrays.reduce((sum, arr) => sum + (arr[i] ?? 0), 0)
  )
}

export function formatPct (value: number | null | undefined): string {
  if (value == null) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value}%`
}
