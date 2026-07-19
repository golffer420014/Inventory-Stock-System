import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from '@/App.vue'
import router from '@/router'
import { vNumberFormat } from '@/directives/numberFormat'

createApp(App)
  .use(createPinia())
  .use(router)
  .directive('number-format', vNumberFormat)
  .mount('#app')
