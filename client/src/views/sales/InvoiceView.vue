<script setup lang="ts">
// #import
import { computed, onMounted, ref } from 'vue'
import { useInvoiceStore } from '@/stores/invoice'
import { useSalesOrderStore } from '@/stores/salesOrder'
import { useProductStore } from '@/stores/product'
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseAsyncState from '@/components/common/BaseAsyncState.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import type { iInvoice } from '@/types/salesOrder.types'

// #store
const invoiceStore = useInvoiceStore()
const salesOrderStore = useSalesOrderStore()
const productStore = useProductStore()

// #ref / #reactive
const exportingInvoiceId = ref<number | null>(null)
const exportError = ref<string | null>(null)
const searchKeyword = ref('')

// #action
const action = () => {
  const ac = {
    init: async () => {
      await Promise.all([ac.fetchData(), salesOrderStore.fetchSalesOrders(), productStore.fetchProducts()])
    },

    /**
     * โหลดรายการ Invoice ทั้งหมด
     */
    fetchData: async () => {
      await invoiceStore.fetchInvoices()
    },

    /**
     * หาเลขที่ Sales Order จาก salesOrderId เพื่อแสดงอ้างอิงในแต่ละ Invoice
     */
    orderNumber: (salesOrderId: number): string => {
      const order = salesOrderStore.salesOrderList.find((o) => o.id === salesOrderId)
      return order ? order.orderNumber : `#${salesOrderId}`
    },

    /**
     * หาชื่อสินค้า (พร้อม SKU) จาก productId เพื่อแสดงในรายการสินค้าของ Invoice
     */
    productLabel: (productId: number): string => {
      const product = productStore.productList.find((p) => p.id === productId)
      return product ? `[${product.sku}] ${product.name}` : `#${productId}`
    },
  }

  return ac
}

const ac = action()

// #computed
/**
 * กรองรายการ Invoice ด้วยคำค้นหา (เลขที่ Invoice หรือเลขที่ Sales Order อ้างอิง) แบบ client-side
 */
const filteredInvoiceList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return invoiceStore.invoiceList

  return invoiceStore.invoiceList.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(keyword) ||
      ac.orderNumber(invoice.salesOrderId).toLowerCase().includes(keyword)
  )
})

// #event
const event = () => {
  const ev = {
    onDownloadPdf: async (invoice: iInvoice) => {
      exportError.value = null
      exportingInvoiceId.value = invoice.id

      try {
        await invoiceStore.exportInvoicePdf(invoice.id)
      } catch (e) {
        exportError.value = e instanceof Error ? e.message : 'ดาวน์โหลด Invoice ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        exportingInvoiceId.value = null
      }
    },

    onPreviewPdf: async (invoice: iInvoice) => {
      exportError.value = null
      exportingInvoiceId.value = invoice.id

      try {
        await invoiceStore.previewInvoicePdf(invoice.id)
      } catch (e) {
        exportError.value = e instanceof Error ? e.message : 'เปิด Invoice ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        exportingInvoiceId.value = null
      }
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
  <section class="invoice-page">
    <h1>Invoice</h1>

    <BaseInput
      v-model="searchKeyword"
      type="search"
      placeholder="ค้นหา Invoice (เลขที่ Invoice หรือเลขที่ออเดอร์)"
      class="invoice-search"
    />

    <BaseAlert v-if="exportError" variant="destructive">{{ exportError }}</BaseAlert>

    <BaseAsyncState
      :is-loading="invoiceStore.isLoading"
      :error="invoiceStore.error"
      :is-empty="filteredInvoiceList.length === 0"
      empty-text="ไม่มี Invoice"
      @retry="ac.fetchData"
    >
      <template #empty>
        <p class="empty-hint">
          {{
            invoiceStore.invoiceList.length === 0
              ? 'ยังไม่มี Invoice — Invoice จะถูกสร้างอัตโนมัติเมื่อยืนยัน Sales Order'
              : `ไม่พบ Invoice ที่ตรงกับ "${searchKeyword}"`
          }}
        </p>
      </template>

      <ul class="invoice-list">
        <li v-for="invoice in filteredInvoiceList" :key="invoice.id" class="invoice-row">
          <div class="invoice-row__header">
            <span class="invoice-row__number">{{ invoice.invoiceNumber }}</span>
            <span class="invoice-row__ref">อ้างอิง {{ ac.orderNumber(invoice.salesOrderId) }}</span>
            <span class="invoice-row__total">{{ invoice.totalAmount.toLocaleString() }} บาท</span>
          </div>

          <ul class="invoice-row__items">
            <li v-for="item in invoice.items" :key="item.id">
              {{ ac.productLabel(item.productId) }} × {{ item.quantity }} @ {{ item.unitPrice.toLocaleString() }} บาท
            </li>
          </ul>

          <div class="invoice-row__actions">
            <BaseButton
              variant="secondary"
              :loading="exportingInvoiceId === invoice.id"
              @click="ev.onDownloadPdf(invoice)"
            >
              Download PDF
            </BaseButton>
            <BaseButton
              variant="secondary"
              :loading="exportingInvoiceId === invoice.id"
              @click="ev.onPreviewPdf(invoice)"
            >
              Preview PDF
            </BaseButton>
          </div>
        </li>
      </ul>
    </BaseAsyncState>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.invoice-page {
  @apply flex flex-col gap-5;
}

.invoice-page :deep(.invoice-search) {
  max-width: 360px;
}

.empty-hint {
  margin: 0;
}

.invoice-list {
  @apply flex flex-col gap-3;
  list-style: none;
  margin: 0;
  padding: 0;
}

.invoice-row {
  @apply flex flex-col gap-2;
  padding: 14px;
  border: 1px solid var(--paper-border);
  border-radius: 10px;
  background: var(--paper);
}

.invoice-row__header {
  @apply flex flex-wrap items-center gap-2;
}

.invoice-row__number {
  font-weight: 800;
  color: var(--ink);
}

.invoice-row__ref {
  color: var(--ink-soft);
  font-size: 0.8125rem;
}

.invoice-row__total {
  margin-left: auto;
  font-weight: 700;
  color: var(--ink);
}

.invoice-row__items {
  @apply flex flex-col gap-1;
  margin: 0;
  padding: 0 0 0 4px;
  list-style: none;
  color: var(--ink-soft);
  font-size: 0.8125rem;
}

.invoice-row__actions {
  @apply flex flex-wrap items-center gap-2;
  padding-top: 4px;
}
</style>
