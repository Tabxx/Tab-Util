import {
    createRouter,
    createWebHistory
} from 'vue-router'
import FileKeyword from '../views/FileKeyword.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [{
        path: '/',
        component: FileKeyword
    }]
})

export default router