import {
    createRouter,
    createWebHistory
} from 'vue-router'
import FileKeyword from '../views/FileKeyword.vue'
import ImageCache from '../views/ImageCache.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [{
        path: '/',
        component: FileKeyword
    }, {
        path: '/imagecache',
        component: ImageCache
    }]
})

export default router