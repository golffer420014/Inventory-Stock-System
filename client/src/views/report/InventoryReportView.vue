<script setup lang="ts">
// #import
import { computed, onMounted, ref } from 'vue'
import { useReportStore } from '@/stores/report'
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseAsyncState from '@/components/common/BaseAsyncState.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'

// #store
const reportStore = useReportStore()

// #ref / #reactive
const startDate = ref('')
const endDate = ref('')

// #computed
/**
 * ตรวจว่าช่วงวันที่ที่เลือกถูกต้องหรือไม่ (วันที่เริ่มต้องไม่มากกว่าวันที่สิ้นสุด) ใช้กันไม่ให้ query ช่วงวันที่ที่ไม่สมเหตุสมผล
 */
const dateRangeError = computed(() =>
  startDate.value && endDate.value && startDate.value > endDate.value
    ? 'วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด'
    : ''
)

// #action
const action = () => {
  const ac = {
    init: async () => {
      await ac.fetchData()
    },

    /**
     * โหลดรายงานคลังสินค้า: สต๊อกคงเหลือปัจจุบัน + ยอดเคลื่อนไหวในช่วงวันที่ที่เลือกอยู่ในฟอร์ม
     */
    fetchData: async () => {
      await reportStore.fetchInventoryReport({
        startDate: startDate.value || undefined,
        endDate: endDate.value || undefined,
      })
    },
  }

  return ac
}

const ac = action()

// #event
const event = () => {
  const ev = {
    onFilter: () => {
      if (dateRangeError.value) return
      ac.fetchData()
    },

    onClearFilter: () => {
      startDate.value = ''
      endDate.value = ''
      ac.fetchData()
    },

    onExportCsv: () => {
      if (dateRangeError.value) return
      reportStore.exportInventoryCsv({ startDate: startDate.value || undefined, endDate: endDate.value || undefined })
    },

    onExportPdf: () => {
      if (dateRangeError.value) return
      reportStore.exportInventoryPdf({ startDate: startDate.value || undefined, endDate: endDate.value || undefined })
    },

    onPreviewPdf: () => {
      if (dateRangeError.value) return
      reportStore.previewInventoryPdf({ startDate: startDate.value || undefined, endDate: endDate.value || undefined })
    },
  }

  return ev
}

const ev = event()

// #onMounted
onMounted(() => {
  ac.init()
})
</script>

<template>
  <section class="report-page">
    <h1>Inventory Report</h1>

    <BaseCard class="report-filter">
      <div class="report-filter__query">
        <div class="report-filter__fields">
          <BaseInput v-model="startDate" type="date" label="ตั้งแต่วันที่ (ยอดเคลื่อนไหว)" />
          <BaseInput v-model="endDate" type="date" label="ถึงวันที่ (ยอดเคลื่อนไหว)" :error="dateRangeError" />
        </div>
        <div class="report-filter__query-actions">
          <BaseButton :disabled="!!dateRangeError" @click="ev.onFilter">กรองข้อมูล</BaseButton>
          <BaseButton variant="secondary" @click="ev.onClearFilter">ล้างตัวกรอง</BaseButton>
        </div>
      </div>

      <div class="report-filter__export">
        <span class="report-filter__export-label">ส่งออกข้อมูล</span>
        <div class="report-filter__export-actions">
          <BaseButton variant="secondary" :disabled="!!dateRangeError" :loading="reportStore.isExporting" @click="ev.onExportCsv">
            Export CSV
          </BaseButton>
          <BaseButton variant="secondary" :disabled="!!dateRangeError" :loading="reportStore.isExporting" @click="ev.onExportPdf">
            Download PDF
          </BaseButton>
          <BaseButton variant="secondary" :disabled="!!dateRangeError" :loading="reportStore.isExporting" @click="ev.onPreviewPdf">
            Preview PDF
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseAlert v-if="reportStore.exportError" variant="destructive">{{ reportStore.exportError }}</BaseAlert>

    <BaseAsyncState
      :is-loading="reportStore.isLoading"
      :error="reportStore.error"
      :is-empty="!reportStore.inventoryReport"
      empty-text="ไม่มีข้อมูลคลังสินค้า"
      @retry="ac.fetchData"
    >
      <div v-if="reportStore.inventoryReport" class="report-summary">
        <BaseCard title="Stock คงเหลือ">
          <p class="report-summary__value">{{ reportStore.inventoryReport.totalStockQuantity.toLocaleString() }}</p>
        </BaseCard>
        <BaseCard title="สินค้าใกล้หมด">
          <p class="report-summary__value">{{ reportStore.inventoryReport.lowStockProductCount }}</p>
        </BaseCard>
        <BaseCard title="รับเข้า (IN)">
          <p class="report-summary__value report-summary__value--in">
            +{{ reportStore.inventoryReport.totalIn.toLocaleString() }}
          </p>
        </BaseCard>
        <BaseCard title="เบิกออก (OUT)">
          <p class="report-summary__value report-summary__value--out">
            -{{ reportStore.inventoryReport.totalOut.toLocaleString() }}
          </p>
        </BaseCard>
        <BaseCard title="ปรับปรุง (ADJ)">
          <p class="report-summary__value">{{ reportStore.inventoryReport.totalAdjustment.toLocaleString() }}</p>
        </BaseCard>
      </div>

      <ul class="report-list">
        <li
          v-for="product in reportStore.inventoryReport?.products"
          :key="product.productId"
          class="report-row"
        >
          <div class="report-row__info">
            <span class="report-row__number">[{{ product.sku }}] {{ product.name }}</span>
          </div>

          <div class="report-row__stock">
            <BaseBadge v-if="product.isLowStock" variant="danger">ใกล้หมด</BaseBadge>
            <span class="report-row__amount">{{ product.stockQuantity.toLocaleString() }}</span>
          </div>
        </li>
      </ul>
    </BaseAsyncState>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.report-page {
  @apply flex flex-col gap-5;
}

.report-filter {
  @apply flex flex-col gap-4;
}

.report-filter__query {
  @apply flex flex-wrap items-end justify-between gap-4;
}

.report-filter__fields {
  @apply flex flex-wrap gap-3;
}

.report-filter__query-actions {
  @apply flex items-center gap-2;
}

.report-filter__export {
  @apply flex flex-wrap items-center justify-between gap-3;
  padding-top: 14px;
  border-top: 1px dashed var(--paper-border);
}

.report-filter__export-label {
  color: var(--ink-soft);
  font-size: 0.8125rem;
  font-weight: 700;
}

.report-filter__export-actions {
  @apply flex flex-wrap items-center gap-2;
}

.report-summary {
  @apply grid gap-3;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  margin-bottom: 16px;
}

.report-summary__value {
  margin: 0;
  color: var(--ink);
  font-size: 1.25rem;
  font-weight: 800;
}

.report-summary__value--in {
  color: var(--success);
}

.report-summary__value--out {
  color: var(--destructive);
}

.report-list {
  @apply flex flex-col gap-2;
  list-style: none;
  margin: 0;
  padding: 0;
}

.report-row {
  @apply flex items-center justify-between gap-3;
  padding: 10px 12px;
  border: 1px solid var(--paper-border);
  border-radius: 10px;
  background: var(--paper);
}

.report-row__info {
  @apply flex flex-col gap-1;
  min-width: 0;
}

.report-row__number {
  font-weight: 700;
  color: var(--ink);
}

.report-row__stock {
  @apply flex flex-none items-center gap-2;
}

.report-row__amount {
  font-weight: 800;
  font-size: 0.9375rem;
  color: var(--ink);
}
</style>
