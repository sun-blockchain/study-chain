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
  login({ dispatch, commit }, { username, password }) {
    commit('loginRequest', { username });
    authService.login(username, password).then(
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
  register({ dispatch, commit }, user) {
    commit('registerRequest', user);
    authService.register(user).then(
      (data) => {
        commit('registerSuccess');
        router.push('/login');
        setTimeout(() => {
          dispatch('alert/success', 'Registration successful', { root: true });
        });
      },
      (error) => {
        commit('registerFailure');
        dispatch('alert/error', error, { root: true });
      }
    );
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
