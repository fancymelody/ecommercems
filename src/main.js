// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';
import App from './App'
import router from './router'
// 导入vue-table-with-tree-grid带有树状结构的表格
import ZkTable from 'vue-table-with-tree-grid'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入vue-quill-editor富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入vue-quill-editor的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入nprogress插件
import NProgress from 'nprogress'
// 导入nprogress对应的css
import 'nprogress/nprogress.css'

Vue.use(VueQuillEditor)

Vue.config.productionTip = false

Vue.component('tree-table', ZkTable)
Vue.use(ElementUI);

// 时间过滤器
Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
})

// Vue.prototype.axios = axios;
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 通过axios请求拦截器添加token,保证拥有获取数据的权限
// 在request拦截器中,展示进度条 NProgress.start();
axios.interceptors.request.use(config => {
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  return config;
})
// 在response拦截器中,展示进度条 NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done();
  return config;
})
Vue.prototype.$http = axios

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
