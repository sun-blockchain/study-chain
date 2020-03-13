import { adminService } from '../_services/admin.service';
import { router } from '../router';

const state = {
  listCourses: [],
  listSubjects: [],
  listTeachers: [],
  listStudents: [],
  listClasses: [],
  studentsOfSubject: [],
  classesOfTeacher: [],
  subjectOfStudent: [],
  subjectsOfCourse: [],
  classesOfStudent: [],
  coursesOfStudent: [],
  summaryInfo: []
};

const actions = {
  async getSummaryInfo({ commit }) {
    try {
      let summaryInfo = await adminService.getSummaryInfo();
      commit('getSummaryInfo', summaryInfo);
      return summaryInfo;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async createClass({ commit, dispatch }, _class) {
    try {
      let data = await adminService.createClass(_class);
      commit('createClass', data.classes);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },
  async updateClass({ commit, dispatch }, _class) {
    try {
      let data = await adminService.updateClass(_class);

      commit('updateClass', data.classes);

      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
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
  async deleteClass({ commit, dispatch }, { classId }) {
    try {
      let data = await adminService.deleteClass(classId);
      commit('deleteClass', data.courses);
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
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
  async getStudentsOfClass({ commit }, classId) {
    try {
      let data = await adminService.getStudentsOfClass(classId);
      commit('getStudentsOfClass', data.students);
      return data;
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
  async createCourse({ commit, dispatch }, course) {
    try {
      let data = await adminService.createCourse(course);
      commit('createCourse', data.courses);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },
  async updateCourse({ commit, dispatch }, course) {
    try {
      let data = await adminService.updateCourse(course);
      commit('updateCourse', data.courses);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },
  async changeCourseStatus({ commit, dispatch }, { courseId, status }) {
    try {
      let data = await adminService.changeCourseStatus(courseId, status);
      commit('changeCourseStatus', data.courses);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },
  async getStudentsOfCourse({ commit }, courseId) {
    try {
      let data = await adminService.getStudentsOfCourse(courseId);

      commit('getStudentsOfCourse', data.students);
      return data.students;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  // get subject by id
  async getSubject({ commit, dispatch }, subjectId) {
    try {
      let data = await adminService.getSubject(subjectId);
      commit('getSubject', data.subject);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },
  // Subjects of Course

  async getSubjectsNoCourse({ commit, dispatch }, courseId) {
    try {
      let data = await adminService.getSubjectsNoCourse(courseId);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },

  async addSubjectToCourse({ commit, dispatch }, { courseId, subjectId }) {
    try {
      let data = await adminService.addSubjectToCourse(courseId, subjectId);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
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
  async getAllSubjects({ commit, dispatch }) {
    try {
      let listSubjects = await adminService.getAllSubjects();
      commit('getAllSubjects', listSubjects);
      return listSubjects;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },
  async createSubject({ commit, dispatch }, subject) {
    try {
      let data = await adminService.createSubject(subject);
      commit('createSubject', data.subjects);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },
  async updateSubject({ commit, dispatch }, subject) {
    try {
      let data = await adminService.updateSubject(subject);
      commit('updateSubject', data.subjects);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },
  async deleteSubject({ commit, dispatch }, subjectId) {
    try {
      let data = await adminService.deleteSubject(subjectId);
      commit('deleteSubject', data.subjects);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
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
  async getAllTeachers({ commit, dispatch }) {
    try {
      let listTeachers = await adminService.getAllTeachers();
      commit('getAllTeachers', listTeachers);
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
    }
  },

  async createTeacher({ dispatch, commit }, teacher) {
    try {
      let data = await adminService.createTeacher(teacher);
      commit('createTeacher', data.teachers);
      return data;
    } catch (error) {
      dispatch('alert/alertError', error, { root: true });
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
  async getClassesOfTeacher({ commit }, Username) {
    try {
      let data = await adminService.getClassesOfTeacher(Username);
      commit('getClassesOfTeacher', data.classes);
      return data.classes;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
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
  async addClassToTeacher({ commit }, { username, classId }) {
    try {
      let data = await adminService.addClassToTeacher(username, classId);
      commit('addClassToTeacher', data.classes);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  },
  async unassignTeacherFromClass({ commit }, classId) {
    try {
      let data = await adminService.unassignTeacherFromClass(classId);
      commit('unassignTeacherFromClass', data);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  },
  async getClassesNoTeacher() {
    try {
      let data = await adminService.getClassesNoTeacher();
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
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
  },
  async getStudent({ commit }, username) {
    try {
      let data = await adminService.getStudent(username);

      commit('getStudent', data.student);
      return data.student;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getTeacher({ commit }, username) {
    try {
      let data = await adminService.getTeacher(username);
      commit('getTeacher', data.teacher);
      return data.teacher;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async getClassesOfStudent({ commit }, Username) {
    try {
      let data = await adminService.getClassesOfStudent(Username);
      commit('getClassesOfStudent', data.classes);
      return data.classes;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  },
  async getCoursesOfStudent({ commit }, Username) {
    try {
      let data = await adminService.getCoursesOfStudent(Username);
      commit('getCoursesOfStudent', data.courses);
      return data.courses;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  }
};

const mutations = {
  getSummaryInfo(state, summaryInfo) {
    state.summaryInfo = summaryInfo;
  },
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
  changeCourseStatus(state, listCourses) {
    state.listCourses = listCourses;
  },
  getStudentsOfCourse(state, listStudents) {
    state.listStudents = listStudents;
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
  getClassesOfTeacher(state, classes) {
    state.classesOfTeacher = classes;
  },
  deleteSubjectOfTeacher(state, listStudents) {
    state.classesOfTeacher = listStudents;
  },
  addClassToTeacher(state, classes) {
    state.classesOfTeacher = classes;
  },
  unassignTeacherFromClass(state, classes) {
    state.classesOfTeacher = classes;
  },
  // Students Manager
  getAllStudents(state, listStudents) {
    state.listStudents = listStudents;
  },

  getClassesOfStudent(state, classes) {
    state.classesOfStudent = classes;
  },
  getCoursesOfStudent(state, courses) {
    state.coursesOfStudent = courses;
  },
  confirmCertificate(state, studentsOfSubject) {
    state.studentsOfSubject = studentsOfSubject;
  },
  getSubjectsOfCourse(state, listSubjects) {
    state.subjectsOfCourse = listSubjects;
  },
  getStudent(state, listStudents) {
    state.listStudents = listStudents;
  },
  getTeacher(state, listTeachers) {
    state.listTeachers = listTeachers;
  }
};

export const adminAcademy = {
  namespaced: true,
  state,
  actions,
  mutations
};
