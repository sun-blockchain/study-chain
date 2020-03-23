import { studentService } from '../_services/student.service';
import { router } from '../router';

const user = JSON.parse(localStorage.getItem('user'));
const state = {
  listSubjects: [],
  mySubjects: [],
  myCertificates: [],
  listCourses: [],
  listClasses: [],
  subjects: [],
  listMyClasses: [],
  listMyCourses: [],
  listNotRegisterCourses: [],
  summaryInfo: [],
  subject: null,
  courseInfo: []
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
      let data = await studentService.getCourse(courseId);

      commit('getCourse', data);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async cancelRegisteredClass({ commit }, { classId, courseId }) {
    try {
      let data = await studentService.cancelRegisteredClass(classId, courseId);
      return data;
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
      let data = await studentService.getSubject(subjectId);
      commit('getSubject', data.subject);
      return data;
    } catch (error) {}
  },
  async getSubjectsOfCourse({ commit, dispatch }, courseId) {
    try {
      let data = await studentService.getSubjectsOfCourse(courseId);
      commit('getSubjectsOfCourse', data.subjects);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },
  async getClassesOfSubject({ commit }, subjectId) {
    try {
      let listClasses = await studentService.getClassesOfSubject(subjectId);
      commit('getClassesOfSubject', listClasses);
      return listClasses;
    } catch (error) {}
  },
  async getAllCourses({ commit }) {
    try {
      let listCourses = await studentService.getAllCourses();
      commit('getAllCourses', listCourses);
      return listCourses;
    } catch (error) {
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
      return listMyCourses;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async registerCourse({ commit }, courseId) {
    try {
      let data = await studentService.registerCourse(courseId);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async registerClass({ commit }, { classId, courseId }) {
    try {
      let data = await studentService.registerClass(classId, courseId);
      return data;
    } catch (error) {
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
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async claimCertificate({ commit }, courseId) {
    try {
      let myCertificates = await studentService.claimCertificate(courseId);
      commit('claimCertificate', myCertificates);
      return myCertificates;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getCertificate({ commit }, certId) {
    try {
      let cert = await studentService.getCertificate(certId);
      return cert;
    } catch (error) {
      router.push('/404');
    }
  },
  async getCertificateByCourseId({ commit }, courseId) {
    try {
      let cert = await studentService.getCertificateByCourseId(courseId);
      return cert;
    } catch (error) {
      router.push('/404');
    }
  },
  async verifyCertificate({ dispatch, commit }, certId) {
    try {
      let data = await studentService.verifyCertificate(certId);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  }
};

const mutations = {
  getSummaryInfo(state, summaryInfo) {
    state.summaryInfo = summaryInfo;
  },
  getCourse(state, courseInfo) {
    state.courseInfo = courseInfo;
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
  getMyCertificates(state, myCertificates) {
    state.myCertificates = myCertificates;
  },
  claimCertificate(state, myCertificates) {
    state.myCertificates = myCertificates;
  }
};

export const student = {
  namespaced: true,
  state,
  actions,
  mutations
};
