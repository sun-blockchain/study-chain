import { authHeader } from '../_helpers/auth-header.js';
import axios from 'axios';

export const studentService = {
  registerCourse,
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
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/me/summary`, {
      headers: authHeader()
    });
    return respone.data;
  } catch (error) {
    throw error;
  }
}

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

async function getNotRegisterCourses() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/me/courses/not-enroll`, {
      headers: authHeader()
    });
    return respone.data.courses;
  } catch (error) {
    throw error;
  }
}

async function cancelRegisteredClass(classId, courseId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/classes/unenroll`,
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
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/me/subjects/${subjectId}`, {
      headers: authHeader()
    });
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function getSubjectsOfCourse(courseId) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/me/courses/${courseId}/scores`,
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

async function getMyClasses() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/me/classes`, {
      headers: authHeader()
    });
    return respone.data.classes;
  } catch (error) {
    throw error;
  }
}

async function getMyCourses() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/me/courses`, {
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
      `${process.env.VUE_APP_API_BACKEND}/courses/enroll`,
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
      `${process.env.VUE_APP_API_BACKEND}/classes/enroll`,
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

async function getMyCertificates() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/me/certificates`, {
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
      `${process.env.VUE_APP_API_BACKEND}/me/courses/${courseId}/certificate`,
      {
        headers: authHeader()
      }
    );
    return response.data.certificateId;
  } catch (error) {
    throw error;
  }
}
