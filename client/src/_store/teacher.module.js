import { teacherService } from '../_services/teacher.service';
import { router } from '../router';

const state = {
  listClasses: [],
  studentsOfSubject: [],
  scores: []
};

const actions = {
  async getClassesOfTeacher({ dispatch, commit }) {
    try {
      let data = await teacherService.getClassesOfTeacher();
      commit('getClassesOfTeacher', data.classes);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response;
    }
  },
  async getStudentsOfSubject({ dispatch, commit }, subjectId) {
    let res = await teacherService.getStudentsOfSubject(subjectId);
    if (!res.success) {
      dispatch('alert/error', res.msg, { root: true });
      if ('403'.includes(res.msg)) {
        router.push('/403');
      }
    } else {
      dispatch('alert/clear', res.success, { root: true });
      commit('getStudentsOfSubject', res.students);
    }
  },
  async updateScore({ commit }, { classId, score, studentUsername }) {
    try {
      let data = await teacherService.updateScore(classId, score, studentUsername);

      commit('updateScore', data);
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
  getClassesOfTeacher(state, listClasses) {
    state.listClasses = listClasses;
  },
  getStudentsOfSubject(state, studentsOfSubject) {
    state.studentsOfSubject = studentsOfSubject;
  },
  updateScore(state, scores) {
    state.scores = scores;
  }
};

export const teacher = {
  namespaced: true,
  state,
  actions,
  mutations
};
