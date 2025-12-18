import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '../pages/login/index.vue'
import DashboardPage from '../pages/dashboard/index.vue'
import RequestList from '../pages/dashboard/request-onsite/index.vue'
import RequestForm from '../pages/dashboard/request-onsite/form.vue'
import RequestEdit from '../pages/dashboard/request-onsite/edit.vue'

export interface RouteMetaWithMenu {
  requiresAuth?: boolean
  showSidebar?: boolean
  sidebarTitle?: string
  sidebarIcon?: string
  submenu?: boolean
  parentPath?: string
}

declare module 'vue-router' {
  interface RouteMeta extends RouteMetaWithMenu {}
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      showSidebar: false
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: {
      requiresAuth: true,
      showSidebar: true,
      sidebarTitle: 'Dashboard',
      sidebarIcon: 'mdi:chart-box'
    }
  },
  {
    path: '/request',
    name: 'Users',
    component: { },
    meta: {
      requiresAuth: true,
      showSidebar: true,
      sidebarTitle: 'Onsite Requests',
      sidebarIcon: 'uis:schedule'
    }
  },
  {
    path: '/request/list',
    name: 'RequestList',
    component: RequestList,
    meta: {
      requiresAuth: true,
      showSidebar: true,
      sidebarTitle: 'Request List',
      sidebarIcon: 'lsicon:list-filled',
      submenu: true,
      parentPath: '/request'
    }
  },
{
    path: '/request/form',
    name: 'RequestForm',
    component: RequestForm,
    meta: {
      requiresAuth: true,
      showSidebar: true,
      sidebarTitle: 'Request New',
      sidebarIcon: 'codicon:git-pull-request-new-changes',
      submenu: true,
      parentPath: '/request'
    }
  },
   {
    path: '/request/edit',
    name: 'RequestEdit',
    component: RequestEdit,
     meta: {
      requiresAuth: true,
      showSidebar: true,
      submenu: true,
      parentPath: '/request'
    }
   },
    {
    path: '/page-dummy',
    name: 'page-dummy',
    component: { template: '<div class="p-6"><h1>page-dummy Page (Dummy)</h1></div>' },
    meta: {
      requiresAuth: true,
      showSidebar: true,
      sidebarTitle: 'Dummt  y Page',
      sidebarIcon: 'mdi:account-group'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('authToken')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
  } else if (to.path === '/' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
