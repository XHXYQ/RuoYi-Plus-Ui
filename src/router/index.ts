import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';
/* Layout */
import Layout from '@/layout/index.vue';

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/social-callback',
    hidden: true,
    component: () => import('@/layout/components/SocialCallback/index.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index.vue'),
        name: 'Index',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index.vue'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  }
];

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole.vue'),
        name: 'AuthRole',
        meta: { title: '分配角色', activeMenu: '/system/user', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser.vue'),
        name: 'AuthUser',
        meta: { title: '分配用户', activeMenu: '/system/role', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data.vue'),
        name: 'Data',
        meta: { title: '字典数据', activeMenu: '/system/dict', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/system/oss-config',
    component: Layout,
    hidden: true,
    permissions: ['system:ossConfig:list'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/system/oss/config.vue'),
        name: 'OssConfig',
        meta: { title: '配置管理', activeMenu: '/system/oss', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable.vue'),
        name: 'GenEdit',
        meta: { title: '修改生成配置', activeMenu: '/tool/gen', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/system/employee/Edit',
    component: Layout,
    hidden: true,
    permissions: ['system:employee:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/system/employee/indexEdit.vue'),
        name: 'EmployeeEdit',
        meta: { 
          title: '查看员工', 
          activeMenu: '/system/employee',
          noCache: true 
        }
      }
    ]
  },
  {
    path: '/system/holidayEdit',
    component: Layout,
    hidden: true,
    permissions: ['system:holiday:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/system/holiday/holidayEdit.vue'),
        name: 'holidayEdit',
        meta: { title: '假期余额', activeMenu: '/system/holiday', noCache: true }
      }
    ]
  },
  {
    path: '/system/resignEdit',
    component: Layout,
    hidden: true,
    permissions: ['system:resign:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/system/resign/resignEdit.vue'),
        name: 'resignEdit',
        meta: { title: '离职申请', activeMenu: '/system/resign', noCache: true }
      }
    ]
  },
  {
    path: '/system/replacementEdit',
    component: Layout,
    hidden: true,
    permissions: ['system:replacement:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/system/replacement/replacementEdit.vue'),
        name: 'replacementEdit',
        meta: { title: '补卡申请', activeMenu: 'system/replacement', noCache: true }
      }
    ]
  },
  {
    path: '/workflow/leaveEdit',
    component: Layout,
    hidden: true,
    permissions: ['workflow:leave:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/workflow/leave/leaveEdit.vue'),
        name: 'leaveEdit',
        meta: { title: '请假申请', activeMenu: '/workflow/leave', noCache: true }
      }
    ]
  },
  {
    path: '/workflow/businessEdit',
    component: Layout,
    hidden: true,
    permissions: ['workflow:business:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/workflow/business/businessEdit.vue'),
        name: 'businessEdit',
        meta: { title: '出差申请', activeMenu: '/workflow/business', noCache: true }
      }
    ]
  },
  {
    path: '/workflow/overtimeEdit',
    component: Layout,
    hidden: true,
    permissions: ['workflow:overtime:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/workflow/overtime/overtimeEdit.vue'),
        name: 'overtimeEdit',
        meta: { title: '加班申请', activeMenu: '/workflow/overtime', noCache: true }
      }
    ]
  },
  {
    path: '/workflow/applicationEdit',
    component: Layout,
    hidden: true,
    permissions: ['workflow:application:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/workflow/application/applicationEdit.vue'),
        name: 'application',
        meta: { title: '转正申请', activeMenu: '/workflow/application', noCache: true }
      }
      // {
      //   path: 'applicationEdit',
      //   component: () => import('@/views/workflow/application/applicationEdit.vue'),
      //   name: 'applicationEdit',
      //   meta: { title: '转正申请', activeMenu: '/workflow/application', noCache: true }
      // }
    ]
  },
  {
    path: '/workflow/outgoingEdit',
    component: Layout,
    hidden: true,
    permissions: ['workflow:outgoing:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/workflow/outgoing/outgoingEdit.vue'),
        name: 'outgoingEdit',
        meta: { title: '外出申请', activeMenu: '/workflow/outgoing', noCache: true }
      }
    ]
  },
  {
    path: '/workflow/design',
    component: Layout,
    hidden: true,
    permissions: ['workflow:leave:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/workflow/processDefinition/design.vue'),
        name: 'design',
        meta: { title: '流程设计', activeMenu: '/workflow/processDefinition', noCache: true }
      }
    ]
  }
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_CONTEXT_PATH),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

export default router;
