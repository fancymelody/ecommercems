// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';
import App from './App'
import router from './router'
import ZkTable from 'vue-table-with-tree-grid'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false

Vue.component('tree-table',ZkTable)
Vue.use(ElementUI);

// Vue.prototype.axios = axios;
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
// 通过axios请求拦截器添加token,保证拥有获取数据的权限
axios.interceptors.request.use(config=>{
  // console.log(config)
  config.headers.Authorization=window.sessionStorage.getItem('token')
  // console.log(config)
  return config;
})
Vue.prototype.$http=axios

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
