import { createRouter, createWebHistory } from 'vue-router'

const APP_TITLE = 'Client Starter'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: 'Home' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/product/ProductListView.vue'),
          meta: { title: 'สินค้า' },
        },
        {
          path: 'inventory/movements',
          name: 'inventory-movements',
          component: () => import('@/views/inventory/InventoryMovementView.vue'),
          meta: { title: 'Inventory Movement' },
        },
        {
          path: 'sales-orders',
          name: 'sales-orders',
          component: () => import('@/views/sales/SalesOrderListView.vue'),
          meta: { title: 'Sales Order', group: 'Sales' },
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('@/views/sales/InvoiceView.vue'),
          meta: { title: 'Invoice', group: 'Sales' },
        },
        {
          path: 'reports/sales',
          name: 'sales-report',
          component: () => import('@/views/report/SalesReportView.vue'),
          meta: { title: 'Sales Report', group: 'Report' },
        },
        {
          path: 'reports/inventory',
          name: 'inventory-report',
          component: () => import('@/views/report/InventoryReportView.vue'),
          meta: { title: 'Inventory Report', group: 'Report' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
    },
  ],
})

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : APP_TITLE
  document.title = pageTitle === APP_TITLE ? APP_TITLE : `${pageTitle} | ${APP_TITLE}`
})

export default router
