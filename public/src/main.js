import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';

import {
    createApp
} from 'vue'
import router from './router'
import App from './App.vue'
import cacheImage from './directives/cacheImage'
import { init } from './util/indexDB';

// 启动数据库
// init();

const app = createApp(App)
app.directive('cacheImage', cacheImage)
app.use(ElementPlus)
app.use(router)
app.mount('#app')