import { provide } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart, TreeChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  AxisPointerComponent,
  TitleComponent
} from 'echarts/components'
import { UPDATE_OPTIONS_KEY } from 'vue-echarts'

export function setupECharts () {
  use([
    CanvasRenderer,
    BarChart,
    PieChart,
    LineChart,
    TreeChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    AxisPointerComponent,
    TitleComponent
  ])
}

export function provideEChartsOptions () {
  provide(UPDATE_OPTIONS_KEY, { notMerge: true })
}
