<script setup lang="ts">
// #import
import { computed, type Component } from 'vue'
import { ArrowRight, Boxes, ChartColumn, FileText, LayoutDashboard, PackageSearch, Receipt, Truck } from '@lucide/vue'
import { useRoleStore } from '@/stores/role'

interface iWorkflowStep {
  step: number
  title: string
  description: string
  to: string
  icon: Component
}

interface iQuickLink {
  label: string
  to: string
  icon: Component
}

// #store
const roleStore = useRoleStore()

// #ref / #reactive
const workflowSteps: iWorkflowStep[] = [
  {
    step: 1,
    title: 'เพิ่มสินค้า',
    description: 'สร้างรายการสินค้าที่ต้องการจัดการสต็อก พร้อมกำหนดราคาและหน่วยนับ',
    to: '/products',
    icon: PackageSearch,
  },
  {
    step: 2,
    title: 'รับสต็อกเข้าคลัง',
    description: 'บันทึกการรับสินค้าเข้าคลัง เพื่อให้มีสต็อกพร้อมขาย',
    to: '/inventory/movements',
    icon: Boxes,
  },
  {
    step: 3,
    title: 'สร้าง Sales Order',
    description: 'สร้างออเดอร์ขายให้ลูกค้า ยืนยันออเดอร์ และแนบหลักฐานการชำระเงินก่อน Fulfill',
    to: '/sales-orders',
    icon: Receipt,
  },
  {
    step: 4,
    title: 'Fulfill ออเดอร์',
    description: 'ตัดสต็อกและจัดส่งสินค้า ทำได้หลังจากแนบหลักฐานการชำระเงินแล้วเท่านั้น',
    to: '/sales-orders',
    icon: Truck,
  },
  {
    step: 5,
    title: 'ออก Invoice',
    description: 'ออกใบแจ้งหนี้ให้ลูกค้า หลังจาก Fulfill ออเดอร์เรียบร้อยแล้ว',
    to: '/invoices',
    icon: FileText,
  },
]

const quickLinks: iQuickLink[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Sales Report', to: '/reports/sales', icon: ChartColumn },
  { label: 'Inventory Report', to: '/reports/inventory', icon: ChartColumn },
]

// #computed
const roleLabel = computed(() => roleStore.currentRole)
</script>

<template>
  <section class="home-page">
    <div class="app-container">
      <div class="page-heading">
        <p class="eyebrow">ระบบจัดการสต็อกสินค้า</p>
        <h1>ยินดีต้อนรับ</h1>
        <p>
          ทำตามขั้นตอนด้านล่างตามลำดับ ตั้งแต่เพิ่มสินค้า รับสต็อก ไปจนถึงออก Invoice
          เพื่อให้เห็นภาพรวมการทำงานของระบบทั้งหมด
        </p>
        <div class="role-badge">
          <span class="role-badge__dot" aria-hidden="true" />
          กำลังใช้งานในบทบาท: <strong>{{ roleLabel }}</strong>
          <span class="role-badge__hint">(สลับบทบาทได้จากมุมขวาบนของหน้าอื่น ๆ)</span>
        </div>
      </div>

      <h2 class="section-title">ขั้นตอนการใช้งาน</h2>

      <ol class="workflow-list">
        <li
          v-for="(item, index) in workflowSteps"
          :key="item.step"
          class="workflow-item"
          :style="{ animationDelay: `${120 + index * 60}ms` }"
        >
          <RouterLink class="step-card" :to="item.to">
            <span class="step-card__marker">
              <component :is="item.icon" :size="20" :stroke-width="2.2" />
              <span class="step-card__number">{{ item.step }}</span>
            </span>
            <span class="step-card__body">
              <span class="step-card__title">{{ item.title }}</span>
              <span class="step-card__description">{{ item.description }}</span>
            </span>
            <ArrowRight class="step-card__arrow" :size="18" :stroke-width="2.2" aria-hidden="true" />
          </RouterLink>
        </li>
      </ol>

      <div class="quick-links">
        <RouterLink v-for="link in quickLinks" :key="link.to" class="quick-link" :to="link.to">
          <component :is="link.icon" :size="16" :stroke-width="2.2" aria-hidden="true" />
          {{ link.label }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-page {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  width: 100%;
}

.page-heading {
  max-width: 720px;
  opacity: 0;
  animation: fade-in-up 360ms var(--ease-out) forwards;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--brass-dark);
  font-size: 0.8125rem;
  font-weight: 800;
  text-transform: uppercase;
}

.page-heading h1 {
  margin: 0;
  color: var(--ink);
  font-size: 3rem;
  line-height: 1.08;
}

.page-heading p {
  margin: 18px 0 0;
  color: var(--ink-soft);
  font-size: 1.125rem;
}

.role-badge {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 8px 16px;
  border: 1px solid var(--paper-border);
  border-radius: 999px;
  background: linear-gradient(180deg, var(--paper-highlight), var(--paper-card));
  color: var(--ink-soft);
  font-size: 0.875rem;
  width: fit-content;
}

.role-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: radial-gradient(circle at 32% 28%, var(--brass-light), var(--brass-dark) 100%);
  box-shadow: 0 0 0 3px rgba(178, 138, 66, 0.18);
}

.role-badge strong {
  color: var(--ink);
}

.role-badge__hint {
  color: var(--ink-soft);
  opacity: 0.7;
  font-size: 0.8125rem;
}

.section-title {
  margin: 40px 0 16px;
  color: var(--ink);
  font-size: 1.25rem;
  opacity: 0;
  animation: fade-in-up 360ms var(--ease-out) forwards;
  animation-delay: 80ms;
}

.workflow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.workflow-item {
  opacity: 0;
  animation: fade-in-up 360ms var(--ease-out) forwards;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  border: 1px solid var(--paper-border);
  border-radius: 14px;
  background: linear-gradient(180deg, var(--paper-highlight), var(--paper-card));
  box-shadow:
    inset 0 1px 0 var(--edge-highlight),
    0 10px 20px -12px var(--shadow-color),
    0 2px 4px rgba(43, 29, 14, 0.08);
  transition: transform 150ms var(--ease-out), box-shadow 150ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .step-card:hover {
    box-shadow:
      inset 0 1px 0 var(--edge-highlight),
      0 14px 26px -12px var(--shadow-color),
      0 2px 4px rgba(43, 29, 14, 0.1);
  }

  .step-card:hover .step-card__arrow {
    transform: translateX(4px);
    color: var(--brass-dark);
  }
}

.step-card:active {
  transform: scale(0.98);
}

.step-card__marker {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: radial-gradient(circle at 32% 28%, var(--brass-light), var(--brass) 55%, var(--brass-dark) 100%);
  color: var(--leather-dark);
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.55),
    inset 0 -2px 3px rgba(0, 0, 0, 0.2);
}

.step-card__number {
  position: absolute;
  bottom: -6px;
  right: -6px;
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  font-size: 0.6875rem;
  font-weight: 800;
  border: 2px solid var(--paper);
}

.step-card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.step-card__title {
  color: var(--ink);
  font-size: 1rem;
  font-weight: 700;
}

.step-card__description {
  color: var(--ink-soft);
  font-size: 0.875rem;
}

.step-card__arrow {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--ink-soft);
  transition: transform 160ms var(--ease-out), color 160ms var(--ease-out);
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
  opacity: 0;
  animation: fade-in-up 360ms var(--ease-out) forwards;
  animation-delay: 420ms;
}

.quick-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border: 1px solid var(--paper-border);
  border-radius: 999px;
  color: var(--ink-soft);
  font-size: 0.8125rem;
  font-weight: 700;
  transition: transform 150ms var(--ease-out), color 140ms ease, border-color 140ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .quick-link:hover {
    color: var(--brass-dark);
    border-color: var(--brass-dark);
  }
}

.quick-link:active {
  transform: scale(0.97);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-heading,
  .section-title,
  .workflow-item,
  .quick-links {
    animation-duration: 1ms;
    animation-delay: 0ms !important;
  }

  .step-card,
  .step-card__arrow,
  .quick-link {
    transition: none;
  }

  .step-card:active,
  .quick-link:active {
    transform: none;
  }
}

@media (max-width: 760px) {
  .page-heading h1 {
    font-size: 2.25rem;
  }

  .page-heading p {
    font-size: 1rem;
  }

  .step-card {
    align-items: flex-start;
  }

  .step-card__arrow {
    display: none;
  }
}
</style>
