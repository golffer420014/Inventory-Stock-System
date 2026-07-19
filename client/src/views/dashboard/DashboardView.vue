<script setup lang="ts">
// #import
import { computed, onMounted } from 'vue'
import type { EChartsOption } from 'echarts'
import { Boxes, PackageSearch, TriangleAlert, Wallet } from '@lucide/vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useReportStore } from '@/stores/report'
import { useThemeStore } from '@/stores/theme'
import BaseAsyncState from '@/components/common/BaseAsyncState.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseChart from '@/components/common/BaseChart.vue'

// สีเดียวกับตัวแปร CSS ของธีมแอป (--brass-dark/--brass, --success, --destructive) แทนสีฟ้า/แดงมาตรฐานของ ECharts
// เพื่อให้กราฟกลมกลืนกับโทนน้ำตาล/ทองของทั้งแอป ไม่หลุดธีม
const CHART_PALETTE = {
  light: { ink: '#3b2f22', inkSoft: '#6b5c48', border: '#e0cfa9', normal: '#8a611f', lowStock: '#a5473b', in: '#5b7a2f', adjustment: '#8a611f', out: '#a5473b' },
  dark: { ink: '#f1e6d0', inkSoft: '#c2b093', border: '#453626', normal: '#d8a34d', lowStock: '#cf7a68', in: '#8faa5c', adjustment: '#d8a34d', out: '#cf7a68' },
}

// #store
const dashboardStore = useDashboardStore()
const reportStore = useReportStore()
const themeStore = useThemeStore()

// #computed
const palette = computed(() => (themeStore.isDark ? CHART_PALETTE.dark : CHART_PALETTE.light))

const rankedProducts = computed(() =>
  [...(reportStore.inventoryReport?.products ?? [])].sort((a, b) => b.stockQuantity - a.stockQuantity)
)

/**
 * กราฟ Stock คงเหลือแยกตามสินค้า เรียงจากมากไปน้อย ไฮไลต์สินค้าใกล้หมดด้วยสีแดง
 */
const stockByProductOption = computed<EChartsOption>(() => ({
  backgroundColor: 'transparent',
  textStyle: { color: palette.value.ink, fontFamily: 'inherit' },
  grid: { left: 8, right: 24, top: 8, bottom: 8, containLabel: true },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    valueFormatter: (value) => `${Number(value).toLocaleString()} หน่วย`,
  },
  xAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: palette.value.border } },
    axisLabel: { color: palette.value.inkSoft },
    splitLine: { lineStyle: { color: palette.value.border, type: 'dashed' } },
  },
  yAxis: {
    type: 'category',
    inverse: true,
    data: rankedProducts.value.map((p) => p.sku),
    axisLine: { lineStyle: { color: palette.value.border } },
    axisLabel: { color: palette.value.inkSoft },
  },
  series: [
    {
      type: 'bar',
      name: 'Stock คงเหลือ',
      barMaxWidth: 22,
      data: rankedProducts.value.map((p) => ({
        value: p.stockQuantity,
        itemStyle: { color: p.isLowStock ? palette.value.lowStock : palette.value.normal, borderRadius: [0, 4, 4, 0] },
      })),
    },
  ],
}))

/**
 * กราฟสรุปยอดเคลื่อนไหวสต๊อก (IN/OUT/Adjustment) แบบ diverging รอบเส้น 0
 * IN แสดงเป็นค่าบวก, OUT แสดงเป็นค่าลบ เพื่อให้เห็นทิศทางการไหลของสต๊อกชัดเจน
 */
const movementBreakdownOption = computed<EChartsOption>(() => {
  const report = reportStore.inventoryReport
  const categories = ['รับเข้า (IN)', 'เบิกออก (OUT)', 'ปรับปรุง (Adjustment)']
  const values = report ? [report.totalIn, -report.totalOut, report.totalAdjustment] : [0, 0, 0]
  const colors = [palette.value.in, palette.value.out, palette.value.adjustment]

  return {
    backgroundColor: 'transparent',
    textStyle: { color: palette.value.ink, fontFamily: 'inherit' },
    grid: { left: 8, right: 24, top: 24, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value) => `${Number(value).toLocaleString()} หน่วย`,
    },
    xAxis: {
      type: 'category',
      data: categories,
      // onZero: false กันไม่ให้แกน category ไปเกาะเส้น 0 ของแกนค่า (ค่าติดลบทำให้ label ไปซ้อนกลางกราฟ)
      axisLine: { onZero: false, lineStyle: { color: palette.value.border } },
      // interval: 0 บังคับให้แสดงทุก label เพราะมีแค่ 3 หมวดหมู่ ไม่งั้น ECharts จะซ่อน label ที่ยาวที่สุด (OUT) ไปเอง
      axisLabel: { color: palette.value.inkSoft, interval: 0 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: palette.value.border } },
      axisLabel: { color: palette.value.inkSoft },
      splitLine: { lineStyle: { color: palette.value.border, type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        name: 'จำนวนที่เคลื่อนไหว',
        barMaxWidth: 56,
        label: { show: true, position: 'top', color: palette.value.ink, formatter: (p) => Number(p.value).toLocaleString() },
        data: values.map((value, index) => ({ value, itemStyle: { color: colors[index], borderRadius: 4 } })),
      },
    ],
  }
})

// #action
const action = () => {
  const ac = {
    init: async () => {
      await Promise.all([dashboardStore.fetchSummary(), reportStore.fetchInventoryReport()])
    },
  }

  return ac
}

const ac = action()

// #onMounted
onMounted(() => {
  ac.init()
})
</script>

<template>
  <section class="dashboard-page">
    <h1>Dashboard</h1>

    <BaseAsyncState
      :is-loading="dashboardStore.isLoading"
      :error="dashboardStore.error"
      :is-empty="!dashboardStore.summary"
      empty-text="ไม่มีข้อมูลสรุป"
      @retry="ac.init"
    >
      <div v-if="dashboardStore.summary" class="dashboard-kpis">
        <BaseCard class="kpi-card">
          <Wallet :size="20" class="kpi-card__icon" :stroke-width="2" />
          <span class="kpi-card__label">ยอดขายรวม</span>
          <span class="kpi-card__value">{{ dashboardStore.summary.totalSalesAmount.toLocaleString() }} บาท</span>
        </BaseCard>

        <BaseCard class="kpi-card">
          <PackageSearch :size="20" class="kpi-card__icon" :stroke-width="2" />
          <span class="kpi-card__label">จำนวนสินค้า</span>
          <span class="kpi-card__value">{{ dashboardStore.summary.totalProducts.toLocaleString() }}</span>
        </BaseCard>

        <BaseCard class="kpi-card">
          <Boxes :size="20" class="kpi-card__icon" :stroke-width="2" />
          <span class="kpi-card__label">Stock คงเหลือ</span>
          <span class="kpi-card__value">{{ dashboardStore.summary.totalStockQuantity.toLocaleString() }}</span>
        </BaseCard>

        <BaseCard class="kpi-card" :class="{ 'kpi-card--alert': dashboardStore.summary.lowStockProductCount > 0 }">
          <TriangleAlert :size="20" class="kpi-card__icon" :stroke-width="2" />
          <span class="kpi-card__label">สินค้าใกล้หมด</span>
          <span class="kpi-card__value">{{ dashboardStore.summary.lowStockProductCount.toLocaleString() }}</span>
        </BaseCard>
      </div>

      <div class="dashboard-charts">
        <BaseCard title="Stock คงเหลือแยกตามสินค้า">
          <BaseChart :option="stockByProductOption" height="320px" />
          <div class="chart-legend">
            <span class="chart-legend__dot chart-legend__dot--low-stock"></span>
            สินค้าใกล้หมด
          </div>
        </BaseCard>

        <BaseCard title="สรุปการเคลื่อนไหวสต๊อก">
          <BaseChart :option="movementBreakdownOption" height="320px" />
        </BaseCard>
      </div>
    </BaseAsyncState>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.dashboard-page {
  @apply flex flex-col gap-5;
}

.dashboard-kpis {
  @apply grid gap-3;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.kpi-card {
  @apply flex flex-col gap-1;
}

.kpi-card__icon {
  color: var(--brass-dark);
}

.kpi-card--alert .kpi-card__icon {
  color: var(--destructive);
}

.kpi-card__label {
  color: var(--ink-soft);
  font-size: 0.8125rem;
  font-weight: 700;
}

.kpi-card__value {
  color: var(--ink);
  font-size: 1.375rem;
  font-weight: 800;
}

.dashboard-charts {
  @apply grid gap-3;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
}

.chart-legend {
  @apply flex items-center gap-2;
  margin-top: 8px;
  color: var(--ink-soft);
  font-size: 0.75rem;
}

.chart-legend__dot {
  @apply inline-block flex-none rounded-full;
  width: 8px;
  height: 8px;
}

.chart-legend__dot--low-stock {
  background: #d03b3b;
}
</style>
