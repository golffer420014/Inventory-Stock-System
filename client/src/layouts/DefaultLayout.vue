<script setup lang="ts">
// #import
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationStream } from '@/composables/useNotificationStream'
import AppSidebar from '@/components/AppSidebar.vue'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseToastStack from '@/components/common/BaseToastStack.vue'
import BaseConfirmDialog from '@/components/common/BaseConfirmDialog.vue'

// #computed
const route = useRoute()
const isHome = computed(() => route.name === 'home')

useNotificationStream()
</script>

<template>
  <div class="app-layout">
    <AppSidebar />

    <main class="app-content">
      <AppBreadcrumb v-if="!isHome" />

      <BaseCard v-if="!isHome" class="app-content-card">
        <RouterView />
      </BaseCard>
      <RouterView v-else />
    </main>

    <BaseToastStack />
    <BaseConfirmDialog />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.app-layout {
  @apply flex min-h-screen items-stretch;
  background: var(--paper);
}

.app-content {
  @apply relative flex-1 min-w-0 flex flex-col;
  padding: 40px clamp(20px, 4vw, 56px);
  background:
    radial-gradient(circle at top left, var(--paper-highlight), transparent 60%),
    var(--paper);
}

.app-content-card {
  @apply flex-1;
  min-height: 0;
}

@media (max-width: 760px) {
  .app-content {
    padding: 28px clamp(16px, 5vw, 40px);
  }
}
</style>
