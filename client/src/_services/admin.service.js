import { authHeader } from '../_helpers/auth-header.js';
import axios from 'axios';

export const adminService = {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getStudentsOfSubject,
  deleteStudentOfSubject,
  getAllTeachers,
  deleteTeacher,
  getSubjectsOfTeacher,
  deleteSubjectOfTeacher,
  addSubjectOfTeacher,
  createTeacher,
  getSubjectsNoTeacher,
  getAllStudents,
  getSubjectsOfStudent,
  getCertificatesOfSubject,
  confirmCertificate
};

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
      `${process.env.VUE_APP_API_BACKEND}/subject/create`,
      { subjectname: subject.Name },
      {
        headers: authHeader()
      }
    );
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}

async function updateSubject(subject) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/subject/update`,
      { subject: subject },
      {
        headers: authHeader()
      }
    );
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}

async function deleteSubject(subject) {
  try {
    let respone = await axios.delete(`${process.env.VUE_APP_API_BACKEND}/subject/delete`, {
      headers: authHeader(),
      data: {
        subject: subject
      }
    });

    return respone.data.subjects;
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

async function deleteStudentOfSubject(subjectId, Username) {
  try {
    let respone = await axios.delete(
      `${process.env.VUE_APP_API_BACKEND}/subject/${subjectId}/delete/${Username}`,
      {
        headers: authHeader()
      }
    );
    return respone.data.students;
  } catch (error) {
    throw error;
  }
}

// -Teacher Manager
async function getAllTeachers() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/account/teacher/all`, {
      headers: authHeader()
    });
    return respone.data.teachers;
  } catch (error) {
    throw error;
  }
}

async function createTeacher(teacher) {
  let respone = await axios.post(
    `${process.env.VUE_APP_API_BACKEND}/account/teacher/create`,
    { username: teacher.Username, fullname: teacher.Fullname },
    {
      headers: authHeader()
    }
  );
  return respone.data;
}

async function deleteTeacher(teacher) {
  try {
    let respone = await axios.delete(`${process.env.VUE_APP_API_BACKEND}/teacher/delete`, {
      headers: authHeader(),
      data: {
        teacher
      }
    });
    return respone.data.teachers;
  } catch (error) {
    throw error;
  }
}

//  Subjects of Teacher
async function getSubjectsOfTeacher(username) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/account/teacher/${username}/subjects`,
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function deleteSubjectOfTeacher(Username, subjectId) {
  try {
    let respone = await axios.delete(
      `${process.env.VUE_APP_API_BACKEND}/account/teacher/${Username}/delete/${subjectId}`,
      {
        headers: authHeader()
      }
    );
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}

async function addSubjectOfTeacher(username, subjectId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/subject/addsubjectforteacher`,
      { teacherusername: username, subjectId: subjectId },
      {
        headers: authHeader()
      }
    );
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}

async function getSubjectsNoTeacher() {
  try {
    let respone = await axios({
      method: 'get',
      url: `${process.env.VUE_APP_API_BACKEND}/subject/subjecjtsnoteacher`,
      headers: authHeader()
    });
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}

//  Students Manager
async function getAllStudents() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/account/student/all`, {
      headers: authHeader()
    });
    return respone.data.students;
  } catch (error) {
    throw error;
  }
}

// Subjects of student
async function getSubjectsOfStudent(username) {
  try {
    let respone = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/account/student/${username}/subjects`,
      {
        headers: authHeader()
      }
    );
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}

// Student Subject Certificate
async function getCertificatesOfSubject(subjectId) {
  let respone = await axios.get(
    `${process.env.VUE_APP_API_BACKEND}/subject/${subjectId}/certificates`,
    {
      headers: authHeader()
    }
  );
  return respone.data;
}

async function confirmCertificate(studentUsername, subjectId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/certificate/create`,
      { studentUsername: studentUsername, subjectId: subjectId },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}
