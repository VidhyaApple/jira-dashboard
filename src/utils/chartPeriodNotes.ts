/** Shared helpers for showing period notes on monthly ECharts. */

export function noteTooltipLine (text: string | undefined): string | null {
  if (!text) return null
  return `<span style="color:#6366f1">💬 Note: ${escapeHtml(text)}</span>`
}

function escapeHtml (value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Mark points for months that have notes; uses bar y-values when available. */
export function periodNoteMarkPoints (
  monthKeys: string[],
  notesByMonth: Record<string, string>,
  yValues: (number | null | undefined)[]
) {
  const data: Array<{
    name: string
    coord: [number, number]
    value: string
  }> = []

  for (let i = 0; i < monthKeys.length; i++) {
    const key = monthKeys[i]!
    const text = notesByMonth[key]
    if (!text) continue
    const y = yValues[i]
    if (y == null || Number.isNaN(Number(y))) continue
    data.push({
      name: text,
      coord: [i, Number(y)],
      value: text.length > 40 ? `${text.slice(0, 40)}…` : text
    })
  }

  if (!data.length) return undefined

  return {
    symbol: 'pin',
    symbolSize: 36,
    itemStyle: {
      color: 'rgba(99, 102, 241, 0.85)'
    },
    label: {
      show: false
    },
    tooltip: {
      formatter: (params: unknown) => {
        const name = (params as { name?: string })?.name
        return name ? `<span style="color:#6366f1">💬 ${escapeHtml(name)}</span>` : ''
      }
    },
    data
  }
}
