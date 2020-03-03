import { studentService } from '../_services/student.service';
import { router } from '../router';

const user = JSON.parse(localStorage.getItem('user'));
const state = {
  listSubjects: [],
  mySubjects: [],
  myCertificates: [],
  listCourses: [],
  listClasses: [],
  subject: null,
  listMyClasses: [],
  listMyCourses: [],
  listNotRegisterCourses: [],
  summaryInfo: []
};

const actions = {
  async getSummaryInfo({ commit }) {
    try {
      let summaryInfo = await studentService.getSummaryInfo();
      commit('getSummaryInfo', summaryInfo);
      return summaryInfo;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
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
  async cancelRegisteredClass({ commit }, classId) {
    try {
      let response = await studentService.cancelRegisteredClass(classId);
      return response;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getNotRegisterCourses({ commit }) {
    try {
      let listNotRegisterCourses = await studentService.getNotRegisterCourses();
      commit('getNotRegisterCourses', listNotRegisterCourses);
      return listNotRegisterCourses;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getSubject({ commit }, subjectId) {
    try {
      let subject = await studentService.getSubject(subjectId);
      commit('getSubject', subject);
      return subject;
    } catch (error) {
      console.log(error);
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
  async getClassesOfSubject({ commit }, subjectId) {
    try {
      let listClasses = await studentService.getClassesOfSubject(subjectId);
      commit('getClassesOfSubject', listClasses);
    } catch (error) {
      console.log(error);
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
  async getMyClasses({ commit }) {
    try {
      let listMyClasses = await studentService.getMyClasses();
      commit('getMyClasses', listMyClasses);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getMyCourses({ commit }) {
    try {
      let listMyCourses = await studentService.getMyCourses();
      commit('getMyCourses', listMyCourses);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async registerCourse({ commit }, courseId) {
    try {
      let response = await studentService.registerCourse(courseId);
      return response;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async registerClass({ commit }, classId) {
    try {
      let response = await studentService.registerClass(classId);
      return response;
    } catch (error) {
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
  getSummaryInfo(state, summaryInfo) {
    state.summaryInfo = summaryInfo;
  },
  getCourse(state, listCourses) {
    state.listCourses = listCourses;
  },
  getSubject(state, subject) {
    state.subject = subject;
  },
  getSubjectsOfCourse(state, listSubjects) {
    state.listSubjects = listSubjects;
  },
  getAllCourses(state, listCourses) {
    state.listCourses = listCourses;
  },
  getNotRegisterCourses(state, listNotRegisterCourses) {
    state.listNotRegisterCourses = listNotRegisterCourses;
  },
  getAllSubjects(state, listSubjects) {
    state.listSubjects = listSubjects;
  },
  getClassesOfSubject(state, listClasses) {
    state.listClasses = listClasses;
  },
  getMyClasses(state, listMyClasses) {
    state.listMyClasses = listMyClasses;
  },
  getMyCourses(state, listMyCourses) {
    state.listMyCourses = listMyCourses;
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
