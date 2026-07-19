<script setup lang="ts">
// #import
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

// #props
const props = withDefaults(
  defineProps<{
    option: EChartsOption
    height?: string
  }>(),
  {
    height: '280px',
  }
)

// #ref / #reactive
const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// #action
const action = () => {
  const ac = {
    init: () => {
      if (!chartRef.value) return
      chartInstance = echarts.init(chartRef.value)
      chartInstance.setOption(props.option)
    },

    /**
     * อัปเดตกราฟทั้งชุดเมื่อ option เปลี่ยน (ข้อมูลใหม่ หรือสลับ light/dark theme)
     * ใช้ notMerge เพราะสีและ series อาจเปลี่ยนทั้งหมดตอนสลับ theme
     */
    updateOption: () => {
      chartInstance?.setOption(props.option, { notMerge: true })
    },

    resize: () => {
      chartInstance?.resize()
    },
  }

  return ac
}

const ac = action()

// #event
const event = () => {
  const ev = {
    onWindowResize: () => {
      ac.resize()
    },
  }

  return ev
}

const ev = event()

// #watch
watch(
  () => props.option,
  () => {
    ac.updateOption()
  },
  { deep: true }
)

// #onMounted
onMounted(() => {
  ac.init()
  window.addEventListener('resize', ev.onWindowResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', ev.onWindowResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <div ref="chartRef" class="base-chart" :style="{ height }"></div>
</template>

<style scoped>
.base-chart {
  width: 100%;
}
</style>
