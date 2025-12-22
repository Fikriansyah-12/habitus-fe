import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '../pages/login/index.vue'
import DashboardPage from '../pages/dashboard/index.vue'
import RequestList from '../pages/dashboard/request-onsite/index.vue'
import RequestForm from '../pages/dashboard/request-onsite/form.vue'
import RequestEdit from '../pages/dashboard/request-onsite/edit.vue'
import RequestDetail from '../pages/dashboard/request-onsite/detail.vue'
import CustomerList from '../pages/dashboard/customer/index.vue'
import QuoteList from '../pages/dashboard/quote/index.vue'

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
    name: 'Request',
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
    path: '/request/detail',
    name: 'RequestDetail',
    component: RequestDetail,
    meta: {
      requiresAuth: true,
      showSidebar: true,
      submenu: true,
      parentPath: '/request'
    }
   },
    {
    path: '/customer',
    name: 'Customer',
    component: {},
    meta: {
      requiresAuth: true,
      showSidebar: true,
      sidebarTitle: 'Customer',
      sidebarIcon: 'mdi:account-group'
    }
  },
  {
    path: '/customer/list',
    name: 'CustomerList',
    component: CustomerList,
    meta: {
      requiresAuth: true,
      showSidebar: true,
      sidebarTitle: 'Customer List',
      sidebarIcon: 'lsicon:user-all-filled',
      submenu: true,
      parentPath: '/customer'
    }
  },
  {
    path: '/quote',
    name: 'Quote',
    component: {},
    meta: {
      requiresAuth: true,
      showSidebar: true,
      sidebarTitle: 'Quote',
      sidebarIcon: 'mdi:file-document'
    }
  },
  {
    path: '/quote/list',
    name: 'QuoteList',
    component: QuoteList,
    meta: {
      requiresAuth: true,
      showSidebar: true,
      sidebarTitle: 'Quote List',
      sidebarIcon: 'lsicon:list-filled',
      submenu: true,
      parentPath: '/quote'
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
