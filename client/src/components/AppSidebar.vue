<script setup lang="ts">
// #import
import { onMounted, ref, type Component } from 'vue'
import { useRoute } from 'vue-router'
import {
  Blocks,
  Boxes,
  ChartColumn,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  LayoutDashboard,
  PackageSearch,
  Receipt,
} from '@lucide/vue'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/ThemeToggle.vue'

interface iNavChildLink {
  label: string
  to: string
  icon: Component
}

interface iNavLinkItem {
  type: 'link'
  label: string
  to: string
  icon: Component
}

interface iNavGroupItem {
  type: 'group'
  label: string
  icon: Component
  children: iNavChildLink[]
}

type tNavItem = iNavLinkItem | iNavGroupItem

// #store
const themeStore = useThemeStore()

// #ref / #reactive
const appName = import.meta.env.VITE_APP_NAME || 'Inventory & Stock'
const isCollapsed = ref(false)
const expandedGroups = ref<Record<string, boolean>>({})

const route = useRoute()

const navItems: tNavItem[] = [
  { type: 'link', label: 'Home', to: '/', icon: Blocks },
  { type: 'link', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { type: 'link', label: 'สินค้า', to: '/products', icon: PackageSearch },
  { type: 'link', label: 'Inventory Movement', to: '/inventory/movements', icon: Boxes },
  { type: 'link', label: 'Sales Order', to: '/sales-orders', icon: Receipt },
  { type: 'link', label: 'Invoice', to: '/invoices', icon: FileText },
  {
    type: 'group',
    label: 'Report',
    icon: ChartColumn,
    children: [
      { label: 'Sales Report', to: '/reports/sales', icon: ChartColumn },
      { label: 'Inventory Report', to: '/reports/inventory', icon: ChartColumn },
    ],
  },
]

// #action
const action = () => {
  const ac = {
    /**
     * เปิดเมนูกลุ่มที่มีหน้าปัจจุบันอยู่ข้างในอัตโนมัติ เพื่อให้ผู้ใช้เห็นว่าตอนนี้อยู่หน้าไหนของเมนูไหน
     */
    expandActiveGroup: () => {
      for (const item of navItems) {
        if (item.type === 'group' && item.children.some((child) => child.to === route.path)) {
          expandedGroups.value[item.label] = true
        }
      }
    },

    isGroupActive: (item: iNavGroupItem): boolean => {
      return item.children.some((child) => child.to === route.path)
    },
  }

  return ac
}

const ac = action()

// #event
const event = () => {
  const ev = {
    onToggleSidebar: () => {
      isCollapsed.value = !isCollapsed.value
    },

    onToggleTheme: () => {
      themeStore.toggleTheme()
    },

    /**
     * เปิด/ปิดเมนูกลุ่มย่อย ถ้า sidebar กำลังพับอยู่ให้ขยาย sidebar ออกมาก่อนเสมอ
     * เพราะตอนพับ submenu ถูกซ่อนไว้ด้วย CSS กดปุ่มไปแล้วจะไม่เห็นอะไรเลยถ้าไม่ขยายให้ก่อน
     */
    onToggleGroup: (label: string) => {
      if (isCollapsed.value) {
        isCollapsed.value = false
        expandedGroups.value[label] = true
        return
      }
      expandedGroups.value[label] = !expandedGroups.value[label]
    },
  }

  return ev
}

const ev = event()

// #onMounted
onMounted(() => {
  isCollapsed.value = window.matchMedia('(max-width: 959px)').matches
  ac.expandActiveGroup()
})
</script>

<template>
  <aside class="app-sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <div class="sidebar-brand">
      <span class="brand__mark" aria-hidden="true">
        <img src="/mascot.png" alt="" class="brand__mark-img" />
      </span>
      <span class="brand__text">{{ appName }}</span>
    </div>

    <nav class="sidebar-nav" aria-label="Main navigation">
      <template v-for="item in navItems" :key="item.label">
        <RouterLink
          v-if="item.type === 'link'"
          class="sidebar-link"
          exact-active-class="is-active"
          :to="item.to"
          :title="item.label"
        >
          <span class="sidebar-link__icon" aria-hidden="true">
            <component :is="item.icon" :size="18" :stroke-width="2.1" />
          </span>
          <span class="sidebar-link__label">{{ item.label }}</span>
        </RouterLink>

        <div v-else class="sidebar-group">
          <button
            type="button"
            class="sidebar-link sidebar-link--group"
            :class="{ 'is-active': ac.isGroupActive(item) }"
            :title="item.label"
            :aria-expanded="!!expandedGroups[item.label]"
            @click="ev.onToggleGroup(item.label)"
          >
            <span class="sidebar-link__icon" aria-hidden="true">
              <component :is="item.icon" :size="18" :stroke-width="2.1" />
            </span>
            <span class="sidebar-link__label">{{ item.label }}</span>
            <ChevronDown
              class="sidebar-group__chevron"
              :class="{ 'is-open': expandedGroups[item.label] }"
              :size="14"
              :stroke-width="2.4"
              aria-hidden="true"
            />
          </button>

          <div class="sidebar-subnav" v-show="expandedGroups[item.label]">
            <RouterLink
              v-for="child in item.children"
              :key="child.to"
              class="sidebar-link sidebar-link--child"
              exact-active-class="is-active"
              :to="child.to"
              :title="child.label"
            >
              <span class="sidebar-link__icon" aria-hidden="true">
                <component :is="child.icon" :size="16" :stroke-width="2.1" />
              </span>
              <span class="sidebar-link__label">{{ child.label }}</span>
            </RouterLink>
          </div>
        </div>
      </template>
    </nav>

    <div class="sidebar-footer">
      <ThemeToggle
        v-if="!isCollapsed"
        :model-value="themeStore.isDark"
        @update:model-value="ev.onToggleTheme"
      />

      <button
        class="sidebar-toggle"
        type="button"
        aria-label="Toggle sidebar"
        :aria-expanded="!isCollapsed"
        @click="ev.onToggleSidebar"
      >
        <ChevronsLeft v-if="!isCollapsed" :size="16" :stroke-width="2.5" />
        <ChevronsRight v-else :size="16" :stroke-width="2.5" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
@reference "tailwindcss";

.app-sidebar {
  --sidebar-w: 264px;
  --sidebar-w-collapsed: 76px;

  @apply sticky top-0 z-20 flex h-screen flex-col overflow-x-hidden;
  flex: 0 0 var(--sidebar-w);
  width: var(--sidebar-w);
  padding: 20px 14px;
  background:
    repeating-linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.025) 0px,
      rgba(255, 255, 255, 0.025) 1px,
      transparent 1px,
      transparent 3px
    ),
    linear-gradient(155deg, var(--leather-light) 0%, var(--leather) 55%, var(--leather-dark) 100%);
  box-shadow:
    inset -1px 0 0 var(--stitch),
    6px 0 22px var(--shadow-color);
  transition: width 220ms ease, flex-basis 220ms ease;
}

.app-sidebar.is-collapsed {
  flex-basis: var(--sidebar-w-collapsed);
  width: var(--sidebar-w-collapsed);
  padding-inline: 10px;
}

.sidebar-brand {
  @apply flex items-center gap-2.5 border-b border-dashed pb-4;
  border-color: var(--stitch);
  margin-bottom: 10px;
}

.brand__mark {
  @apply inline-flex h-9 w-9 flex-none items-center justify-center overflow-hidden;
}

.brand__mark-img {
  @apply h-full w-full object-cover;
}

.brand__text {
  @apply overflow-hidden font-extrabold tracking-tight whitespace-nowrap;
  color: var(--brass-light);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
  transition: opacity 160ms ease, width 220ms ease;
}

.app-sidebar.is-collapsed .brand__text {
  width: 0;
  opacity: 0;
}

.sidebar-nav {
  @apply mt-1.5 flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto;
}

.sidebar-link {
  @apply relative flex items-center gap-3 rounded-[10px] text-sm font-semibold whitespace-nowrap;
  padding: 11px 12px;
  color: rgba(240, 225, 195, 0.72);
  transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease, gap 160ms ease;
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--brass-light);
}

.sidebar-link.is-active {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.2));
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.55),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  color: var(--brass-light);
}

.sidebar-link.is-active::before {
  @apply absolute rounded-r-[3px] content-[''];
  top: 8px;
  bottom: 8px;
  left: -14px;
  width: 3px;
  background: linear-gradient(180deg, var(--brass-light), var(--brass-dark));
}

.sidebar-link__icon {
  @apply inline-flex flex-none items-center justify-center;
}

.sidebar-link__label {
  @apply overflow-hidden text-ellipsis;
}

.sidebar-link--group {
  @apply w-full cursor-pointer border-none bg-transparent text-left font-semibold;
  font: inherit;
}

.sidebar-group__chevron {
  @apply ml-auto flex-none;
  transition: transform 160ms ease;
}

.sidebar-group__chevron.is-open {
  transform: rotate(180deg);
}

.sidebar-subnav {
  @apply mt-1 mb-1 flex flex-col gap-1;
  padding-left: 14px;
  border-left: 1px dashed var(--stitch);
  margin-left: 22px;
}

.sidebar-link--child {
  @apply text-[0.8125rem] font-medium;
  padding: 8px 12px;
}

.app-sidebar.is-collapsed .sidebar-brand {
  @apply justify-center gap-0;
}

.app-sidebar.is-collapsed .sidebar-group__chevron {
  display: none;
}

.app-sidebar.is-collapsed .sidebar-subnav {
  display: none !important;
}

.app-sidebar.is-collapsed .sidebar-link {
  @apply justify-center gap-0 px-0;
}

.app-sidebar.is-collapsed .sidebar-link__label {
  @apply w-0 opacity-0;
}

.sidebar-footer {
  @apply flex flex-col items-center justify-center gap-2 border-t border-dashed pt-3;
  border-color: var(--stitch);
}

.sidebar-toggle {
  @apply flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full border;
  border-color: rgba(0, 0, 0, 0.4);
  background: radial-gradient(circle at 35% 30%, var(--brass-light), var(--brass) 55%, var(--brass-dark) 100%);
  color: var(--leather-dark);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.6),
    inset 0 -2px 3px rgba(0, 0, 0, 0.35);
  transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
}

.sidebar-toggle:hover {
  filter: brightness(1.08);
}

.sidebar-toggle:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.45);
}

@media (max-width: 760px) {
  .app-sidebar {
    --sidebar-w: 224px;
    --sidebar-w-collapsed: 60px;
  }
}
</style>
