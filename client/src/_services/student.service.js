import { authHeader } from '../_helpers/auth-header.js';
import axios from 'axios';

export const studentService = {
  getAllSubjects,
  registerCourse,
  getMySubjects,
  getMyCertificates,
  getCourse,
  getAllCourses,
  getSubjectsOfCourse,
  getClassesOfSubject,
  getSubject,
  getMyClasses,
  registerClass,
  getMyCourses,
  getNotRegisterCourses,
  cancelRegisteredClass,
  getSummaryInfo,
  getCertificate,
  claimCertificate,
  getCertificateByCourseId
};

async function getSummaryInfo() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/account/me/summary`, {
      headers: authHeader()
    });
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function getAllCourses() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/common/courses`, {
      headers: authHeader()
    });
    return respone.data.courses;
  } catch (error) {
    throw error;
  }
}

async function getCourse(courseId) {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/common/course/${courseId}`, {
      headers: authHeader()
    });
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function getNotRegisterCourses() {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/account/me/notRegisterCourses`,
      {
        headers: authHeader()
      }
    );
    return respone.data.courses;
  } catch (error) {
    throw error;
  }
}

async function cancelRegisteredClass(classId, courseId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/account/me/cancelRegisteredClass`,
      { classId: classId, courseId: courseId },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function getSubject(subjectId) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/account/me/subject/${subjectId}`,
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function getSubjectsOfCourse(courseId) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/account/me/scores/${courseId}`,
      {
        headers: authHeader()
      }
    );
    return respone.data;
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

async function getAllSubjects() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/account/me/subjects`, {
      headers: authHeader()
    });
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}

async function getMyClasses() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/account/me/classes`, {
      headers: authHeader()
    });
    return respone.data.classes;
  } catch (error) {
    throw error;
  }
}

async function getMyCourses() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/account/me/courses`, {
      headers: authHeader()
    });
    return respone.data.courses;
  } catch (error) {
    throw error;
  }
}

async function registerCourse(courseId) {
  try {
    let response = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/account/me/registerCourse`,
      { courseId: courseId },
      {
        headers: authHeader()
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function registerClass(classId, courseId) {
  try {
    let response = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/account/me/registerClass`,
      { classId: classId, courseId: courseId },
      {
        headers: authHeader()
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getMySubjects() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/account/me/mysubjects`, {
      headers: authHeader()
    });
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}

async function getMyCertificates() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/account/me/certificates`, {
      headers: authHeader()
    });
    return respone.data.certificates;
  } catch (error) {
    throw error;
  }
}

async function claimCertificate(courseId) {
  try {
    let response = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/certificates`,
      { courseId: courseId },
      {
        headers: authHeader()
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getCertificate(certId) {
  try {
    let response = await axios.get(`${process.env.VUE_APP_API_BACKEND}/certificates/${certId}`);
    return response.data.cert;
  } catch (error) {
    throw error;
  }
}

async function getCertificateByCourseId(courseId) {
  try {
    let response = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/account/me/certificate/${courseId}`,
      {
        headers: authHeader()
      }
    );
    return response.data.certificateId;
  } catch (error) {
    throw error;
  }
}
