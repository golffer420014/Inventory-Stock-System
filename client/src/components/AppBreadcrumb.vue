<script setup lang="ts">
// #import
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDown, ChevronRight, House } from '@lucide/vue'
import { useRoleStore } from '@/stores/role'
import type { tRole } from '@/types/role.types'

// #store
const roleStore = useRoleStore()

// #computed
const route = useRoute()

const crumbs = computed(() => {
  const group = typeof route.meta.group === 'string' ? route.meta.group : ''
  const title = typeof route.meta.title === 'string' ? route.meta.title : ''

  return [group, title].filter(Boolean)
})

// #event
const event = () => {
  const ev = {
    /**
     * สลับ demo role เพื่อทดลองสิทธิ์การเข้าถึงของแต่ละตำแหน่ง
     */
    onRoleChange: (e: Event) => {
      const role = (e.target as HTMLSelectElement).value as tRole
      roleStore.setRole(role)
    },
  }

  return ev
}

const ev = event()

const roleOptions: tRole[] = ['Admin', 'Sales', 'Warehouse', 'Viewer']
</script>

<template>
  <div class="breadcrumb-row">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <RouterLink class="breadcrumb__home" to="/">
        <House :size="14" :stroke-width="2.2" />
      </RouterLink>

      <template v-for="(crumb, index) in crumbs" :key="crumb">
        <ChevronRight class="breadcrumb__sep" :size="14" :stroke-width="2" aria-hidden="true" />
        <span class="breadcrumb__item" :class="{ 'is-current': index === crumbs.length - 1 }">
          {{ crumb }}
        </span>
      </template>
    </nav>

    <div class="role-select-wrap">
      <select
        class="role-select"
        :value="roleStore.currentRole"
        aria-label="สลับ demo role"
        @change="ev.onRoleChange"
      >
        <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
      </select>
      <ChevronDown class="role-select__icon" :size="12" :stroke-width="2.4" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.breadcrumb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-soft);
  font-size: 0.8125rem;
  font-weight: 600;
}

.breadcrumb__home {
  display: inline-flex;
  align-items: center;
  color: var(--ink-soft);
  transition: color 140ms ease;
}

.breadcrumb__home:hover {
  color: var(--brass-dark);
}

.breadcrumb__sep {
  flex: 0 0 auto;
  color: var(--paper-border);
}

.breadcrumb__item.is-current {
  color: var(--ink);
  font-weight: 700;
}

.role-select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
}

.role-select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  border: 1px solid var(--paper-border);
  border-radius: 999px;
  background: linear-gradient(180deg, #f6efe0, #e9dcc0);
  color: var(--leather-dark);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 4px 26px 4px 12px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 1px 2px rgba(43, 29, 14, 0.15);
  transition: border-color 140ms ease;
}

.role-select:hover {
  border-color: var(--brass-dark);
}

.role-select:focus-visible {
  outline: 2px solid var(--brass-dark);
  outline-offset: 2px;
}

.role-select__icon {
  position: absolute;
  right: 10px;
  color: var(--leather-dark);
  pointer-events: none;
}
</style>
