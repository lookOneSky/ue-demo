import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { persistProjectRootPath } from './utils/projectPath'

const app = createApp(App)

persistProjectRootPath()

// 使用 Element Plus
app.use(ElementPlus)

app.mount('#app')
