<script setup lang="ts">
// #import
import { computed, onMounted, reactive, ref } from 'vue'
import { useSalesOrderStore } from '@/stores/salesOrder'
import { useProductStore } from '@/stores/product'
import { useInvoiceStore } from '@/stores/invoice'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import { usePermission } from '@/composables/usePermission'
import BaseAsyncState from '@/components/common/BaseAsyncState.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCombobox from '@/components/common/BaseCombobox.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseInputNumber from '@/components/common/BaseInputNumber.vue'
import type { iInvoice, iSalesOrder, iSalesOrderItemInput, tSalesOrderStatus } from '@/types/salesOrder.types'
import type { iProduct } from '@/types/product.types'

interface iOrderLineForm {
  productId: number | null
  quantity: number | null
}

interface iOrderLineErrors {
  productId?: string
  quantity?: string
}

const statusBadgeVariant: Record<tSalesOrderStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  DRAFT: 'neutral',
  CONFIRMED: 'warning',
  FULFILLED: 'success',
  CANCELLED: 'danger',
}

// #store
const salesOrderStore = useSalesOrderStore()
const productStore = useProductStore()
const invoiceStore = useInvoiceStore()
const toastStore = useToastStore()
const confirmStore = useConfirmStore()
const { hasRole } = usePermission()
const canManageOrder = hasRole('Admin', 'Sales')
const canFulfillOrder = hasRole('Admin', 'Warehouse')

// #ref / #reactive
const actionError = ref<string | null>(null)
const savingOrderId = ref<number | null>(null)
const attachingOrderId = ref<number | null>(null)
const previewingOrderId = ref<number | null>(null)

const isCreateDialogOpen = ref(false)
const createLines = reactive<iOrderLineForm[]>([{ productId: null, quantity: null }])
const createLineErrors = reactive<iOrderLineErrors[]>([{}])
const createFormError = ref<string | null>(null)
const isCreatingOrder = ref(false)

const searchKeyword = ref('')

// #computed
const productOptions = computed(() =>
  productStore.productList.map((p) => ({
    label: `[${p.sku}] ${p.name} · คงเหลือ ${p.stockQuantity} ${p.unit}`,
    value: p.id,
  }))
)

/**
 * กรองรายการ Sales Order ด้วยคำค้นหา (เลขที่ออเดอร์ หรือชื่อ/SKU สินค้าในออเดอร์) แบบ client-side
 */
const filteredSalesOrderList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return salesOrderStore.salesOrderList

  return salesOrderStore.salesOrderList.filter((order) => {
    if (order.orderNumber.toLowerCase().includes(keyword)) return true
    return order.items.some((item) => ac.productLabel(item.productId).toLowerCase().includes(keyword))
  })
})

/**
 * ยอดรวมของแต่ละบรรทัดในฟอร์มสร้าง Sales Order (จำนวน x ราคาปัจจุบันของสินค้า) ใช้แสดงประกอบและรวมเป็นยอดทั้งหมด
 */
const createLineTotal = (line: iOrderLineForm): number => {
  if (line.productId === null || line.quantity === null) return 0
  const product = productStore.productList.find((p) => p.id === line.productId)
  return product ? product.price * line.quantity : 0
}

const createTotalAmount = computed(() => createLines.reduce((sum, line) => sum + createLineTotal(line), 0))

// #action
const action = () => {
  const ac = {
    init: async () => {
      await Promise.all([ac.fetchData(), productStore.fetchProducts(), invoiceStore.fetchInvoices()])
    },

    /**
     * โหลดรายการ Sales Order ทั้งหมด
     */
    fetchData: async () => {
      await salesOrderStore.fetchSalesOrders()
    },

    /**
     * หาชื่อสินค้า (พร้อม SKU) จาก productId เพื่อแสดงในรายการสินค้าของคำสั่งขาย
     */
    productLabel: (productId: number): string => {
      const product = productStore.productList.find((p) => p.id === productId)
      return product ? `[${product.sku}] ${product.name}` : `#${productId}`
    },

    /**
     * หาข้อมูลสินค้าที่เลือกไว้ในแต่ละบรรทัดของฟอร์ม เพื่อแสดงรูปภาพและจำนวนคงเหลือในสต๊อกประกอบการเลือกสินค้า
     */
    selectedProduct: (line: iOrderLineForm): iProduct | null => {
      if (line.productId === null) return null
      return productStore.productList.find((p) => p.id === line.productId) ?? null
    },

    /**
     * หา Invoice ที่ผูกกับ Sales Order นี้ (ระบบสร้าง Invoice อัตโนมัติตอนยืนยันคำสั่งขาย) เพื่อใช้เปิด preview PDF จากหน้า Sales Order โดยตรง
     */
    invoiceForOrder: (orderId: number): iInvoice | null => {
      return invoiceStore.invoiceList.find((invoice) => invoice.salesOrderId === orderId) ?? null
    },

    resetCreateForm: () => {
      createLines.splice(0, createLines.length, { productId: null, quantity: null })
      createLineErrors.splice(0, createLineErrors.length, {})
      createFormError.value = null
    },

    /**
     * ตรวจสอบแต่ละบรรทัดของฟอร์ม (ต้องเลือกสินค้า, จำนวนมากกว่า 0, ห้ามเลือกสินค้าซ้ำกันคนละบรรทัด)
     * แล้วบันทึก error รายบรรทัดไว้แสดงใต้แต่ละช่อง ก่อนคืนรายการ input ที่ส่งไป backend ได้ถ้าผ่านครบทุกบรรทัด
     */
    validateLines: (): iSalesOrderItemInput[] | null => {
      const errors: iOrderLineErrors[] = createLines.map(() => ({}))
      const seenProductIds = new Set<number>()
      let hasError = false

      createLines.forEach((line, index) => {
        if (line.productId === null) {
          errors[index].productId = 'กรุณาเลือกสินค้า'
          hasError = true
        } else if (seenProductIds.has(line.productId)) {
          errors[index].productId = 'สินค้านี้ถูกเลือกไว้ในบรรทัดอื่นแล้ว'
          hasError = true
        } else {
          seenProductIds.add(line.productId)
        }

        if (line.quantity === null || line.quantity <= 0) {
          errors[index].quantity = 'กรุณาระบุจำนวนที่มากกว่า 0'
          hasError = true
        }
      })

      createLineErrors.splice(0, createLineErrors.length, ...errors)
      if (hasError) return null

      return createLines.map((line) => ({ productId: line.productId as number, quantity: line.quantity as number }))
    },

    /**
     * สร้าง Sales Order สถานะ DRAFT จากรายการสินค้าในฟอร์ม แล้วปิด dialog (list จะอัปเดตเองผ่าน store)
     */
    submitCreate: async () => {
      const items = ac.validateLines()
      if (!items) return

      createFormError.value = null
      isCreatingOrder.value = true

      try {
        await salesOrderStore.createSalesOrder({ items })
        isCreateDialogOpen.value = false
        ac.resetCreateForm()
        toastStore.push('สร้าง Sales Order สำเร็จ')
      } catch (e) {
        createFormError.value = e instanceof Error ? e.message : 'สร้าง Sales Order ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        isCreatingOrder.value = false
      }
    },
  }

  return ac
}

const ac = action()

// #event
const event = () => {
  const ev = {
    onOpenCreateDialog: () => {
      ac.resetCreateForm()
      isCreateDialogOpen.value = true
    },

    onAddLine: () => {
      createLines.push({ productId: null, quantity: null })
      createLineErrors.push({})
    },

    onRemoveLine: (index: number) => {
      createLines.splice(index, 1)
      createLineErrors.splice(index, 1)
    },

    onSubmitCreate: () => {
      ac.submitCreate()
    },

    onConfirm: async (order: iSalesOrder) => {
      actionError.value = null
      savingOrderId.value = order.id

      try {
        await salesOrderStore.confirmSalesOrder(order.id)
        await invoiceStore.fetchInvoices()
        toastStore.push('ยืนยันคำสั่งขายสำเร็จ')
      } catch (e) {
        actionError.value = e instanceof Error ? e.message : 'ยืนยันคำสั่งขายไม่สำเร็จ'
      } finally {
        savingOrderId.value = null
      }
    },

    onAttachPayment: async (order: iSalesOrder, e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      actionError.value = null
      attachingOrderId.value = order.id

      try {
        await salesOrderStore.attachPayment(order.id, file)
        toastStore.push('แนบไฟล์หลักฐานการชำระเงินสำเร็จ')
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : 'แนบไฟล์หลักฐานการชำระเงินไม่สำเร็จ'
      } finally {
        attachingOrderId.value = null
        ;(e.target as HTMLInputElement).value = ''
      }
    },

    onPreviewInvoice: async (invoice: iInvoice) => {
      actionError.value = null
      previewingOrderId.value = invoice.salesOrderId

      try {
        await invoiceStore.previewInvoicePdf(invoice.id)
      } catch (e) {
        actionError.value = e instanceof Error ? e.message : 'เปิด Invoice ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        previewingOrderId.value = null
      }
    },

    onFulfill: async (order: iSalesOrder) => {
      actionError.value = null
      savingOrderId.value = order.id

      try {
        await salesOrderStore.fulfillSalesOrder(order.id)
        await productStore.fetchProducts()
        toastStore.push('ตัดสต๊อกสำเร็จ')
      } catch (e) {
        actionError.value = e instanceof Error ? e.message : 'ดำเนินการตัดสต๊อกไม่สำเร็จ'
      } finally {
        savingOrderId.value = null
      }
    },

    onCancel: async (order: iSalesOrder) => {
      const confirmed = await confirmStore.ask({
        title: 'ยกเลิกคำสั่งขาย',
        message: `ยืนยันยกเลิกคำสั่งขาย ${order.orderNumber}? การดำเนินการนี้ย้อนกลับไม่ได้`,
        confirmText: 'ยกเลิกคำสั่งขาย',
        danger: true,
      })
      if (!confirmed) return

      actionError.value = null
      savingOrderId.value = order.id

      try {
        await salesOrderStore.cancelSalesOrder(order.id)
        toastStore.push('ยกเลิกคำสั่งขายสำเร็จ')
      } catch (e) {
        actionError.value = e instanceof Error ? e.message : 'ยกเลิกคำสั่งขายไม่สำเร็จ'
      } finally {
        savingOrderId.value = null
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
  <section class="order-page">
    <div class="order-page__header">
      <h1>Sales Order</h1>
      <BaseButton v-if="canManageOrder" @click="ev.onOpenCreateDialog">+ สร้าง Sales Order</BaseButton>
    </div>

    <BaseInput
      v-model="searchKeyword"
      type="search"
      placeholder="ค้นหา Sales Order (เลขที่ออเดอร์ หรือชื่อสินค้า)"
      class="order-search"
    />

    <BaseAlert v-if="actionError" variant="destructive">{{ actionError }}</BaseAlert>

    <BaseDialog v-model="isCreateDialogOpen" title="สร้าง Sales Order" max-width="640px">
      <form class="order-form" @submit.prevent="ev.onSubmitCreate">
        <div v-for="(line, index) in createLines" :key="index" class="order-line">
          <div class="order-line__row">
            <img
              v-if="ac.selectedProduct(line)?.imageUrl"
              :src="ac.selectedProduct(line)!.imageUrl"
              class="order-line__thumb"
              alt=""
            />
            <div v-else class="order-line__thumb order-line__thumb--empty" aria-hidden="true" />

            <BaseCombobox
              v-model="line.productId"
              class="order-line__product"
              label="สินค้า"
              placeholder="เลือกสินค้า"
              :options="productOptions"
              :error="createLineErrors[index]?.productId"
            />
            <BaseInputNumber v-model="line.quantity" label="จำนวน" :error="createLineErrors[index]?.quantity" />
            <span class="order-line__total">{{ createLineTotal(line).toLocaleString() }} บาท</span>
            <BaseButton
              variant="ghost"
              type="button"
              :disabled="createLines.length === 1"
              @click="ev.onRemoveLine(index)"
            >
              ลบ
            </BaseButton>
          </div>

          <span v-if="ac.selectedProduct(line)" class="order-line__stock">
            คงเหลือในสต๊อก {{ ac.selectedProduct(line)!.stockQuantity }} {{ ac.selectedProduct(line)!.unit }}
          </span>
        </div>

        <BaseButton variant="secondary" type="button" @click="ev.onAddLine">+ เพิ่มรายการสินค้า</BaseButton>

        <div class="order-form__summary">
          <span class="order-form__total-label">ยอดรวม</span>
          <span class="order-form__total-amount">{{ createTotalAmount.toLocaleString() }} บาท</span>
        </div>

        <BaseButton type="submit" :loading="isCreatingOrder">สร้าง Sales Order</BaseButton>

        <BaseAlert v-if="createFormError" variant="destructive">{{ createFormError }}</BaseAlert>
      </form>
    </BaseDialog>

    <BaseAsyncState
      :is-loading="salesOrderStore.isLoading"
      :error="salesOrderStore.error"
      :is-empty="filteredSalesOrderList.length === 0"
      empty-text="ไม่มี Sales Order"
      @retry="ac.fetchData"
    >
      <template #empty>
        <template v-if="salesOrderStore.salesOrderList.length === 0">
          <template v-if="productStore.productList.length === 0">
            <p class="empty-hint">ยังไม่มีสินค้าในระบบ ต้องเพิ่มสินค้าก่อนจึงจะสร้าง Sales Order ได้</p>
            <RouterLink class="empty-link" to="/products">ไปที่หน้าสินค้า</RouterLink>
          </template>
          <template v-else>
            <p class="empty-hint">ยังไม่มี Sales Order</p>
            <BaseButton v-if="canManageOrder" @click="ev.onOpenCreateDialog">+ สร้าง Sales Order แรกของคุณ</BaseButton>
          </template>
        </template>
        <p v-else class="empty-hint">ไม่พบ Sales Order ที่ตรงกับ "{{ searchKeyword }}"</p>
      </template>

      <ul class="order-list">
        <li v-for="order in filteredSalesOrderList" :key="order.id" class="order-row">
          <div class="order-row__header">
            <span class="order-row__number">{{ order.orderNumber }}</span>
            <BaseBadge :variant="statusBadgeVariant[order.status]">{{ order.status }}</BaseBadge>
            <span class="order-row__total">{{ order.totalAmount.toLocaleString() }} บาท</span>
          </div>

          <ul class="order-row__items">
            <li v-for="item in order.items" :key="item.id">
              {{ ac.productLabel(item.productId) }} × {{ item.quantity }} @ {{ item.unitPrice.toLocaleString() }} บาท
            </li>
          </ul>

          <div v-if="order.payments.length > 0" class="order-row__payments">
            <a
              v-for="payment in order.payments"
              :key="payment.id"
              :href="payment.fileUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="order-row__payment-chip"
            >
              📎 {{ payment.fileName }}
            </a>
          </div>

          <label
            v-if="canManageOrder && order.status === 'CONFIRMED'"
            class="order-row__attach"
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              :disabled="attachingOrderId === order.id"
              @change="ev.onAttachPayment(order, $event)"
            />
            <span>{{ attachingOrderId === order.id ? 'กำลังอัปโหลด...' : '+ แนบไฟล์หลักฐานการชำระเงิน' }}</span>
          </label>

          <div class="order-row__actions">
            <BaseButton
              v-if="canManageOrder && order.status === 'DRAFT'"
              :loading="savingOrderId === order.id"
              @click="ev.onConfirm(order)"
            >
              ยืนยันคำสั่งขาย
            </BaseButton>

            <div v-if="canFulfillOrder && order.status === 'CONFIRMED'" class="order-row__fulfill-group">
              <BaseButton
                :disabled="order.payments.length === 0"
                :loading="savingOrderId === order.id"
                @click="ev.onFulfill(order)"
              >
                ดำเนินการ (ตัดสต๊อก)
              </BaseButton>
              <span v-if="order.payments.length === 0" class="order-row__hint">
                ต้องแนบไฟล์หลักฐานการชำระเงินอย่างน้อย 1 ไฟล์ก่อนตัดสต๊อก
              </span>
            </div>

            <BaseButton
              v-if="canManageOrder && ac.invoiceForOrder(order.id)"
              variant="secondary"
              :loading="previewingOrderId === order.id"
              @click="ev.onPreviewInvoice(ac.invoiceForOrder(order.id)!)"
            >
              Preview Invoice
            </BaseButton>

            <BaseButton
              v-if="canManageOrder && (order.status === 'DRAFT' || order.status === 'CONFIRMED')"
              variant="secondary"
              class="order-row__cancel"
              :loading="savingOrderId === order.id"
              @click="ev.onCancel(order)"
            >
              ยกเลิก
            </BaseButton>
          </div>
        </li>
      </ul>
    </BaseAsyncState>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.order-page {
  @apply flex flex-col gap-5;
}

.order-page__header {
  @apply flex items-center justify-between;
}

.order-page :deep(.order-search) {
  max-width: 360px;
}

.order-form {
  @apply flex flex-col gap-4;
}

.order-line {
  @apply flex flex-col gap-1;
}

.order-line__row {
  @apply flex items-end gap-2;
}

.order-line__thumb {
  @apply flex-none rounded-lg object-cover;
  width: 40px;
  height: 40px;
  border: 1px solid var(--paper-border);
}

.order-line__thumb--empty {
  background: var(--paper-highlight);
}

.order-line__product {
  flex: 1;
}

.order-line__total {
  @apply flex-none;
  min-width: 96px;
  padding-bottom: 10px;
  color: var(--ink-soft);
  font-size: 0.8125rem;
  text-align: right;
}

.order-line__stock {
  padding-left: 48px;
  color: var(--ink-soft);
  font-size: 0.75rem;
}

.order-form__summary {
  @apply flex items-center justify-between;
  padding-top: 10px;
  border-top: 1px dashed var(--paper-border);
}

.order-form__total-label {
  color: var(--ink-soft);
  font-size: 0.875rem;
  font-weight: 700;
}

.order-form__total-amount {
  color: var(--ink);
  font-size: 1.125rem;
  font-weight: 800;
}

.order-list {
  @apply flex flex-col gap-3;
  list-style: none;
  margin: 0;
  padding: 0;
}

.order-row {
  @apply flex flex-col gap-2;
  padding: 14px;
  border: 1px solid var(--paper-border);
  border-radius: 10px;
  background: var(--paper);
}

.order-row__header {
  @apply flex flex-wrap items-center gap-2;
}

.order-row__number {
  font-weight: 800;
  color: var(--ink);
}

.order-row__total {
  margin-left: auto;
  font-weight: 700;
  color: var(--ink);
}

.order-row__items {
  @apply flex flex-col gap-1;
  margin: 0;
  padding: 0 0 0 4px;
  list-style: none;
  color: var(--ink-soft);
  font-size: 0.8125rem;
}

.order-row__actions {
  @apply flex flex-wrap items-center gap-x-2 gap-y-3;
  padding-top: 4px;
}

.order-row__fulfill-group {
  @apply flex flex-col items-start gap-1;
}

.order-row__cancel {
  margin-left: auto;
}

.order-row__payments {
  @apply flex flex-wrap items-center gap-2;
}

.order-row__payment-chip {
  @apply inline-flex items-center rounded-full;
  padding: 4px 10px;
  border: 1px solid var(--paper-border);
  background: var(--paper-card);
  color: var(--ink-soft);
  font-size: 0.75rem;
}

.order-row__payment-chip:hover {
  color: var(--ink);
  border-color: var(--brass);
}

.order-row__attach {
  @apply inline-flex w-fit cursor-pointer items-center rounded-lg;
  padding: 6px 10px;
  border: 1px dashed var(--paper-border);
  color: var(--ink-soft);
  font-size: 0.8125rem;
  font-weight: 700;
}

.order-row__attach:hover {
  border-color: var(--brass);
  color: var(--ink);
}

.order-row__attach input[type='file'] {
  display: none;
}

.order-row__hint {
  color: var(--destructive);
  font-size: 0.75rem;
}

.empty-hint {
  margin: 0;
}

.empty-link {
  color: var(--brass-dark);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
