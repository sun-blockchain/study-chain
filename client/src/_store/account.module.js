import { authService } from '../_services/auth.service';
import { router } from '../router';

const user = JSON.parse(localStorage.getItem('user'));
const state = user
  ? {
      status: { loggedIn: true },
      user
    }
  : {
      status: {},
      user: null
    };

const actions = {
  async login({ dispatch, commit }, { username, password }) {
    try {
      let user = await authService.login(username, password);
      if (user) {
        commit('loginSuccess', user);
        router.push('/home');
      }
    } catch (error) {
      commit('loginFailure', error);
      dispatch('alert/alertAuthor', error, { root: true });
    }
  },
  async register({ dispatch, commit }, user) {
    try {
      let response = await authService.register(user);
      if (response.success) {
        commit('registerSuccess');
        router.push('/login');
        setTimeout(() => {
          dispatch(
            'alert/success',
            { alert: false, message: 'Registration successful' },
            { root: true }
          );
        });
      }
    } catch (error) {
      commit('loginFailure', error);
      commit('registerFailure');
      dispatch('alert/alertAuthor', error, { root: true });
    }
  },

  logout({ commit }) {
    authService.logout();
    commit('logout');
    router.push('/login');
  },

  loginGoogle({ dispatch, commit }, code) {
    authService.loginGoogle(code).then(
      (user) => {
        commit('loginSuccess', user);
        router.push('/home');
      },
      (error) => {
        commit('loginFailure', error);
        dispatch('alert/error', error, { root: true });
      }
    );
  },
  async getProfile() {
    try {
      let info = await authService.getProfile();
      return info;
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async pushProfile({}, user) {
    try {
      let data = await authService.pushProfile(user);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  },
  async changePass({}, changePass) {
    try {
      let data = await authService.changePass(changePass);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  }
};

const mutations = {
  loginRequest(state, user) {
    state.status = { loggingIn: true };
    state.user = user;
  },
  loginSuccess(state, user) {
    state.status = { loggedIn: true };
    state.user = user;
  },
  loginFailure(state) {
    state.status = {};
    state.user = null;
  },
  registerRequest(state, user) {
    state.status = { registering: true };
  },
  registerSuccess(state) {
    state.status = {};
  },
  registerFailure(state) {
    state.status = {};
  },
  logout(state) {
    state.status = {};
    state.user = null;
  }
};

export const account = {
  namespaced: true,
  state,
  actions,
  mutations
};
