import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/Welcome.vue'
import Users from '@/components/user/Users.vue'
import Rights from '@/components/power/Rights.vue'
import Roles from '@/components/power/Roles.vue'
import Category from '@/components/goods/Category.vue'

Vue.use(Router)

const router= new Router({
  routes: [
    {path:'/',redirect:'/login'},
    {
      path: '/login', component: Login
    },
    {
      path: '/home', component: Home,redirect:'/welcome',
      children:[
        {
          path:'/welcome',
          component:Welcome
        },
        {
          path:'/users',
          component:Users
        },
        {
          path:'/rights',
          component:Rights
        },
        {
          path:'/roles',
          component:Roles
        },
        {
          path:'/categories',
          component:Category
        }
      ]
    },
  ]
})
// 挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  // to 将要访问的路径
  // from 代表从那个路径来
  // next 是一个函数,表示放行
  //   next() 放行 next('/login) 强制跳转
  if(to.path==='/login') return next();
  //获取token
  const tokenStr=window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next();
})
export default router
