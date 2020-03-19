import { authHeader } from '../_helpers/auth-header.js';
import axios from 'axios';

export const adminService = {
  createClass,
  updateClass,
  getClass,
  deleteClass,
  closeClass,
  getStudentsOfClass,
  getCourse,
  createCourse,
  updateCourse,
  changeCourseStatus,
  getAllCourses,
  getStudentsOfCourse,
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getStudentsOfSubject,
  getClassesOfSubject,
  deleteStudentOfSubject,
  getAllTeachers,
  getSubject,
  getClassesOfTeacher,
  addClassToTeacher,
  createTeacher,
  getClassesNoTeacher,
  getAllStudents,
  getSubjectsNoCourse,
  addSubjectToCourse,
  deleteSubjectFromCourse,
  getStudent,
  getTeacher,
  getClassesOfStudent,
  getCoursesOfStudent,
  unassignTeacherFromClass,
  getSummaryInfo
};

async function getSummaryInfo() {
  try {
    let response = await axios.get(`${process.env.VUE_APP_API_BACKEND}/me/summary`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Courses Manager
async function getAllCourses() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/courses`, {
      headers: authHeader()
    });
    return respone.data.courses;
  } catch (error) {
    throw error;
  }
}

async function getCourse(courseId) {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/courses/${courseId}`, {
      headers: authHeader()
    });
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function updateCourse(course) {
  try {
    let respone = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/courses/${course.CourseID}`,
      {
        courseId: course.CourseID,
        courseCode: course.CourseCode,
        courseName: course.CourseName,
        shortDescription: course.ShortDescription,
        description: course.Description
      },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function changeCourseStatus(courseId, status) {
  try {
    let respone = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/courses/${courseId}/status`,
      { courseId: courseId },
      {
        headers: authHeader()
      }
    );

    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function createCourse(course) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/courses`,
      {
        courseCode: course.CourseCode,
        courseName: course.CourseName,
        shortDescription: course.ShortDescription,
        description: course.Description
      },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}
async function getStudentsOfCourse(courseId) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/courses/${courseId}/students`,
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}
// Subjects of Course

async function getSubjectsNoCourse(courseId) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/courses/${courseId}/subjects/not-in`,
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function addSubjectToCourse(courseId, subjectId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/courses/${courseId}/subjects`,
      {
        subjectId: subjectId
      },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function deleteSubjectFromCourse(courseId, subjectId) {
  try {
    let respone = await axios.delete(
      `${process.env.VUE_APP_API_BACKEND}/courses/${courseId}/subjects/${subjectId}`,
      {
        headers: authHeader()
      }
    );

    return respone.data;
  } catch (error) {
    throw error;
  }
}

// Subjects Manager
async function getAllSubjects() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/subject/all`, {
      headers: authHeader()
    });
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}

async function createSubject(subject) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/academy/subject`,
      {
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        shortDescription: subject.shortDescription,
        description: subject.description
      },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function updateSubject(subject) {
  try {
    let respone = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/academy/subject`,
      { subject: subject },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function deleteSubject(subjectId) {
  try {
    let respone = await axios.delete(`${process.env.VUE_APP_API_BACKEND}/academy/subject`, {
      headers: authHeader(),
      data: {
        subjectId: subjectId
      }
    });

    return respone.data;
  } catch (error) {
    throw error;
  }
}

//  Students of subject
async function getStudentsOfSubject(subjectId) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/subject/${subjectId}/students`,
      {
        headers: authHeader()
      }
    );
    return respone.data.students;
  } catch (error) {
    throw error;
  }
}

async function deleteStudentOfSubject(SubjectID, Username) {
  try {
    let respone = await axios.delete(
      `${process.env.VUE_APP_API_BACKEND}/subject/${SubjectID}/delete/${Username}`,
      {
        headers: authHeader()
      }
    );
    return respone.data.students;
  } catch (error) {
    throw error;
  }
}
async function getClassesOfSubject(subjectId) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/common/subject/${subjectId}/classes`,
      {
        headers: authHeader()
      }
    );
    return respone.data.class;
  } catch (error) {
    throw error;
  }
}
async function createClass(_class) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/academy/subject/${_class.SubjectId}/class`,
      {
        classCode: _class.ClassCode,
        room: _class.Room,
        time: _class.Time,
        startDate: _class.StartDate,
        endDate: _class.EndDate,
        repeat: _class.Repeat,
        capacity: _class.Capacity
      },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}
async function updateClass(_class) {
  try {
    let respone = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/academy/class`,
      {
        classId: _class.ClassID,
        classCode: _class.ClassCode,
        room: _class.Room,
        time: _class.Time,
        startDate: _class.StartDate,
        endDate: _class.EndDate,
        repeat: _class.Repeat,
        subjectId: _class.SubjectId,
        capacity: _class.Capacity
      },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}
async function closeClass(classId) {
  try {
    let respone = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/academy/startClass`,
      { classId: classId },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}
//get class by id
async function getClass(classId) {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/common/class/${classId}`, {
      headers: authHeader()
    });
    return respone.data.class;
  } catch (error) {
    throw error;
  }
}
async function deleteClass(classId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/academy/deleteClass`,
      { classId: classId },
      {
        headers: authHeader()
      }
    );

    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function getStudentsOfClass(classId) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/classes/${classId}/students`,
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

// -Teacher Manager
async function getAllTeachers() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/teachers`, {
      headers: authHeader()
    });
    return respone.data.teachers;
  } catch (error) {
    throw error;
  }
}

async function createTeacher(teacher) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/teachers`,
      { username: teacher.username, fullname: teacher.fullName },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

//  Classes of Teacher
async function getClassesOfTeacher(username) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/teachers/${username}/classes`,
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function addClassToTeacher(username, classId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/academy/assignTeacherToClass`,
      { username: username, classId: classId },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}
async function unassignTeacherFromClass(classId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/academy/unassignTeacherFromClass`,
      { classId: classId },
      {
        headers: authHeader()
      }
    );

    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function getClassesNoTeacher() {
  try {
    let respone = await axios({
      method: 'get',
      url: `${process.env.VUE_APP_API_BACKEND}/common/classesNoTeacher`,
      headers: authHeader()
    });
    return respone.data;
  } catch (error) {
    throw error;
  }
}

//  Students Manager
async function getAllStudents() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/students`, {
      headers: authHeader()
    });
    return respone.data.students;
  } catch (error) {
    throw error;
  }
}

async function getClassesOfStudent(username) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/students/${username}/classes`,
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}
async function getCoursesOfStudent(username) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/students/${username}/courses`,
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

// Get subject by id
async function getSubject(subjectId) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/common/subject/${subjectId}`,
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}
//get student
async function getStudent(username) {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/students/${username}`, {
      headers: authHeader()
    });
    return respone.data;
  } catch (error) {
    throw error;
  }
}
async function getTeacher(username) {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/teachers/${username}`, {
      headers: authHeader()
    });
    return respone.data;
  } catch (error) {
    throw error;
  }
}
