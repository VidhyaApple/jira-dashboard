import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { setupECharts } from './plugins/echarts'
import { useThemeStore } from './stores/theme'

setupECharts()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

useThemeStore(pinia).init()
