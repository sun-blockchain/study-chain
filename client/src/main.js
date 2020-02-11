import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VueSweetalert2 from 'vue-sweetalert2';

import { router } from './router';
import store from './_store/store';
import './assets/vendor/sasu/home.css';
import BootstrapVue from 'bootstrap-vue';
import './vee-validate';

import ElementUI from 'element-ui';
import locale from 'element-ui/lib/locale';
import 'element-ui/lib/theme-chalk/index.css';
import lang from 'element-ui/lib/locale/lang/en';
locale.use(lang);
Vue.use(ElementUI);

Vue.config.productionTip = false;

Vue.use(VueSweetalert2);
import 'sweetalert2/dist/sweetalert2.min.css';

Vue.use(BootstrapVue);

Vue.use(VueAxios, axios);

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');
