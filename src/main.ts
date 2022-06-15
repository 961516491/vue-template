import { createApp } from 'vue'
import App from './App.vue'

import router from './router/index'
import store from './store/index'

/**全局样式引入 */
import "@/styles/index.scss";

import '@/router/permission'

createApp(App).use(router).use(store).mount('#app')
