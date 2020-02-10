import { authHeader } from '../_helpers/auth-header.js';
import axios from 'axios';

export const studentService = {
  getAllSubjects,
  registerSubject,
  getMySubjects,
  getMyCertificates
};

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
async function registerSubject(subjectId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/account/me/registersubject`,
      { subjectId: subjectId },
      {
        headers: authHeader()
      }
    );
    return respone.data.subjects;
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
