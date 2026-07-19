<script setup lang="ts">
// #import
import { computed, onMounted, reactive, ref } from 'vue'
import { ImagePlus, Trash2, Upload } from '@lucide/vue'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import { usePermission } from '@/composables/usePermission'
import { uploadService } from '@/services/upload.service'
import BaseAsyncState from '@/components/common/BaseAsyncState.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCombobox from '@/components/common/BaseCombobox.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseInputNumber from '@/components/common/BaseInputNumber.vue'
import type { iProduct, iProductInput } from '@/types/product.types'

interface iProductFormState {
  name: string
  brand: string
  categoryId: number | null
  unit: string
  price: number | null
  stockQuantity: number | null
  imageUrl: string
}

interface iProductFormErrors {
  name?: string
  brand?: string
  categoryId?: string
  unit?: string
  price?: string
  stockQuantity?: string
}

// #store
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const toastStore = useToastStore()
const confirmStore = useConfirmStore()
const { hasRole } = usePermission()
const isAdmin = hasRole('Admin')

// #ref / #reactive
const newCategoryName = ref('')
const newCategoryCode = ref('')
const categoryError = ref<string | null>(null)
const isSavingCategory = ref(false)

const isProductFormOpen = ref(false)
const editingProductId = ref<number | null>(null)
const productFormError = ref<string | null>(null)
const productFieldErrors = ref<iProductFormErrors>({})
const isSavingProduct = ref(false)

const selectedImageFile = ref<File | null>(null)
const imagePreviewUrl = ref('')
const isUploadingImage = ref(false)

const searchKeyword = ref('')

const emptyProductForm = (): iProductFormState => ({
  name: '',
  brand: '',
  categoryId: null,
  unit: '',
  price: null,
  stockQuantity: null,
  imageUrl: '',
})

const productForm = reactive<iProductFormState>(emptyProductForm())

const unitOptions = [
  { label: 'ชิ้น', value: 'ชิ้น' },
  { label: 'เครื่อง', value: 'เครื่อง' },
  { label: 'กล่อง', value: 'กล่อง' },
  { label: 'แพ็ค', value: 'แพ็ค' },
  { label: 'ชุด', value: 'ชุด' },
  { label: 'คู่', value: 'คู่' },
  { label: 'ม้วน', value: 'ม้วน' },
  { label: 'ถุง', value: 'ถุง' },
  { label: 'ขวด', value: 'ขวด' },
  { label: 'แผ่น', value: 'แผ่น' },
]

// #computed
const categoryOptions = computed(() =>
  categoryStore.categoryList.map((c) => ({ label: `${c.code} · ${c.name}`, value: c.id }))
)

/**
 * แปลง productForm.unit (string เปล่าตอนยังไม่เลือก) เป็น null ให้ BaseCombobox แสดงสถานะ "ยังไม่ได้เลือก" ถูกต้อง
 * โดยไม่ต้องเปลี่ยน type ของ productForm.unit ที่ใช้ใน validation/submit อยู่แล้ว
 */
const unitComboboxValue = computed<string | null>({
  get: () => productForm.unit || null,
  set: (value) => {
    productForm.unit = value ?? ''
  },
})

/**
 * กรองรายการสินค้าด้วยคำค้นหา (ชื่อ, ยี่ห้อ, SKU) แบบ client-side เพราะข้อมูลถูกโหลดมาทั้งหมดอยู่แล้ว
 */
const filteredProductList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return productStore.productList

  return productStore.productList.filter(
    (p) =>
      p.name.toLowerCase().includes(keyword) ||
      p.brand.toLowerCase().includes(keyword) ||
      p.sku.toLowerCase().includes(keyword)
  )
})

// #action
const action = () => {
  const ac = {
    init: async () => {
      await Promise.all([ac.fetchData(), categoryStore.fetchCategories()])
    },

    /**
     * โหลดรายการสินค้าทั้งหมด
     */
    fetchData: async () => {
      await productStore.fetchProducts()
    },

    /**
     * หาชื่อหมวดหมู่จาก categoryId เพื่อแสดงในรายการสินค้า
     */
    categoryName: (categoryId: number): string => {
      return categoryStore.categoryList.find((c) => c.id === categoryId)?.name ?? '-'
    },
  }

  return ac
}

const ac = action()

// #event
const event = () => {
  const ev = {
    onSubmitCategory: async () => {
      const name = newCategoryName.value.trim()
      const code = newCategoryCode.value.trim().toUpperCase()
      if (!name || !code) return

      categoryError.value = null
      isSavingCategory.value = true

      try {
        await categoryStore.createCategory(name, code)
        newCategoryName.value = ''
        newCategoryCode.value = ''
        toastStore.push('เพิ่มหมวดหมู่สำเร็จ')
      } catch (e) {
        categoryError.value = e instanceof Error ? e.message : 'บันทึกหมวดหมู่ไม่สำเร็จ'
      } finally {
        isSavingCategory.value = false
      }
    },

    onDeleteCategory: async (id: number) => {
      const category = categoryStore.categoryList.find((c) => c.id === id)
      const productCount = productStore.productList.filter((p) => p.categoryId === id).length
      const confirmed = await confirmStore.ask({
        title: 'ลบหมวดหมู่สินค้า',
        message:
          productCount > 0
            ? `ลบหมวดหมู่ "${category?.name}"? มีสินค้า ${productCount} รายการอยู่ในหมวดหมู่นี้`
            : `ยืนยันลบหมวดหมู่ "${category?.name}"?`,
        confirmText: 'ลบหมวดหมู่',
        danger: true,
      })
      if (!confirmed) return

      categoryError.value = null

      try {
        await categoryStore.deleteCategory(id)
        toastStore.push('ลบหมวดหมู่สำเร็จ')
      } catch (e) {
        categoryError.value = e instanceof Error ? e.message : 'ลบหมวดหมู่ไม่สำเร็จ'
      }
    },

    /**
     * ล้าง preview รูปเดิม (revoke blob url ถ้ามี) ก่อนตั้งค่าใหม่ กัน memory leak
     */
    resetImagePreview: (url: string) => {
      if (imagePreviewUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl.value)
      }
      selectedImageFile.value = null
      imagePreviewUrl.value = url
    },

    onOpenCreateForm: () => {
      editingProductId.value = null
      Object.assign(productForm, emptyProductForm())
      ev.resetImagePreview('')
      productFormError.value = null
      productFieldErrors.value = {}
      isProductFormOpen.value = true
    },

    onEditProduct: (product: iProduct) => {
      editingProductId.value = product.id
      Object.assign(productForm, {
        name: product.name,
        brand: product.brand,
        categoryId: product.categoryId,
        unit: product.unit,
        price: product.price,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl ?? '',
      })
      ev.resetImagePreview(product.imageUrl ?? '')
      productFormError.value = null
      productFieldErrors.value = {}
      isProductFormOpen.value = true
    },

    onCancelForm: () => {
      isProductFormOpen.value = false
      editingProductId.value = null
      productFormError.value = null
      productFieldErrors.value = {}
      ev.resetImagePreview('')
    },

    /**
     * เลือกไฟล์รูปสินค้า สร้าง preview ทันทีจากไฟล์ในเครื่อง ยังไม่อัปโหลดจนกว่าจะกดบันทึก
     */
    onSelectImage: (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      if (imagePreviewUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl.value)
      }
      selectedImageFile.value = file
      imagePreviewUrl.value = URL.createObjectURL(file)
    },

    onRemoveImage: () => {
      ev.resetImagePreview('')
      productForm.imageUrl = ''
    },

    onSubmitProduct: async () => {
      const errors: iProductFormErrors = {}
      if (!productForm.name.trim()) errors.name = 'กรุณากรอกชื่อสินค้า'
      if (!productForm.brand.trim()) errors.brand = 'กรุณากรอกยี่ห้อ'
      if (productForm.categoryId === null) errors.categoryId = 'กรุณาเลือกหมวดหมู่'
      if (!productForm.unit.trim()) errors.unit = 'กรุณาเลือกหน่วยนับ'
      if (productForm.price === null || productForm.price <= 0) errors.price = 'กรุณาระบุราคาที่มากกว่า 0'
      if (productForm.stockQuantity === null || productForm.stockQuantity < 0) errors.stockQuantity = 'กรุณาระบุจำนวนสต๊อก'

      productFieldErrors.value = errors
      if (Object.keys(errors).length > 0) return
      if (productForm.categoryId === null || productForm.price === null || productForm.stockQuantity === null) return

      productFormError.value = null

      if (selectedImageFile.value) {
        isUploadingImage.value = true
        try {
          const uploaded = await uploadService.uploadImage(selectedImageFile.value)
          productForm.imageUrl = uploaded.url
        } catch (e) {
          productFormError.value = e instanceof Error ? e.message : 'อัปโหลดรูปไม่สำเร็จ'
          isUploadingImage.value = false
          return
        }
        isUploadingImage.value = false
      }

      const input: iProductInput = {
        name: productForm.name.trim(),
        brand: productForm.brand.trim(),
        categoryId: productForm.categoryId,
        unit: productForm.unit.trim(),
        price: productForm.price,
        stockQuantity: productForm.stockQuantity,
        imageUrl: productForm.imageUrl.trim() || undefined,
      }

      isSavingProduct.value = true

      try {
        if (editingProductId.value !== null) {
          await productStore.updateProduct(editingProductId.value, input)
          toastStore.push('บันทึกสินค้าสำเร็จ')
        } else {
          await productStore.createProduct(input)
          toastStore.push('เพิ่มสินค้าสำเร็จ')
        }
        isProductFormOpen.value = false
      } catch (e) {
        productFormError.value = e instanceof Error ? e.message : 'บันทึกสินค้าไม่สำเร็จ'
      } finally {
        isSavingProduct.value = false
      }
    },

    onDeleteProduct: async (id: number) => {
      const product = productStore.productList.find((p) => p.id === id)
      const confirmed = await confirmStore.ask({
        title: 'ลบสินค้า',
        message: `ยืนยันลบสินค้า [${product?.sku}] ${product?.name}? การดำเนินการนี้ย้อนกลับไม่ได้`,
        confirmText: 'ลบสินค้า',
        danger: true,
      })
      if (!confirmed) return

      productFormError.value = null

      try {
        await productStore.deleteProduct(id)
        toastStore.push('ลบสินค้าสำเร็จ')
      } catch (e) {
        productFormError.value = e instanceof Error ? e.message : 'ลบสินค้าไม่สำเร็จ'
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
  <section class="product-page">
    <h1>สินค้า</h1>

    <div v-if="isAdmin" class="category-manager">
      <h2 class="section-title">หมวดหมู่สินค้า</h2>

      <div class="category-list">
        <BaseBadge v-for="category in categoryStore.categoryList" :key="category.id">
          {{ category.code }} · {{ category.name }}
          <button
            class="category-chip__remove"
            type="button"
            :aria-label="`ลบหมวดหมู่ ${category.name}`"
            @click="ev.onDeleteCategory(category.id)"
          >
            <Trash2 :size="12" :stroke-width="2.4" />
          </button>
        </BaseBadge>
      </div>

      <form class="category-form" @submit.prevent="ev.onSubmitCategory">
        <BaseInput v-model="newCategoryName" placeholder="ชื่อหมวดหมู่ใหม่" />
        <BaseInput v-model="newCategoryCode" class="category-form__code" placeholder="Prefix เช่น LAP" />
        <BaseButton type="submit" :loading="isSavingCategory">เพิ่มหมวดหมู่</BaseButton>
      </form>
      <p class="category-form__hint">Prefix ใช้สร้างเลข SKU ของสินค้าในหมวดหมู่นี้อัตโนมัติ (เช่น LAP-001, LAP-002)</p>

      <BaseAlert v-if="categoryError" variant="destructive">{{ categoryError }}</BaseAlert>
    </div>

    <div class="product-toolbar">
      <BaseInput
        v-model="searchKeyword"
        type="search"
        placeholder="ค้นหาสินค้า (ชื่อ, ยี่ห้อ, SKU)"
        class="product-search"
      />
      <BaseButton v-if="isAdmin" @click="ev.onOpenCreateForm">+ เพิ่มสินค้า</BaseButton>
    </div>

    <BaseDialog
      v-if="isAdmin"
      v-model="isProductFormOpen"
      :title="editingProductId !== null ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'"
      max-width="640px"
    >
      <form class="product-form" @submit.prevent="ev.onSubmitProduct">
        <p v-if="editingProductId !== null" class="product-form__sku-hint">
          SKU: {{ productStore.productList.find((p) => p.id === editingProductId)?.sku }}
        </p>
        <p v-else class="product-form__sku-hint">SKU จะถูกสร้างให้อัตโนมัติตาม prefix ของหมวดหมู่ที่เลือก</p>

        <div class="image-upload">
          <a
            v-if="imagePreviewUrl"
            :key="imagePreviewUrl"
            :href="imagePreviewUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="image-upload__preview"
            title="ดูรูปขนาดเต็ม"
          >
            <img :src="imagePreviewUrl" class="image-upload__preview-img" alt="ตัวอย่างรูปสินค้า" />
          </a>
          <div v-else class="image-upload__preview image-upload__preview--empty">
            <ImagePlus :size="32" :stroke-width="1.6" aria-hidden="true" />
            <span class="image-upload__placeholder-text">ยังไม่มีรูปภาพ</span>
          </div>

          <div class="image-upload__controls">
            <label class="image-upload__button">
              <input
                type="file"
                class="image-upload__input"
                accept="image/png,image/jpeg,image/webp,image/gif"
                @change="ev.onSelectImage"
              />
              <Upload :size="14" :stroke-width="2.2" aria-hidden="true" />
              {{ imagePreviewUrl ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ' }}
            </label>
            <button v-if="imagePreviewUrl" type="button" class="image-upload__remove" @click="ev.onRemoveImage">
              ลบรูป
            </button>
            <span class="image-upload__hint">
              PNG, JPG, WEBP, GIF{{ imagePreviewUrl ? ' · คลิกที่รูปเพื่อดูขนาดเต็ม' : '' }}
            </span>
          </div>
        </div>

        <BaseInput v-model="productForm.name" label="ชื่อสินค้า" :error="productFieldErrors.name" />
        <BaseInput v-model="productForm.brand" label="ยี่ห้อ" :error="productFieldErrors.brand" />

        <BaseCombobox
          v-model="productForm.categoryId"
          label="หมวดหมู่"
          placeholder="เลือกหมวดหมู่"
          :options="categoryOptions"
          :error="productFieldErrors.categoryId"
        />

        <BaseCombobox
          v-model="unitComboboxValue"
          label="หน่วยนับ"
          placeholder="เลือกหน่วยนับ"
          :options="unitOptions"
          :error="productFieldErrors.unit"
        />
        <BaseInputNumber v-model="productForm.price" label="ราคา (บาท)" :error="productFieldErrors.price" />
        <BaseInputNumber
          v-model="productForm.stockQuantity"
          label="จำนวนสต๊อก"
          :error="productFieldErrors.stockQuantity"
        />

        <div class="product-form__actions">
          <BaseButton type="submit" :loading="isSavingProduct || isUploadingImage">
            {{ editingProductId !== null ? 'บันทึก' : 'เพิ่มสินค้า' }}
          </BaseButton>
          <BaseButton variant="secondary" type="button" @click="ev.onCancelForm">ยกเลิก</BaseButton>
        </div>

        <BaseAlert v-if="productFormError" variant="destructive">{{ productFormError }}</BaseAlert>
      </form>
    </BaseDialog>

    <BaseAsyncState
      :is-loading="productStore.isLoading"
      :error="productStore.error"
      :is-empty="filteredProductList.length === 0"
      empty-text="ไม่มีข้อมูลสินค้า"
      @retry="ac.fetchData"
    >
      <template #empty>
        <template v-if="productStore.productList.length === 0">
          <p class="empty-hint">ยังไม่มีสินค้าในระบบ</p>
          <BaseButton v-if="isAdmin" @click="ev.onOpenCreateForm">+ เพิ่มสินค้าแรกของคุณ</BaseButton>
          <p v-else class="empty-hint">ติดต่อ Admin เพื่อเพิ่มสินค้า</p>
        </template>
        <p v-else class="empty-hint">ไม่พบสินค้าที่ตรงกับ "{{ searchKeyword }}"</p>
      </template>

      <ul class="product-list">
        <li v-for="product in filteredProductList" :key="product.id" class="product-card">
          <img v-if="product.imageUrl" :src="product.imageUrl" class="product-card__thumb" alt="" />
          <div v-else class="product-card__thumb product-card__thumb--empty" aria-hidden="true">
            <ImagePlus :size="28" :stroke-width="1.6" />
          </div>

          <div class="product-card__body">
            <span class="product-card__sku">{{ product.sku }}</span>
            <span class="product-card__name">{{ product.brand }} {{ product.name }}</span>
            <span class="product-card__meta">
              <BaseBadge variant="neutral">{{ ac.categoryName(product.categoryId) }}</BaseBadge>
            </span>
            <span class="product-card__stats">{{ product.stockQuantity }} {{ product.unit }} · {{ product.price.toLocaleString() }} บาท</span>
          </div>

          <div v-if="isAdmin" class="product-card__actions">
            <BaseButton variant="secondary" @click="ev.onEditProduct(product)">แก้ไข</BaseButton>
            <BaseButton variant="ghost" @click="ev.onDeleteProduct(product.id)">ลบ</BaseButton>
          </div>
        </li>
      </ul>
    </BaseAsyncState>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.product-page {
  @apply flex flex-col gap-5;
}

.product-toolbar {
  @apply flex flex-wrap items-center justify-between gap-3;
}

.product-toolbar :deep(.product-search) {
  flex: 1;
  min-width: 220px;
  max-width: 360px;
}

.section-title {
  margin: 0 0 10px;
  font-size: 0.9375rem;
  font-weight: 800;
  color: var(--ink);
}

.category-manager {
  @apply flex flex-col gap-3;
  padding-bottom: 18px;
  border-bottom: 1px dashed var(--paper-border);
}

.category-list {
  @apply flex flex-wrap items-center gap-2;
}

.category-chip__remove {
  @apply inline-flex items-center justify-center;
  margin-left: 2px;
  color: inherit;
  opacity: 0.7;
}

.category-chip__remove:hover {
  opacity: 1;
}

.category-form {
  @apply flex items-end gap-2;
  max-width: 460px;
}

.category-form :deep(.field) {
  flex: 1;
}

.category-form :deep(.category-form__code) {
  flex: 0 0 120px;
}

.product-form {
  @apply grid gap-4;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.product-form__sku-hint {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.8125rem;
}

.category-form__hint {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.8125rem;
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
  grid-column: 1 / -1;
  padding: 14px;
  border: 1px dashed var(--paper-border);
  border-radius: 14px;
  background: var(--paper-highlight);
}

.image-upload__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 220px;
  border-radius: 12px;
  border: 1px solid var(--paper-border);
  background:
    repeating-conic-gradient(var(--paper-card) 0% 25%, var(--paper) 0% 50%) 50% / 18px 18px;
  color: var(--ink-soft);
  overflow: hidden;
  box-shadow: inset 0 1px 0 var(--edge-highlight);
  cursor: zoom-in;
}

.image-upload__preview--empty {
  flex-direction: column;
  gap: 8px;
  cursor: default;
  background: linear-gradient(180deg, var(--paper-highlight), var(--paper-card));
}

.image-upload__placeholder-text {
  font-size: 0.8125rem;
  font-weight: 600;
}

.image-upload__preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: image-upload-fade-in 220ms ease-out both;
  transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
}

.image-upload__preview:hover .image-upload__preview-img {
  transform: scale(1.03);
}

@keyframes image-upload-fade-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.image-upload__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.image-upload__button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border: 1px solid var(--paper-border);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--paper-highlight), var(--paper-card));
  color: var(--ink);
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow:
    0 1px 2px rgba(43, 29, 14, 0.12),
    inset 0 1px 0 var(--edge-highlight);
  transition: transform 150ms cubic-bezier(0.23, 1, 0.32, 1), border-color 140ms ease;
}

.image-upload__button:hover {
  border-color: var(--brass);
}

.image-upload__button:active {
  transform: scale(0.97);
}

.image-upload__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.image-upload__remove {
  color: var(--ink-soft);
  font-size: 0.8125rem;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 140ms ease;
}

.image-upload__remove:hover {
  color: var(--destructive);
}

.image-upload__hint {
  color: var(--ink-soft);
  font-size: 0.75rem;
  opacity: 0.8;
}

.product-form__actions {
  @apply flex items-center gap-2;
  grid-column: 1 / -1;
}

.product-list {
  @apply grid gap-3;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
}

.product-card {
  @apply flex flex-col gap-3;
  padding: 14px;
  border: 1px solid var(--paper-border);
  border-radius: 12px;
  background: var(--paper);
}

.product-card__thumb {
  @apply w-full flex-none rounded-lg object-cover;
  height: 140px;
  border: 1px solid var(--paper-border);
}

.product-card__thumb--empty {
  @apply flex items-center justify-center;
  color: var(--ink-soft);
  background: var(--paper-highlight);
}

.product-card__body {
  @apply flex flex-1 flex-col gap-1;
  min-width: 0;
}

.product-card__sku {
  color: var(--ink-soft);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.product-card__name {
  font-weight: 700;
  color: var(--ink);
}

.product-card__meta {
  @apply flex flex-wrap items-center gap-2;
}

.product-card__stats {
  color: var(--ink-soft);
  font-size: 0.8125rem;
}

.product-card__actions {
  @apply flex flex-none items-center gap-2;
  padding-top: 4px;
  border-top: 1px dashed var(--paper-border);
}

.empty-hint {
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .image-upload__preview-img {
    animation: none;
  }

  .image-upload__button:active {
    transform: none;
  }
}

@media (max-width: 640px) {
  .product-form {
    grid-template-columns: 1fr;
  }
}
</style>
