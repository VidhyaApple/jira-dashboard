<template>
  <div class="min-h-screen text-slate-200 p-6 sm:p-10 dashboard-bg">
    <div class="max-w-7xl mx-auto space-y-8 motion-safe:animate-page-in">

      <!-- HEADER -->
      <div class="section-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between motion-safe:animate-section-header">
        <h1 class="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent motion-safe:animate-title-shimmer bg-[length:200%_auto]">
          Jira Analytics Dashboard (2025-2026)
        </h1>

        <div class="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-400/40 hover:bg-amber-400/30 motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] text-sm"
          >Clear Filters</button>

          <button
            v-if="tickets.length"
            @click="clearData"
            class="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] text-sm"
          >Reset Data</button>

          <div v-if="tickets.length" class="bg-white text-slate-900 border border-slate-200 px-5 py-3 rounded-2xl shadow-lg motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-0.5">
            <div class="text-xs text-slate-500">All Tickets</div>
            <div class="text-2xl font-semibold tabular-nums motion-safe:transition-transform motion-safe:duration-300">{{ tickets.length }}</div>
          </div>

          <div v-if="tickets.length" class="bg-indigo-50 text-slate-900 border border-indigo-100 px-5 py-3 rounded-2xl shadow-lg motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-0.5">
            <div class="text-xs text-slate-500">Filtered</div>
            <div class="text-2xl font-semibold tabular-nums motion-safe:transition-transform motion-safe:duration-300">{{ filtered.length }}</div>
          </div>
        </div>
      </div>

      <!-- UPLOAD + TIMELINE -->
      <div class="section-upload bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 shadow-xl motion-safe:animate-section-upload motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-2xl motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-indigo-200/80">
        <div class="grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start">
          <div class="min-w-0 space-y-3">
            <div class="font-semibold text-slate-800">Upload Dataset</div>
            <div class="grid gap-3 sm:grid-cols-2">
              <select v-model="uploadScope" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50">
<!--            <option value="chennai-individual">Chennai Individual</option>-->
                <option value="chennai">Chennai Aggregate</option>
                <option value="uk">UK Aggregate</option>
              </select>

              <input
                v-if="uploadScope==='chennai-individual'"
                v-model="uploadDeveloper"
                placeholder="Developer name"
                class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
              />

              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                class="sm:col-span-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 motion-safe:file:transition-colors"
                @change="handleFile"
              />
            </div>
          </div>

          <div class="min-w-0 space-y-3 lg:border-l lg:border-slate-200 lg:pl-10 pt-2 lg:pt-0 border-t border-slate-200 lg:border-t-0">
            <div class="font-semibold text-slate-800">Timeline</div>
            <select
              v-model="dateFilter"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              :disabled="!tickets.length"
            >
              <option value="all">All Time</option>
              <optgroup label="Rolling window">
                <option value="weekly">Last 7 Days</option>
                <option value="twoWeeks">Last 14 Days</option>
                <option value="monthly">Last 30 Days</option>
              </optgroup>
              <optgroup label="Quarter (current calendar year)">
                <option value="q1">Q1 (Jan–Mar)</option>
                <option value="q2">Q2 (Apr–Jun)</option>
                <option value="q3">Q3 (Jul–Sep)</option>
                <option value="q4">Q4 (Oct–Dec)</option>
              </optgroup>
            </select>
            <div
              class="text-sm text-slate-600 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 motion-safe:transition-colors motion-safe:duration-300"
              :class="{ 'opacity-50': !tickets.length }"
            >
              <span class="text-slate-500">Range:</span>
              {{ tickets.length ? dateRangeLabel : 'Upload data to apply timeline' }}
            </div>
          </div>
        </div>
      </div>

      <!-- CHART GRID -->
      <Transition name="charts-mount">
        <div v-if="tickets.length" id="chart-grid" class="grid md:grid-cols-2 gap-6">

        <!-- STATUS CHENNAI -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Status - Chennai</span>
            <span>{{ dateRangeLabel }} | Total: {{ chennaiFilteredCount }}</span>
          </div>
          <v-chart :option="statusChennaiChart" autoresize style="height:300px" />
        </div>

        <!-- STATUS UK -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Status - UK</span>
            <span>{{ dateRangeLabel }} | Total: {{ ukFilteredCount }}</span>
          </div>
          <v-chart :option="statusUkChart" autoresize style="height:300px" />
        </div>

        <!-- WORK TYPE CHENNAI -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Work Type - Chennai</span>
            <span>{{ dateRangeLabel }} | Total: {{ chennaiFilteredCount }}</span>
          </div>
          <v-chart :option="workChennaiChart" autoresize style="height:300px" />
        </div>

        <!-- WORK TYPE UK -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Work Type - UK</span>
            <span>{{ dateRangeLabel }} | Total: {{ ukFilteredCount }}</span>
          </div>
          <v-chart :option="workUkChart" autoresize style="height:300px" />
        </div>

        <!-- STORY POINTS BY REGION -->
        <div class="md:col-span-2 bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Story Points by Region (bars + line)</span>
            <span>{{ dateRangeLabel }} | Total SP: {{ totalFilteredSP }}</span>
          </div>
          <v-chart :option="spChart" autoresize style="height:320px" />
        </div>

        <!-- QUARTERLY (side by side on md+) -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1 min-w-0">
          <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start text-xs text-slate-500 mb-2">
            <span class="font-medium text-slate-700">Quarterly — Story points</span>
            <span class="shrink-0">{{ dateRangeLabel }} | By issue updated date</span>
          </div>
          <v-chart :option="quarterlySpChart" autoresize style="height:340px" />
        </div>

        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1 min-w-0">
          <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start text-xs text-slate-500 mb-2">
            <span class="font-medium text-slate-700">Quarterly — Ticket volume</span>
            <span class="shrink-0">{{ dateRangeLabel }} | By issue updated date</span>
          </div>
          <v-chart :option="quarterlyCountChart" autoresize style="height:340px" />
        </div>

        <!-- MONTHLY (side by side on md+) -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1 min-w-0">
          <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start text-xs text-slate-500 mb-2">
            <span class="font-medium text-slate-700">Monthly — Story points</span>
            <span class="shrink-0">{{ dateRangeLabel }} | By issue updated date</span>
          </div>
          <v-chart :option="monthlySpChart" autoresize style="height:340px" />
        </div>

        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1 min-w-0">
          <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start text-xs text-slate-500 mb-2">
            <span class="font-medium text-slate-700">Monthly — Ticket volume</span>
            <span class="shrink-0">{{ dateRangeLabel }} | By issue updated date</span>
          </div>
          <v-chart :option="monthlyCountChart" autoresize style="height:340px" />
        </div>

        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import VChart, { UPDATE_OPTIONS_KEY } from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, AxisPointerComponent, TitleComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([CanvasRenderer, BarChart, PieChart, LineChart, GridComponent, TooltipComponent, LegendComponent, AxisPointerComponent, TitleComponent])

/** Avoid vue-echarts smart merge putting `color` in replaceMerge (invalid in ECharts 6) when filters change. */
provide(UPDATE_OPTIONS_KEY, { notMerge: true })

type Ticket={ key?:string; developer:string; region:'chennai'|'uk'; status?:string; workType?:string; storyPoints?:number; updated?:string }

const barRound: [number, number, number, number] = [10, 10, 0, 0]

/** Shared ECharts motion — stronger entrance + smooth updates when filters change */
function withChartMotion (opt: EChartsOption): EChartsOption {
  return {
    animation: true,
    animationDuration: 1650,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 1200,
    animationEasingUpdate: 'cubicOut',
    ...opt
  }
}

/** Axis tooltip preset for grouped / stacked bars */
const axisTooltipRich = {
  trigger: 'axis' as const,
  transitionDuration: 0.45,
  axisPointer: {
    type: 'shadow' as const,
    shadowStyle: { opacity: 0.22 },
    animation: true,
    animationDuration: 350,
    animationDurationUpdate: 250
  }
}

/** Axis tooltip for line / area time series */
const axisTooltipLine = {
  trigger: 'axis' as const,
  transitionDuration: 0.45,
  axisPointer: {
    type: 'line' as const,
    lineStyle: { width: 2, color: 'rgba(99, 102, 241, 0.45)' },
    animation: true,
    animationDuration: 380
  }
}

const tickets=ref<Ticket[]>([])
const uploadScope=ref('chennai')
const uploadDeveloper=ref('')
const dateFilter=ref('all')

const STORAGE_KEY='jiraTickets'
onMounted(()=>{ const d=localStorage.getItem(STORAGE_KEY); if(d) tickets.value=JSON.parse(d) })
const save=()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(tickets.value))

/** Inclusive start/end for quarter Q1–Q4 in a calendar year (local time). */
function quarterRange (year: number, quarter: 1 | 2 | 3 | 4): { start: Date; end: Date } {
  const startMonth = (quarter - 1) * 3
  const start = new Date(year, startMonth, 1, 0, 0, 0, 0)
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999)
  return { start, end }
}

const filtered=computed(()=>{
 let d=[...tickets.value]
 const df=dateFilter.value
 if(df==='all') return d

 if(df==='q1' || df==='q2' || df==='q3' || df==='q4'){
   const year=new Date().getFullYear()
   const quarter=Number(df.replace('q','')) as 1|2|3|4
   const { start, end }=quarterRange(year, quarter)
   d=d.filter(t=>{
    if(!t.updated) return false
    const dt=new Date(t.updated)
    return dt>=start && dt<=end
   })
   return d
 }

 const now=new Date()
 let days=0
 if(df==='weekly') days=7
 if(df==='twoWeeks') days=14
 if(df==='monthly') days=30
 const threshold=new Date()
 threshold.setDate(now.getDate()-days)
 d=d.filter(t=>t.updated && new Date(t.updated)>=threshold)
 return d
})

const chennaiFilteredCount=computed(()=>filtered.value.filter(t=>t.region==='chennai').length)
const ukFilteredCount=computed(()=>filtered.value.filter(t=>t.region==='uk').length)
const totalFilteredSP=computed(()=>filtered.value.reduce((a,b)=>a+(b.storyPoints||0),0))

const hasActiveFilters=computed(()=> dateFilter.value!=='all')
const clearFilters=()=>{ dateFilter.value='all' }
const clearData=()=>{ tickets.value=[]; localStorage.removeItem(STORAGE_KEY)}

const dateRangeLabel=computed(()=>{
 const df=dateFilter.value
 if(df==='all') return 'All Time'
 if(df==='q1' || df==='q2' || df==='q3' || df==='q4'){
   const year=new Date().getFullYear()
   const quarter=Number(df.replace('q','')) as 1|2|3|4
   const { start, end }=quarterRange(year, quarter)
   return `${year} Q${quarter}: ${start.toLocaleDateString()} → ${end.toLocaleDateString()}`
 }
 const now=new Date()
 let days=0
 if(df==='weekly') days=7
 if(df==='twoWeeks') days=14
 if(df==='monthly') days=30
 const past=new Date()
 past.setDate(now.getDate()-days)
 return `${past.toLocaleDateString()} → ${now.toLocaleDateString()}`
})

const handleFile=(e:Event)=>{
 const f=(e.target as HTMLInputElement).files?.[0]
 if(!f) return
 const ext=f.name.split('.').pop()?.toLowerCase()
 if(ext==='csv'){
   Papa.parse(f,{header:true,skipEmptyLines:true,complete:r=>norm(r.data as any[])})
 } else {
   parseExcel(f)
 }
}

const parseExcel=(f:File)=>{
 const r=new FileReader()
 r.onload=e=>{
   const wb=XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer),{type:'array'})
   const sheetName=wb.SheetNames[0]
   const sheet=sheetName?wb.Sheets[sheetName]:undefined
   if(!sheet) return
   norm(XLSX.utils.sheet_to_json(sheet))
 }
 r.readAsArrayBuffer(f)
}

const norm=(json:any[])=>{
 const region:Ticket['region']=uploadScope.value.includes('uk')?'uk':'chennai'
 const rows=json.map(r=>({
   key:r['Issue key'],
   developer:uploadScope.value==='chennai-individual'?uploadDeveloper.value:uploadScope.value,
   region,
   status:r.Status,
   workType:r['Issue Type'],
   storyPoints:Number(r['Custom field (Story Points)']||0),
   updated:r.Updated
 }))
 tickets.value.push(...rows)
 save()
}

const count=(arr:(string|undefined)[])=>{
 const m:Record<string,number>={}
 arr.forEach(v=>{ if(!v)return; if(!m[v])m[v]=0; m[v]++ })
 return m
}

/** Same donut structure for Chennai + UK status; palette + shadow differ by region */
function statusDonutChart (data: Record<string, number>, colors: string[], emphasisShadow: string): EChartsOption {
  const entries = Object.entries(data)
  if (!entries.length) {
    return withChartMotion({
      animationDuration: 500,
      title: { text: 'No status data', left: 'center', top: 'middle', textStyle: { color: '#64748b', fontSize: 14 } }
    })
  }
  return withChartMotion({
    tooltip: { transitionDuration: 0.4 },
    legend: { bottom: 0 },
    color: colors,
    series: [{
      type: 'pie',
      radius: ['48%', '72%'],
      animationType: 'expansion',
      animationEasing: 'elasticOut',
      animationDuration: 2200,
      animationDelay: (idx: number) => idx * 95 + 120,
      stillShowZeroSum: false,
      label: { formatter: '{b}: {c}', fontWeight: 500 },
      labelLine: { smooth: 0.35, length: 12, length2: 14 },
      emphasis: {
        scale: true,
        scaleSize: 10,
        itemStyle: { shadowBlur: 28, shadowColor: emphasisShadow },
        label: { fontWeight: 700 }
      },
      data: entries.map(([n, v]) => ({ name: n, value: v }))
    }]
  })
}

/** Same horizontal bar layout for Chennai + UK work types; bar + shadow colors differ */
function workTypeHorizontalChart (data: Record<string, number>, barColor: string, emphasisShadow: string): EChartsOption {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1])
  const keys = sorted.map(x => x[0])
  const vals = sorted.map(x => x[1])
  if (!keys.length) {
    return withChartMotion({
      animationDuration: 500,
      title: { text: 'No work type data', left: 'center', top: 'middle', textStyle: { color: '#64748b', fontSize: 14 } }
    })
  }
  return withChartMotion({
    tooltip: axisTooltipRich,
    grid: { left: 8, right: 24, top: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'value', splitLine: { lineStyle: { opacity: 0.35 } } },
    yAxis: { type: 'category', data: keys, inverse: true, axisTick: { show: false } },
    series: [{
      type: 'bar',
      data: vals,
      animationDelay: (idx: number) => idx * 72 + 100,
      animationEasing: 'elasticOut',
      barMaxWidth: 44,
      showBackground: true,
      backgroundStyle: { color: 'rgba(15, 23, 42, 0.06)', borderRadius: [0, barRound[0], barRound[1], 0] },
      label: { show: true, position: 'right', fontWeight: 600 },
      itemStyle: { color: barColor, borderRadius: [0, 10, 10, 0] },
      emphasis: {
        focus: 'series',
        itemStyle: { shadowBlur: 22, shadowColor: emphasisShadow }
      }
    }]
  })
}

const statusChennaiChart = computed<EChartsOption>(() => statusDonutChart(
  count(filtered.value.filter(t => t.region === 'chennai').map(t => t.status)),
  ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5', '#3730a3'],
  'rgba(79, 70, 229, 0.45)'
))

const statusUkChart = computed<EChartsOption>(() => statusDonutChart(
  count(filtered.value.filter(t => t.region === 'uk').map(t => t.status)),
  ['#10b981', '#34d399', '#6ee7b7', '#059669', '#065f46'],
  'rgba(16, 185, 129, 0.5)'
))

const workChennaiChart = computed<EChartsOption>(() => workTypeHorizontalChart(
  count(filtered.value.filter(t => t.region === 'chennai').map(t => t.workType)),
  '#6366f1',
  'rgba(99, 102, 241, 0.45)'
))

const workUkChart = computed<EChartsOption>(() => workTypeHorizontalChart(
  count(filtered.value.filter(t => t.region === 'uk').map(t => t.workType)),
  '#10b981',
  'rgba(16, 185, 129, 0.45)'
))

const spChart = computed<EChartsOption>(() => {

  const chennaiTickets = filtered.value.filter(t => t.region === 'chennai')
  const ukTickets = filtered.value.filter(t => t.region === 'uk')

  const chennaiSP = chennaiTickets.reduce((a,b)=>a+(b.storyPoints || 0),0)
  const ukSP = ukTickets.reduce((a,b)=>a+(b.storyPoints || 0),0)

  const chennaiNoSP = chennaiTickets.filter(t => !t.storyPoints || t.storyPoints === 0).length
  const ukNoSP = ukTickets.filter(t => !t.storyPoints || t.storyPoints === 0).length

  return withChartMotion({
    tooltip: axisTooltipRich,
    legend:{ bottom: 0 },
    xAxis:{
      type:'category',
      data:['Chennai','UK'],
      axisTick: { alignWithLabel: true }
    },
    yAxis:[
      { type:'value', name: 'Story points', splitLine: { lineStyle: { opacity: 0.35 } } },
      { type:'value', name: 'Tickets (no SP)', minInterval: 1, splitLine: { show: false } }
    ],
    series:[
      {
        name:'Total Story Points',
        type:'bar',
        yAxisIndex: 0,
        data:[chennaiSP, ukSP],
        animationDelay: (idx: number) => idx * 110 + 90,
        animationEasing: 'elasticOut',
        barMaxWidth: 72,
        barGap: '28%',
        showBackground: true,
        backgroundStyle: { color: 'rgba(15, 23, 42, 0.05)', borderRadius: barRound },
        label:{ show:true, position:'top', fontWeight: 600 },
        itemStyle:{
          borderRadius: barRound,
          color:(p:any)=> p.dataIndex===0 ? '#6366f1' : '#10b981'
        },
        emphasis: {
          focus: 'series',
          itemStyle: { shadowBlur: 24, shadowColor: 'rgba(99, 102, 241, 0.35)' }
        }
      },
      {
        name:'Tickets Without SP',
        type:'line',
        yAxisIndex: 1,
        smooth: true,
        data:[chennaiNoSP, ukNoSP],
        animationDelay: (idx: number) => idx * 110 + 200,
        symbolSize: 10,
        lineStyle: { width: 3, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b', borderWidth: 2, borderColor: '#fff' },
        label:{ show:true, position:'top', fontWeight: 600, color: '#b45309' },
        emphasis: {
          focus: 'series',
          lineStyle: { width: 4 }
        }
      }
    ]
  })
})

function parseTicketDate (updated?: string): Date | null {
  if (!updated) return null
  const d = new Date(updated)
  return Number.isNaN(d.getTime()) ? null : d
}

function quarterKey (d: Date): string {
  const y = d.getFullYear()
  const q = Math.floor(d.getMonth() / 3) + 1
  return `${y} Q${q}`
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

/** Stable key for sorting, e.g. 2025-03 */
function monthKey (d: Date): string {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
}

function monthLabelFromKey (key: string): string {
  const [ys, ms] = key.split('-')
  const y = Number(ys)
  const m = Number(ms) - 1
  if (Number.isNaN(y) || m < 0 || m > 11) return key
  return `${MONTH_SHORT[m]} ${y}`
}

/** Ordered quarter labels from min→max inclusive, plus any bucket keys that hold data. */
function buildQuarterlySeries (rows: Ticket[]) {
  const dated = rows.filter(t => parseTicketDate(t.updated))
  let minD: Date | null = null
  let maxD: Date | null = null
  for (const t of dated) {
    const d = parseTicketDate(t.updated)!
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
      if (q > 4) {
        q = 1
        y += 1
      }
    }
  }
  const agg: Record<string, { chennai: { sp: number; n: number }; uk: { sp: number; n: number } }> = {}
  for (const lab of labels) {
    agg[lab] = { chennai: { sp: 0, n: 0 }, uk: { sp: 0, n: 0 } }
  }
  for (const t of dated) {
    const d = parseTicketDate(t.updated)!
    const k = quarterKey(d)
    if (!agg[k]) continue
    const side = t.region === 'uk' ? agg[k].uk : agg[k].chennai
    side.n += 1
    side.sp += t.storyPoints || 0
  }
  const chennaiSp = labels.map(l => agg[l]!.chennai.sp)
  const ukSp = labels.map(l => agg[l]!.uk.sp)
  const chennaiN = labels.map(l => agg[l]!.chennai.n)
  const ukN = labels.map(l => agg[l]!.uk.n)
  return { labels, chennaiSp, ukSp, chennaiN, ukN }
}

/** Ordered month keys (YYYY-MM) from min→max inclusive; chart uses Jan, Feb, … labels. */
function buildMonthlySeries (rows: Ticket[]) {
  const dated = rows.filter(t => parseTicketDate(t.updated))
  let minD: Date | null = null
  let maxD: Date | null = null
  for (const t of dated) {
    const d = parseTicketDate(t.updated)!
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
      if (m > 11) {
        m = 0
        y += 1
      }
    }
  }
  const agg: Record<string, { chennai: { sp: number; n: number }; uk: { sp: number; n: number } }> = {}
  for (const k of keys) {
    agg[k] = { chennai: { sp: 0, n: 0 }, uk: { sp: 0, n: 0 } }
  }
  for (const t of dated) {
    const d = parseTicketDate(t.updated)!
    const k = monthKey(d)
    if (!agg[k]) continue
    const side = t.region === 'uk' ? agg[k].uk : agg[k].chennai
    side.n += 1
    side.sp += t.storyPoints || 0
  }
  const labels = keys.map(monthLabelFromKey)
  const chennaiSp = keys.map(k => agg[k]!.chennai.sp)
  const ukSp = keys.map(k => agg[k]!.uk.sp)
  const chennaiN = keys.map(k => agg[k]!.chennai.n)
  const ukN = keys.map(k => agg[k]!.uk.n)
  return { labels, chennaiSp, ukSp, chennaiN, ukN }
}

const quarterlySeries = computed(() => buildQuarterlySeries(filtered.value))
const monthlySeries = computed(() => buildMonthlySeries(filtered.value))

const quarterlySpChart = computed<EChartsOption>(() => {
  const { labels, chennaiSp, ukSp } = quarterlySeries.value
  if (!labels.length) {
    return withChartMotion({
      animationDuration: 500,
      title: {
        text: 'No issues with a valid Updated date in the current filter',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#64748b', fontSize: 14 }
      }
    })
  }
  return withChartMotion({
    tooltip: axisTooltipLine,
    legend: { bottom: 0 },
    grid: { left: 48, right: 24, bottom: 56, top: 32, containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: labels.length > 8 ? 35 : 0 }, boundaryGap: false },
    yAxis: { type: 'value', name: 'Story points', splitLine: { lineStyle: { opacity: 0.35 } } },
    series: [
      {
        name: 'Chennai',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 8,
        data: chennaiSp,
        animationDelay: (idx: number) => idx * 45 + 80,
        lineStyle: { width: 3, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: 'rgba(99, 102, 241, 0.12)' },
        emphasis: { focus: 'series', lineStyle: { width: 4 } }
      },
      {
        name: 'UK',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 8,
        data: ukSp,
        animationDelay: (idx: number) => idx * 45 + 130,
        lineStyle: { width: 3, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16, 185, 129, 0.12)' },
        emphasis: { focus: 'series', lineStyle: { width: 4 } }
      }
    ]
  })
})

const quarterlyCountChart = computed<EChartsOption>(() => {
  const { labels, chennaiN, ukN } = quarterlySeries.value
  if (!labels.length) {
    return withChartMotion({
      animationDuration: 500,
      title: {
        text: 'No issues with a valid Updated date in the current filter',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#64748b', fontSize: 14 }
      }
    })
  }
  return withChartMotion({
    tooltip: axisTooltipRich,
    legend: { bottom: 0 },
    grid: { left: 48, right: 24, bottom: 56, top: 32, containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: labels.length > 8 ? 35 : 0 }, axisTick: { alignWithLabel: true } },
    yAxis: { type: 'value', name: 'Tickets', minInterval: 1, splitLine: { lineStyle: { opacity: 0.35 } } },
    series: [
      {
        name: 'Chennai',
        type: 'bar',
        stack: 'vol',
        data: chennaiN,
        animationDelay: (idx: number) => idx * 45 + 80,
        animationEasing: 'elasticOut',
        barMaxWidth: 52,
        label: { show: true, position: 'inside', fontWeight: 600, color: '#fff' },
        itemStyle: { color: '#818cf8', borderRadius: [0, 0, 0, 0] },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 16, shadowColor: 'rgba(129, 140, 248, 0.5)' } }
      },
      {
        name: 'UK',
        type: 'bar',
        stack: 'vol',
        data: ukN,
        animationDelay: (idx: number) => idx * 45 + 120,
        animationEasing: 'elasticOut',
        barMaxWidth: 52,
        label: { show: true, position: 'inside', fontWeight: 600, color: '#fff' },
        itemStyle: { color: '#34d399', borderRadius: [8, 8, 0, 0] },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 16, shadowColor: 'rgba(52, 211, 153, 0.5)' } }
      }
    ]
  })
})

const monthlySpChart = computed<EChartsOption>(() => {
  const { labels, chennaiSp, ukSp } = monthlySeries.value
  if (!labels.length) {
    return withChartMotion({
      animationDuration: 500,
      title: {
        text: 'No issues with a valid Updated date in the current filter',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#64748b', fontSize: 14 }
      }
    })
  }
  return withChartMotion({
    tooltip: axisTooltipLine,
    legend: { bottom: 0 },
    grid: { left: 48, right: 24, bottom: 56, top: 32, containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: labels.length > 6 ? 35 : 0 }, boundaryGap: false },
    yAxis: { type: 'value', name: 'Story points', splitLine: { lineStyle: { opacity: 0.35 } } },
    series: [
      {
        name: 'Chennai',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: chennaiSp,
        animationDelay: (idx: number) => idx * 32 + 70,
        lineStyle: { width: 2.5, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.45)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.02)' }
            ]
          }
        },
        emphasis: { focus: 'series' }
      },
      {
        name: 'UK',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: ukSp,
        animationDelay: (idx: number) => idx * 32 + 110,
        lineStyle: { width: 2.5, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }
            ]
          }
        },
        emphasis: { focus: 'series' }
      }
    ]
  })
})

const monthlyCountChart = computed<EChartsOption>(() => {
  const { labels, chennaiN, ukN } = monthlySeries.value
  if (!labels.length) {
    return withChartMotion({
      animationDuration: 500,
      title: {
        text: 'No issues with a valid Updated date in the current filter',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#64748b', fontSize: 14 }
      }
    })
  }
  return withChartMotion({
    tooltip: axisTooltipLine,
    legend: { bottom: 0 },
    grid: { left: 48, right: 24, bottom: 56, top: 32, containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: labels.length > 6 ? 35 : 0 }, boundaryGap: false },
    yAxis: { type: 'value', name: 'Tickets', minInterval: 1, splitLine: { lineStyle: { opacity: 0.35 } } },
    series: [
      {
        name: 'Chennai',
        type: 'line',
        stack: 'total',
        smooth: true,
        symbolSize: 4,
        data: chennaiN,
        animationDelay: (idx: number) => idx * 28 + 65,
        lineStyle: { width: 1.5, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: 'rgba(129, 140, 248, 0.55)' },
        emphasis: { focus: 'series' }
      },
      {
        name: 'UK',
        type: 'line',
        stack: 'total',
        smooth: true,
        symbolSize: 4,
        data: ukN,
        animationDelay: (idx: number) => idx * 28 + 100,
        lineStyle: { width: 1.5, color: '#059669' },
        itemStyle: { color: '#059669' },
        areaStyle: { color: 'rgba(52, 211, 153, 0.55)' },
        emphasis: { focus: 'series' }
      }
    ]
  })
})</script>

<style>
body{font-family:Inter,system-ui,sans-serif}
</style>