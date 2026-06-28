import type { Ticket } from '../types/ticket'
import { monthKey, monthLabelFromKey, parseTicketDate, quarterKey, ticketTimelineDate } from './dates'
import { effectiveStoryPoints, isMissingStoryPoints } from './storyPoints'

export function buildQuarterlySeries (rows: Ticket[], assumeMissingSpAsOne = false) {
  const dated = rows.filter(t => parseTicketDate(ticketTimelineDate(t)))
  let minD: Date | null = null
  let maxD: Date | null = null
  for (const t of dated) {
    const d = parseTicketDate(ticketTimelineDate(t))!
    if (!minD || d < minD) minD = d
    if (!maxD || d > maxD) maxD = d
  }
  const labels: string[] = []
  if (minD && maxD) {
    let y = minD.getFullYear()
    let q = Math.floor(minD.getMonth() / 3) + 1
    const endY = maxD.getFullYear()
    const endQ = Math.floor(maxD.getMonth() / 3) + 1
    while (y < endY || (y === endY && q <= endQ)) {
      labels.push(`${y} Q${q}`)
      q += 1
      if (q > 4) { q = 1; y += 1 }
    }
  }
  const agg: Record<string, { chennai: { sp: number; n: number; noSp: number }; uk: { sp: number; n: number; noSp: number } }> = {}
  for (const lab of labels) agg[lab] = { chennai: { sp: 0, n: 0, noSp: 0 }, uk: { sp: 0, n: 0, noSp: 0 } }
  for (const t of dated) {
    const d = parseTicketDate(ticketTimelineDate(t))!
    const k = quarterKey(d)
    if (!agg[k]) continue
    const side = t.region === 'uk' ? agg[k].uk : agg[k].chennai
    side.n += 1
    side.sp += effectiveStoryPoints(t, assumeMissingSpAsOne)
    if (isMissingStoryPoints(t)) side.noSp += 1
  }
  return {
    labels,
    chennaiSp: labels.map(l => agg[l]!.chennai.sp),
    ukSp: labels.map(l => agg[l]!.uk.sp),
    chennaiN: labels.map(l => agg[l]!.chennai.n),
    ukN: labels.map(l => agg[l]!.uk.n),
    chennaiNoSp: assumeMissingSpAsOne ? labels.map(() => 0) : labels.map(l => agg[l]!.chennai.noSp),
    ukNoSp: assumeMissingSpAsOne ? labels.map(() => 0) : labels.map(l => agg[l]!.uk.noSp)
  }
}

export function buildMonthlySeries (rows: Ticket[], assumeMissingSpAsOne = false) {
  const dated = rows.filter(t => parseTicketDate(ticketTimelineDate(t)))
  let minD: Date | null = null
  let maxD: Date | null = null
  for (const t of dated) {
    const d = parseTicketDate(ticketTimelineDate(t))!
    if (!minD || d < minD) minD = d
    if (!maxD || d > maxD) maxD = d
  }
  const keys: string[] = []
  if (minD && maxD) {
    let y = minD.getFullYear()
    let m = minD.getMonth()
    const endY = maxD.getFullYear()
    const endM = maxD.getMonth()
    while (y < endY || (y === endY && m <= endM)) {
      keys.push(`${y}-${String(m + 1).padStart(2, '0')}`)
      m += 1
      if (m > 11) { m = 0; y += 1 }
    }
  }
  const agg: Record<string, { chennai: { sp: number; n: number; noSp: number }; uk: { sp: number; n: number; noSp: number } }> = {}
  for (const k of keys) agg[k] = { chennai: { sp: 0, n: 0, noSp: 0 }, uk: { sp: 0, n: 0, noSp: 0 } }
  for (const t of dated) {
    const d = parseTicketDate(ticketTimelineDate(t))!
    const k = monthKey(d)
    if (!agg[k]) continue
    const side = t.region === 'uk' ? agg[k].uk : agg[k].chennai
    side.n += 1
    side.sp += effectiveStoryPoints(t, assumeMissingSpAsOne)
    if (isMissingStoryPoints(t)) side.noSp += 1
  }
  return {
    labels: keys.map(monthLabelFromKey),
    chennaiSp: keys.map(k => agg[k]!.chennai.sp),
    ukSp: keys.map(k => agg[k]!.uk.sp),
    chennaiN: keys.map(k => agg[k]!.chennai.n),
    ukN: keys.map(k => agg[k]!.uk.n),
    chennaiNoSp: assumeMissingSpAsOne ? keys.map(() => 0) : keys.map(k => agg[k]!.chennai.noSp),
    ukNoSp: assumeMissingSpAsOne ? keys.map(() => 0) : keys.map(k => agg[k]!.uk.noSp)
  }
}
