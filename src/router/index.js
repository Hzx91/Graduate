import { createRouter, createWebHistory } from 'vue-router'
// 引入所有页面组件
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import PostManage from '../views/PostManage.vue'
import ResourceManage from '../views/ResourceManage.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/login' // 默认跳登录页
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/home',
            name: 'Home',
            component: Home,
            children: [ // 首页的子路由
                {
                    path: 'post-manage', // 完整路径：/home/post-manage
                    name: 'PostManage',
                    component: PostManage
                },
                {
                    path: 'resource-manage', // 完整路径：/home/resource-manage
                    name: 'ResourceManage',
                    component: ResourceManage
                }
            ]
        }
    ]
})

// 路由守卫：未登录不能进首页
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next()
    // 模拟token（登录后存本地，这里先写死测试）
    const token = localStorage.getItem('adminToken') || 'test-token'
    token ? next() : next('/login')
})

export default router