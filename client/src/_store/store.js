import Vue from 'vue';
import Vuex from 'vuex';

import { account } from './account.module';
import { alert } from './alert.module';
import { adminAcademy } from './admin.module';
import { student } from './student.module';
import { teacher } from './teacher.module';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    statusSidebar: false
  },
  actions: {
    changeStatusSidebar({ commit }) {
      commit('changeStatusSidebar');
    }
  },
  mutations: {
    changeStatusSidebar(state) {
      state.statusSidebar = !state.statusSidebar;
    }
  },
  modules: {
    account,
    alert,
    adminAcademy,
    student,
    teacher
  }
});
