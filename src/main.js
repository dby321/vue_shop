import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 按需引入Element-Ui
import './plugins/element.js'
// 引入font-awesome
import 'font-awesome/css/font-awesome.css'
// 导入全局样式
import "./assets/css/global.css"
// 配置axios
import axios from "axios"
// 配置请求的根路径
axios.defaults.baseURL="https://www.liulongbin.top:8888/api/private/v1/"
/* axios请求拦截 */
axios.interceptors.request.use(config=>{
  console.log(config);
  config.headers.Authorization=window.sessionStorage.getItem("token");
  return config;
})
Vue.prototype.$http=axios
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
