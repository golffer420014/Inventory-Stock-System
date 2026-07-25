<script setup lang="ts">
// #import
import { computed, onMounted, ref } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useProductStore } from '@/stores/product'
import { usePermission } from '@/composables/usePermission'
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseAsyncState from '@/components/common/BaseAsyncState.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCombobox from '@/components/common/BaseCombobox.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseInputNumber from '@/components/common/BaseInputNumber.vue'
import type { iInventoryMovement } from '@/types/inventory.types'

type tStockActionMode = 'IN' | 'OUT' | 'ADJUSTMENT'
type tAdjustmentDirection = 'INCREASE' | 'DECREASE'

const typeLabel: Record<iInventoryMovement['type'], string> = {
  IN: 'Stock In',
  OUT: 'Stock Out',
  ADJUSTMENT: 'Adjustment',
}

/** ข้อความ/label ของแต่ละโหมด รวมไว้ที่เดียวเพราะฟอร์ม Stock In / Stock Out / Adjustment มีโครงสร้างเดียวกันทุกอย่าง ต่างแค่ label กับ validation */
const modeConfig: Record<
  tStockActionMode,
  { title: string; buttonLabel: string; quantityLabel: string; successText: string; invalidText: string }
> = {
  IN: {
    title: 'Stock In - รับสินค้าเข้าคลัง',
    buttonLabel: '+ บันทึกรับเข้า',
    quantityLabel: 'จำนวนที่รับเข้า',
    successText: 'บันทึกรับสินค้าเข้าคลังสำเร็จ',
    invalidText: 'กรุณาเลือกสินค้าและระบุจำนวนที่รับเข้าให้ถูกต้อง',
  },
  OUT: {
    title: 'Stock Out - เบิกสินค้าออกจากคลัง',
    buttonLabel: '+ บันทึกเบิกออก',
    quantityLabel: 'จำนวนที่เบิกออก',
    successText: 'บันทึกเบิกสินค้าออกสำเร็จ',
    invalidText: 'กรุณาเลือกสินค้าและระบุจำนวนที่เบิกออกให้ถูกต้อง',
  },
  ADJUSTMENT: {
    title: 'Stock Adjustment - ปรับปรุงจำนวนสินค้า',
    buttonLabel: '+ ปรับปรุงจำนวนสินค้า',
    quantityLabel: 'จำนวนที่ปรับ',
    successText: 'บันทึกปรับปรุงจำนวนสินค้าสำเร็จ',
    invalidText: 'กรุณาเลือกสินค้าและระบุจำนวนที่ปรับให้ถูกต้อง',
  },
}

const directionOptions = [
  { label: 'เพิ่มจำนวน (+)', value: 'INCREASE' as tAdjustmentDirection },
  { label: 'ลดจำนวน (-)', value: 'DECREASE' as tAdjustmentDirection },
]

// #store
const inventoryStore = useInventoryStore()
const productStore = useProductStore()
const { hasRole } = usePermission()
const canManageStock = hasRole('Admin', 'Warehouse')

// #ref / #reactive
const activeMode = ref<tStockActionMode | null>(null)
const selectedProductId = ref<number | null>(null)
const quantity = ref<number | null>(null)
const direction = ref<tAdjustmentDirection>('INCREASE')
const note = ref('')
const formError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isSaving = ref(false)
const searchKeyword = ref('')

// #computed
const isDialogOpen = computed({
  get: () => activeMode.value !== null,
  set: (value: boolean) => {
    if (!value) activeMode.value = null
  },
})

const productOptions = computed(() =>
  productStore.productList.map((p) => ({ label: `[${p.sku}] ${p.name}`, value: p.id }))
)

const selectedProduct = computed(
  () => productStore.productList.find((p) => p.id === selectedProductId.value) ?? null
)

// #action
const action = () => {
  const ac = {
    init: async () => {
      await ac.fetchData()
    },

    /**
     * โหลดประวัติการเคลื่อนไหวของสินค้า พร้อมรายการสินค้าไว้แสดงชื่อ/SKU ประกอบ และใช้ในฟอร์ม Stock In/Out/Adjustment
     */
    fetchData: async () => {
      await Promise.all([inventoryStore.fetchMovements(), productStore.fetchProducts()])
    },

    resetForm: () => {
      selectedProductId.value = null
      quantity.value = null
      direction.value = 'INCREASE'
      note.value = ''
    },

    /**
     * หาชื่อสินค้า (พร้อม SKU) จาก productId เพื่อแสดงประกอบรายการเคลื่อนไหว
     */
    productLabel: (productId: number): string => {
      const product = productStore.productList.find((p) => p.id === productId)
      return product ? `[${product.sku}] ${product.name}` : `#${productId}`
    },

    /**
     * แสดงจำนวนพร้อมเครื่องหมาย +/- ตามทิศทางของรายการเคลื่อนไหว
     * IN = รับเข้าเสมอบวก, OUT = เบิกออกเสมอลบ, ADJUSTMENT = ใช้เครื่องหมายที่บันทึกไว้ตรง ๆ
     */
    signedQuantity: (movement: iInventoryMovement): string => {
      if (movement.type === 'OUT') return `-${movement.quantity}`
      if (movement.type === 'IN') return `+${movement.quantity}`
      return movement.quantity > 0 ? `+${movement.quantity}` : `${movement.quantity}`
    },

    formatDate: (isoDate: string): string => {
      return new Date(isoDate).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
    },

    /**
     * บันทึก Stock In / Stock Out / Adjustment ตาม activeMode ปัจจุบัน
     * Stock Out ต้องเช็คสต๊อกพอก่อนยิง, Adjustment ต้องแปลงทิศทาง (เพิ่ม/ลด) เป็นส่วนต่างมีเครื่องหมายก่อนส่ง
     * (ฝั่ง server ตรวจซ้ำอีกครั้งกันแข่งกันเบิก/ปรับพร้อมกัน)
     */
    submit: async () => {
      const mode = activeMode.value
      if (!mode || selectedProductId.value === null || quantity.value === null || quantity.value <= 0) {
        formError.value = mode ? modeConfig[mode].invalidText : null
        return
      }

      const signedQuantity = mode === 'ADJUSTMENT' && direction.value === 'DECREASE' ? -quantity.value : quantity.value

      if (mode === 'OUT' && selectedProduct.value && quantity.value > selectedProduct.value.stockQuantity) {
        formError.value = 'สต๊อกคงเหลือไม่พอสำหรับเบิกออกจำนวนนี้'
        return
      }

      if (mode === 'ADJUSTMENT' && selectedProduct.value && selectedProduct.value.stockQuantity + signedQuantity < 0) {
        formError.value = 'ปรับสต๊อกไม่ได้ เพราะจะทำให้จำนวนติดลบ'
        return
      }

      formError.value = null
      successMessage.value = null
      isSaving.value = true

      try {
        const input = { productId: selectedProductId.value, quantity: quantity.value, note: note.value.trim() || undefined }

        if (mode === 'IN') await inventoryStore.createStockIn(input)
        else if (mode === 'OUT') await inventoryStore.createStockOut(input)
        else await inventoryStore.createAdjustment({ ...input, quantity: signedQuantity })

        successMessage.value = modeConfig[mode].successText
        ac.resetForm()
        await productStore.fetchProducts()
      } catch (e) {
        formError.value = e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        isSaving.value = false
      }
    },
  }

  return ac
}

const ac = action()

// #computed
/**
 * กรองประวัติการเคลื่อนไหวด้วยคำค้นหา (ชื่อ/SKU สินค้า หรือหมายเหตุ) แบบ client-side
 */
const filteredMovementList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return inventoryStore.movementList

  return inventoryStore.movementList.filter(
    (movement) =>
      ac.productLabel(movement.productId).toLowerCase().includes(keyword) ||
      (movement.note ?? '').toLowerCase().includes(keyword)
  )
})

// #event
const event = () => {
  const ev = {
    onOpenForm: (mode: tStockActionMode) => {
      ac.resetForm()
      formError.value = null
      successMessage.value = null
      activeMode.value = mode
    },

    onSubmit: () => {
      ac.submit()
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
  <section class="movement-page">
    <h1>Inventory Movement</h1>

    <BaseAlert v-if="!canManageStock" variant="warning">
      Role ปัจจุบันไม่มีสิทธิ์บันทึกรายการเคลื่อนไหวสต๊อก (Admin หรือ Warehouse เท่านั้น)
    </BaseAlert>

    <div v-else class="movement-actions">
      <BaseButton @click="ev.onOpenForm('IN')">+ Stock In</BaseButton>
      <BaseButton @click="ev.onOpenForm('OUT')">+ Stock Out</BaseButton>
      <BaseButton @click="ev.onOpenForm('ADJUSTMENT')">+ Adjustment</BaseButton>
    </div>

    <BaseDialog v-if="activeMode" v-model="isDialogOpen" :title="modeConfig[activeMode].title">
      <form class="stock-form" @submit.prevent="ev.onSubmit">
        <BaseCombobox
          v-model="selectedProductId"
          label="สินค้า"
          placeholder="เลือกสินค้า"
          :options="productOptions"
        />

        <p v-if="selectedProduct" class="stock-form__hint">
          สต๊อกปัจจุบัน: {{ selectedProduct.stockQuantity }} {{ selectedProduct.unit }}
        </p>

        <BaseCombobox v-if="activeMode === 'ADJUSTMENT'" v-model="direction" label="ทิศทางการปรับ" :options="directionOptions" />

        <BaseInputNumber v-model="quantity" :label="modeConfig[activeMode].quantityLabel" />
        <BaseInput v-model="note" label="หมายเหตุ (ถ้ามี)" />

        <div class="stock-form__actions">
          <BaseButton type="submit" :loading="isSaving">บันทึก</BaseButton>
        </div>

        <BaseAlert v-if="formError" variant="destructive">{{ formError }}</BaseAlert>
        <BaseAlert v-if="successMessage" variant="success">{{ successMessage }}</BaseAlert>
      </form>
    </BaseDialog>

    <BaseInput
      v-model="searchKeyword"
      type="search"
      placeholder="ค้นหาประวัติสต็อก (ชื่อ/SKU สินค้า หรือหมายเหตุ)"
      class="movement-search"
    />

    <BaseAsyncState
      :is-loading="inventoryStore.isLoading"
      :error="inventoryStore.error"
      :is-empty="filteredMovementList.length === 0"
      empty-text="ไม่มีประวัติการเคลื่อนไหวของสินค้า"
      @retry="ac.fetchData"
    >
      <template #empty>
        <template v-if="inventoryStore.movementList.length === 0">
          <template v-if="!canManageStock">
            <p class="empty-hint">ยังไม่มีประวัติการเคลื่อนไหวของสินค้า</p>
          </template>
          <template v-else-if="productStore.productList.length === 0">
            <p class="empty-hint">ยังไม่มีสินค้าในระบบ ต้องเพิ่มสินค้าก่อนจึงจะบันทึกรับสต็อกได้</p>
            <RouterLink class="empty-link" to="/products">ไปที่หน้าสินค้า</RouterLink>
          </template>
          <template v-else>
            <p class="empty-hint">ยังไม่มีประวัติการเคลื่อนไหวของสินค้า</p>
            <BaseButton @click="ev.onOpenForm('IN')">+ บันทึกรับสต็อกครั้งแรก</BaseButton>
          </template>
        </template>
        <p v-else class="empty-hint">ไม่พบประวัติที่ตรงกับ "{{ searchKeyword }}"</p>
      </template>

      <ul class="movement-list">
        <li v-for="movement in filteredMovementList" :key="movement.id" class="movement-row">
          <div class="movement-row__info">
            <span class="movement-row__product">{{ ac.productLabel(movement.productId) }}</span>
            <span class="movement-row__meta">
              <BaseBadge variant="neutral">{{ typeLabel[movement.type] }}</BaseBadge>
              {{ ac.formatDate(movement.createdAt) }}
              <template v-if="movement.note"> · {{ movement.note }}</template>
            </span>
          </div>

          <span
            class="movement-row__quantity"
            :class="{
              'movement-row__quantity--in': movement.type === 'IN',
              'movement-row__quantity--out': movement.type === 'OUT',
            }"
          >
            {{ ac.signedQuantity(movement) }}
          </span>
        </li>
      </ul>
    </BaseAsyncState>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.movement-page {
  @apply flex flex-col gap-5;
}

.movement-page :deep(.movement-search) {
  max-width: 360px;
}

.movement-actions {
  @apply flex flex-wrap items-center gap-2;
}

.stock-form {
  @apply flex flex-col gap-4;
}

.stock-form__hint {
  margin: -8px 0 0;
  color: var(--ink-soft);
  font-size: 0.8125rem;
}

.stock-form__actions {
  @apply flex items-center gap-2;
}

.movement-list {
  @apply flex flex-col gap-2;
  list-style: none;
  margin: 0;
  padding: 0;
}

.movement-row {
  @apply flex items-center justify-between gap-3;
  padding: 10px 12px;
  border: 1px solid var(--paper-border);
  border-radius: 10px;
  background: var(--paper);
}

.movement-row__info {
  @apply flex flex-col gap-1;
  min-width: 0;
}

.movement-row__product {
  font-weight: 700;
  color: var(--ink);
}

.movement-row__meta {
  @apply flex flex-wrap items-center gap-2;
  color: var(--ink-soft);
  font-size: 0.8125rem;
}

.movement-row__quantity {
  @apply flex-none;
  font-weight: 800;
  font-size: 0.9375rem;
  color: var(--ink);
}

.movement-row__quantity--in {
  color: var(--success);
}

.movement-row__quantity--out {
  color: var(--destructive);
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
