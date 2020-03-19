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
  getClassesOfSubject,
  getAllTeachers,
  getSubject,
  getClassesOfTeacher,
  changeTeacherOfClass,
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
      { status },
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
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/subjects`, {
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
      `${process.env.VUE_APP_API_BACKEND}/subjects`,
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
      `${process.env.VUE_APP_API_BACKEND}/subjects/${subject.subjectId}`,
      { subject },
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
    let respone = await axios.delete(`${process.env.VUE_APP_API_BACKEND}/subjects/${subjectId}`, {
      headers: authHeader()
    });

    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function getClassesOfSubject(subjectId) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/subjects/${subjectId}/classes`,
      {
        headers: authHeader()
      }
    );
    return respone.data.class;
  } catch (error) {
    throw error;
  }
}

async function createClass(classInfo) {
  try {
    let response = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/classes`,
      {
        subjectId: classInfo.SubjectId,
        classCode: classInfo.ClassCode,
        room: classInfo.Room,
        time: classInfo.Time,
        startDate: classInfo.StartDate,
        endDate: classInfo.EndDate,
        repeat: classInfo.Repeat,
        capacity: classInfo.Capacity
      },
      {
        headers: authHeader()
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
}

async function updateClass(classInfo) {
  try {
    let response = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/classes/${classInfo.ClassID}`,
      {
        classCode: classInfo.ClassCode,
        room: classInfo.Room,
        time: classInfo.Time,
        startDate: classInfo.StartDate,
        endDate: classInfo.EndDate,
        repeat: classInfo.Repeat,
        subjectId: classInfo.SubjectId,
        capacity: classInfo.Capacity
      },
      {
        headers: authHeader()
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
}
async function closeClass(classId) {
  try {
    let response = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/classes/${classId}/status`,
      {},
      {
        headers: authHeader()
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
}
//get class by id
async function getClass(classId) {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/classes/${classId}`, {
      headers: authHeader()
    });
    return respone.data.class;
  } catch (error) {
    throw error;
  }
}

async function deleteClass(subjectId, classId) {
  try {
    let response = await axios.delete(
      `${process.env.VUE_APP_API_BACKEND}/subjects/${subjectId}/classes/${classId}`,
      {
        headers: authHeader()
      }
    );

    return response;
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

async function changeTeacherOfClass(username, classId) {
  try {
    let respone = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/classes/${classId}/teacher`,
      { username: username },
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
    let response = await axios.get(`${process.env.VUE_APP_API_BACKEND}/classes/no-teacher`, {
      headers: authHeader()
    });
    return response.data;
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
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/subjects/${subjectId}`, {
      headers: authHeader()
    });
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
