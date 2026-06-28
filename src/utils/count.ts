export function countByKey (arr: (string | undefined)[]): Record<string, number> {
  const m: Record<string, number> = {}
  for (const v of arr) {
    if (!v) continue
    m[v] = (m[v] ?? 0) + 1
  }
  return m
}
