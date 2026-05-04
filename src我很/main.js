import { createApp } from 'vue'
import App from './App.vue'
// 引入路由
import router from './router'
// 引入Element Plus（如果没装先执行：npm install element-plus）
import { ElCard, ElDivider, ElUpload, ElButton, ElTable, ElTableColumn, ElMessage } from 'element-plus'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
// 挂载路由和Element Plus
app.use(router)
app.use(ElementPlus)
app.mount('#app')