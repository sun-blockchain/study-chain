import { router } from '../router';

const state = {
  alert: false,
  status: null,
  type: '',
  message: ''
};

const actions = {
  success({ commit }, { alert, message }) {
    commit('success', { alert, message });
  },
  error({ commit }, { alert, message }) {
    commit('error', { alert, message });
  },
  clear({ commit }) {
    commit('clear');
  },
  alertError({ commit }, error) {
    if (!error.response) {
      commit('error', { alert: true, message: error.message });
    } else {
      if (error.response.status === 403) {
        router.push('/403');
      } else if (error.response.data.msg) {
        commit('error', { alert: true, message: error.response.data.msg });
      } else {
        commit('error', { alert: true, message: error.response.statusText });
      }
    }
  },
  alertAuthor({ commit }, error) {
    if (!error.response) {
      commit('error', { alert: false, message: error.message });
    } else {
      if (error.response.data.msg) {
        commit('error', { alert: false, message: error.response.data.msg });
      } else {
        commit('error', { alert: false, message: error.response.statusText });
      }
    }
    setTimeout(() => {
      commit('clear');
    }, 3000);
  }
};

const mutations = {
  success(state, { alert, message }) {
    state.alert = alert;
    state.type = 'alert-success';
    state.message = message;
    setTimeout(() => {
      state.alert = false;
    }, 3000);
  },
  error(state, { alert, message }) {
    state.alert = alert;
    state.type = 'alert-danger';
    state.message = message;
    setTimeout(() => {
      state.alert = false;
    }, 3000);
  },
  clear(state) {
    state.display = false;
    state.alert = false;
    state.status = null;
    state.type = '';
    state.message = '';
  }
};

export const alert = {
  namespaced: true,
  state,
  actions,
  mutations
};
