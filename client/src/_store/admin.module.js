import { adminService } from '../_services/admin.service';
import { router } from '../router';

const state = {
  listCourses: [],
  listSubjects: [],
  listTeachers: [],
  listStudents: [],
  listClasses: [],
  studentsOfSubject: [],
  subjectsOfTeacher: [],
  subjectOfStudent: [],
  subjectsNoTeacher: [],
  subjectsOfCourse: []
};

const actions = {
  async createClass({ commit }, _class) {
    try {
      let listClasses = await adminService.createClass(_class);
      commit('createClass', listClasses);
      return listClasses;
    } catch (error) {
      // if (error.response.status === 403) {
      //   router.push('/403');
      // }
    }
  },
  async updateClass({ commit }, _class) {
    try {
      let data = await adminService.updateClass(_class);

      commit('updateClass', data);

      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  },
  async getClass({ commit }, classId) {
    try {
      let data = await adminService.getClass(classId);

      commit('getClass', data);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async deleteClass({ commit }, { subjectId, classId }) {
    try {
      let listClasses = await adminService.deleteClass(subjectId, classId);
      commit('deleteClass', listClasses);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async closeClass({ commit }, { classId }) {
    try {
      let data = await adminService.closeClass(classId);

      commit('closeClass', data);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getStudentsOfClass({ commit }, { classId }) {
    try {
      let data = await adminService.getStudentsOfClass(classId);

      commit('getStudentsOfClass', data.students);
      return data.students;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getCourse({ commit }, courseId) {
    try {
      let data = await adminService.getCourse(courseId);
      commit('getCourse', data.course);
      commit('getSubjectsOfCourse', data.listSubjects);
      return data.course;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getAllCourses({ commit }) {
    try {
      let listCourses = await adminService.getAllCourses();
      commit('getAllCourses', listCourses);
      return listCourses;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async createCourse({ commit }, course) {
    try {
      let listCourses = await adminService.createCourse(course);
      commit('createCourse', listCourses);
      return listCourses;
    } catch (error) {
      // if (error.response.status === 403) {
      //   router.push('/403');
      // }
    }
  },
  async updateCourse({ commit }, course) {
    try {
      let listCourses = await adminService.updateCourse(course);
      commit('updateCourse', listCourses);
      return listCourses;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async deleteCourse({ commit }, courseId) {
    try {
      let listCourses = await adminService.deleteCourse(courseId);
      commit('deleteCourse', listCourses);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  // get subject by id
  async getSubject({ commit }, subjectId) {
    try {
      let data = await adminService.getSubject(subjectId);
      commit('getSubject', data.subject);
      return data.subject;
    } catch (error) {
      // if (error.response.status === 403) {
      //   router.push('/403');
      // }

      return error.response;
    }
  },
  // Subjects of Course

  async getSubjectsNoCourse({ commit }, courseId) {
    try {
      let data = await adminService.getSubjectsNoCourse(courseId);
      return data;
    } catch (error) {
      // if (error.response.status === 403) {
      //   router.push('/403');
      // }
      return error.response;
    }
  },

  async addSubjectToCourse({ commit }, { courseId, subjectId }) {
    try {
      let data = await adminService.addSubjectToCourse(courseId, subjectId);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response;
    }
  },

  async deleteSubjectFromCourse({ commit }, { courseId, subjectId }) {
    try {
      let data = await adminService.deleteSubjectFromCourse(courseId, subjectId);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response;
    }
  },

  // Subjects Manager
  async getAllSubjects({ commit }) {
    try {
      let listSubjects = await adminService.getAllSubjects();
      commit('getAllSubjects', listSubjects);
      return listSubjects;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async createSubject({ commit }, subject) {
    try {
      let data = await adminService.createSubject(subject);
      commit('createSubject', data.subjects);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  },
  async updateSubject({ commit }, subject) {
    try {
      let data = await adminService.updateSubject(subject);
      commit('updateSubject', data.subjects);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  },
  async deleteSubject({ commit }, subjectId) {
    try {
      let data = await adminService.deleteSubject(subjectId);
      commit('deleteSubject', data.subjects);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response;
    }
  },

  //   Students of subject
  async getStudentsOfSubject({ commit }, subjectId) {
    try {
      let listStudents = await adminService.getStudentsOfSubject(subjectId);
      commit('getStudentsOfSubject', listStudents);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async deleteStudentOfSubject({ commit }, { SubjectID, Username }) {
    try {
      let listSubjects = await adminService.deleteStudentOfSubject(SubjectID, Username);
      commit('deleteStudentOfSubject', listSubjects);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },

  // Teacher manager
  async getAllTeachers({ commit }) {
    try {
      let listTeachers = await adminService.getAllTeachers();
      commit('getAllTeachers', listTeachers);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },

  async createTeacher({ dispatch, commit }, teacher) {
    try {
      let data = await adminService.createTeacher(teacher);
      commit('createTeacher', data.teachers);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  },

  async deleteTeacher({ commit }, teacher) {
    try {
      let listTeachers = await adminService.deleteTeacher(teacher);
      commit('deleteTeacher', listTeachers);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },

  //  Subjects of Teacher
  async getSubjectsOfTeacher({ commit }, Username) {
    try {
      let listSubjects = await adminService.getSubjectsOfTeacher(Username);
      commit('getSubjectsOfTeacher', listSubjects);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async deleteSubjectOfTeacher({ commit }, { Username, subjectId }) {
    try {
      let listSubjects = await adminService.deleteSubjectOfTeacher(Username, subjectId);
      commit('deleteSubjectOfTeacher', listSubjects);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async addSubjectOfTeacher({ commit }, { username, subjectId }) {
    try {
      let listSubjects = await adminService.addSubjectOfTeacher(username, subjectId);
      commit('addSubjectOfTeacher', listSubjects);
      location.reload(true);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getSubjectsNoTeacher({ commit }) {
    try {
      let listSubjects = await adminService.getSubjectsNoTeacher();
      commit('getSubjectsNoTeacher', listSubjects);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },

  // Teacher Manager
  async getAllStudents({ commit }) {
    try {
      let listStudents = await adminService.getAllStudents();
      commit('getAllStudents', listStudents);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getClassesOfSubject({ commit }, subjectId) {
    try {
      let listClasses = await adminService.getClassesOfSubject(subjectId);
      commit('getClassesOfSubject', listClasses);
    } catch (error) {
      // if (error.response.status === 403) {
      //   router.push('/403');
      // }
    }
  },
  // Subjects of student
  async getSubjectsOfStudent({ commit }, Username) {
    try {
      let listSubjects = await adminService.getSubjectsOfStudent(Username);
      commit('getSubjectsOfStudent', listSubjects);
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },

  // Student Subject Certificate
  async getCertificatesOfSubject({ dispatch, commit }, subjectId) {
    let res = await adminService.getCertificatesOfSubject(subjectId);
    if (!res.success) {
      dispatch('alert/error', res.msg, { root: true });
      if ('403'.includes(res.msg)) {
        router.push('/403');
      }
    } else {
      dispatch('alert/clear', res.success, { root: true });
      commit('getCertificatesOfSubject', res.students);
    }
  },
  async confirmCertificate({ dispatch, commit }, { studentUsername, subjectId }) {
    let res = await adminService.confirmCertificate(studentUsername, subjectId);
    if (!res.success) {
      dispatch('alert/error', res.msg, { root: true });
      if ('403'.includes(res.msg)) {
        router.push('/403');
      }
    } else {
      dispatch('alert/clear', res.success, { root: true });
      commit('getCertificatesOfSubject', res.students);
    }
  }
};

const mutations = {
  createClass(state, listClasses) {
    state.listClasses = listClasses;
  },
  updateClass(state, listClasses) {
    state.listClasses = listClasses;
  },
  getClass(state, listClasses) {
    state.listClasses = listClasses;
  },
  deleteClass(state, listClasses) {
    state.listClasses = listClasses;
  },
  closeClass(state, listClasses) {
    state.listClasses = listClasses;
  },
  getStudentsOfClass(state, listStudents) {
    state.listStudents = listStudents;
  },
  getCourse(state, listCourses) {
    state.listCourses = listCourses;
  },
  getAllCourses(state, listCourses) {
    state.listCourses = listCourses;
  },
  createCourse(state, listCourses) {
    state.listCourses = listCourses;
  },
  updateCourse(state, listCourses) {
    state.listCourses = listCourses;
  },
  deleteCourse(state, listCourses) {
    state.listCourses = listCourses;
  },
  // Subjects Manager
  getAllSubjects(state, listSubjects) {
    state.listSubjects = listSubjects;
  },
  createSubject(state, listSubjects) {
    state.listSubjects = listSubjects;
  },
  getSubject(state, listSubjects) {
    state.listSubjects = listSubjects;
  },
  updateSubject(state, listSubjects) {
    state.listSubjects = listSubjects;
  },
  deleteSubject(state, listSubjects) {
    state.listSubjects = listSubjects;
  },

  // Students of subject
  getStudentsOfSubject(state, listStudents) {
    state.studentsOfSubject = listStudents;
  },
  deleteStudentOfSubject(state, listStudents) {
    state.studentsOfSubject = listStudents;
  },
  getClassesOfSubject(state, listClasses) {
    state.listClasses = listClasses;
  },
  // Teacher Manager
  getAllTeachers(state, listTeachers) {
    state.listTeachers = listTeachers;
  },
  createTeacher(state, listTeachers) {
    state.listTeachers = listTeachers;
  },
  deleteTeacher(state, listTeachers) {
    state.listTeachers = listTeachers;
  },

  //  Subjects of Teacher
  getSubjectsOfTeacher(state, listSubjects) {
    state.subjectsOfTeacher = listSubjects.subjects;
    state.subjectsNoTeacher = listSubjects.subjectsNoTeacher;
  },
  deleteSubjectOfTeacher(state, listStudents) {
    state.subjectsOfTeacher = listStudents;
  },
  addSubjectOfTeacher(state, listSubjects) {
    state.listSubjects = listSubjects;
  },
  getSubjectsNoTeacher(state, listSubjects) {
    state.subjectsNoTeacher = listSubjects;
  },

  // Students Manager
  getAllStudents(state, listStudents) {
    state.listStudents = listStudents;
  },

  // Subjects of student
  getSubjectsOfStudent(state, listSubjects) {
    state.subjectOfStudent = listSubjects;
  },

  // Student Subject Certificate
  getCertificatesOfSubject(state, studentsOfSubject) {
    state.studentsOfSubject = studentsOfSubject;
  },
  confirmCertificate(state, studentsOfSubject) {
    state.studentsOfSubject = studentsOfSubject;
  },
  getSubjectsOfCourse(state, listSubjects) {
    state.subjectsOfCourse = listSubjects;
  }
};

export const adminAcademy = {
  namespaced: true,
  state,
  actions,
  mutations
};
