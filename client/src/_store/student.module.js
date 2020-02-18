import { studentService } from '../_services/student.service';
import { router } from '../router';

const user = JSON.parse(localStorage.getItem('user'));
const state = {
  listSubjects: [],
  mySubjects: [],
  myCertificates: [],
  listCourses: []
};

const actions = {
  async getCourse({ commit }, courseId) {
    try {
      let listCourses = await studentService.getCourse(courseId);
      commit('getCourse', listCourses);
      return listCourses;
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getSubjectsOfCourse({ commit }, courseId) {
    try {
      let listSubjects = await studentService.getSubjectsOfCourse(courseId);
      commit('getSubjectsOfCourse', listSubjects);
      return listSubjects;
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getAllCourses({ commit }) {
    try {
      let listCourses = await studentService.getAllCourses();
      commit('getAllCourses', listCourses);
      return listCourses;
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getAllSubjects({ commit }, username) {
    try {
      let listSubjects = await studentService.getAllSubjects(username);
      commit('getAllSubjects', listSubjects);
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async registerSubject({ commit }, subjectId) {
    try {
      let listSubjects = await studentService.registerSubject(subjectId);
      commit('registerSubject', listSubjects);
      location.reload(true);
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getMySubjects({ commit }) {
    try {
      let mySubjects = await studentService.getMySubjects();
      commit('getMySubjects', mySubjects);
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getMyCertificates({ commit }) {
    try {
      let myCertificates = await studentService.getMyCertificates();
      commit('getMyCertificates', myCertificates);
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  }
};

const mutations = {
  getCourse(state, listCourses) {
    state.listCourses = listCourses;
  },
  getSubjectsOfCourse(state, listSubjects) {
    state.listSubjects = listSubjects;
  },
  getAllCourses(state, listCourses) {
    state.listCourses = listCourses;
  },
  getAllSubjects(state, listSubjects) {
    state.listSubjects = listSubjects;
  },
  registerSubject(state, listSubjects) {
    state.listSubjects = listSubjects;
  },
  getMySubjects(state, mySubjects) {
    state.mySubjects = mySubjects;
  },
  getMyCertificates(state, myCertificates) {
    state.myCertificates = myCertificates;
  }
};

export const student = {
  namespaced: true,
  state,
  actions,
  mutations
};
