import type { chartThemeColors } from '../stores/theme'

type ChartColors = ReturnType<typeof chartThemeColors>

export function valueLabel (
  c: ChartColors,
  opts: { color?: string; position?: 'top' | 'bottom' | 'inside' | 'right'; inside?: boolean } = {}
) {
  const color = opts.inside ? '#fff' : (opts.color ?? c.textStrong)
  return {
    show: true,
    position: opts.position ?? 'top',
    distance: opts.position === 'inside' ? 0 : 5,
    fontSize: opts.inside ? 11 : 10,
    fontWeight: opts.inside ? 600 : 500,
    color,
    textBorderColor: 'transparent',
    textBorderWidth: 0,
    formatter: (params: { value?: unknown }) => {
      const v = params.value
      if (v == null || v === '') return ''
      return String(v)
    }
  }
}

export function pctValueLabel (c: ChartColors, color?: string) {
  return {
    show: true,
    position: 'top' as const,
    distance: 4,
    fontSize: 9,
    fontWeight: 500 as const,
    color: color ?? c.textStrong,
    textBorderColor: 'transparent',
    textBorderWidth: 0,
    formatter: (params: { value?: unknown }) => {
      if (typeof params.value !== 'number') return ''
      const sign = params.value > 0 ? '+' : ''
      return `${sign}${params.value}%`
    }
  }
}

export function pieSliceLabel (c: ChartColors) {
  return {
    show: true,
    formatter: '{b}: {c}',
    color: c.text,
    fontSize: 12,
    fontWeight: 400,
    textBorderColor: 'transparent',
    textBorderWidth: 0
  }
}
