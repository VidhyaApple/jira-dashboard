import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import type { CategoryTreeNode } from '../../types/hierarchy'
import { hierarchyNodeSymbolSize } from '../../utils/hierarchy'
import { escapeHtml } from '../../utils/html'
import { useChartTheme } from '../useChartTheme'

export function useHierarchyChart () {
  const { issueHierarchyMeta } = storeToRefs(useDashboardStore())
  const { chartEmptyTitle, withChartMotion } = useChartTheme()

  const chartOption = computed<EChartsOption>(() => {
    const { tree } = issueHierarchyMeta.value
    if (!tree) {
      return withChartMotion({ animationDuration: 500, title: chartEmptyTitle('No issues in the current filter') })
    }
    return withChartMotion({
      tooltip: {
        trigger: 'item',
        transitionDuration: 0.35,
        formatter: (params: any) => {
          const d = params?.data as CategoryTreeNode | undefined
          if (!d) return ''
          if (d.workType === 'All') {
            return [
              '<strong>All tickets</strong>',
              `${d.ticketCount} tickets · ${d.storyPoints} SP`,
              d.underCount ? `${d.underCount} have a parent in this export (linked branch)` : 'No parent links in this export'
            ].filter(Boolean).join('<br/>')
          }
          if (d.segment === 'linked-section') {
            return [
              '<strong>Linked in export</strong>',
              `${d.ticketCount} tickets · ${d.storyPoints} SP`,
              'Parent and child rows both exist in this dataset'
            ].join('<br/>')
          }
          if (d.segment === 'standalone-section') {
            return [
              '<strong>Standalone</strong>',
              `${d.ticketCount} tickets · ${d.storyPoints} SP`,
              'Parent missing from export — not shown under linked branch'
            ].join('<br/>')
          }
          const lines = [
            `<strong>${escapeHtml(d.workType)}</strong>`,
            `${d.ticketCount} tickets · ${d.storyPoints} SP`,
            d.subsetNote ? `<span style="color:#64748b">${escapeHtml(d.subsetNote)}</span>` : '',
            d.underCount ? `${d.underCount} nested underneath · ${d.underSp} SP underneath` : ''
          ].filter(Boolean)
          return lines.join('<br/>')
        }
      },
      series: [{
        type: 'tree',
        data: [tree],
        top: 40,
        left: '12%',
        bottom: 24,
        right: '12%',
        orient: 'TB',
        roam: true,
        initialTreeDepth: -1,
        expandAndCollapse: true,
        animationDurationUpdate: 650,
        symbol: 'roundRect',
        symbolSize: hierarchyNodeSymbolSize,
        label: {
          position: 'inside',
          verticalAlign: 'middle',
          align: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: '#fff',
          lineHeight: 18,
          overflow: 'break',
          width: 220
        },
        leaves: { label: { position: 'inside', verticalAlign: 'middle', align: 'center' } },
        lineStyle: { color: '#94a3b8', width: 2, curveness: 0.35 },
        emphasis: { focus: 'descendant' }
      }]
    })
  })

  return { chartOption, issueHierarchyMeta }
}
