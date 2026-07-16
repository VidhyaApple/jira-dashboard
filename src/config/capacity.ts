/** Story points one developer can complete per working day. */
export const SP_PER_DEV_PER_DAY = 1

/** Working days per month for capacity planning. */
export const WORKING_DAYS_PER_MONTH = 20

export const CAPACITY_STORAGE_KEY = 'jira-dashboard-capacity'
export const BASELINE_MODE_STORAGE_KEY = 'jira-dashboard-baseline-mode'

export const BASELINE_MODE_OPTIONS = [
  { value: 'filtered' as const, label: 'Average of filtered period' },
  { value: 'capacity' as const, label: 'Team capacity (developers)' }
]

export function monthlyCapacitySp (developers: number): number {
  if (developers <= 0) return 0
  return developers * SP_PER_DEV_PER_DAY * WORKING_DAYS_PER_MONTH
}

export function capacityFormulaLabel (developers: number): string {
  if (developers <= 0) return '0 SP/mo'
  const sp = monthlyCapacitySp(developers)
  return `${sp} SP/mo (${developers} × ${SP_PER_DEV_PER_DAY} SP/day × ${WORKING_DAYS_PER_MONTH} days)`
}
