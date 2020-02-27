import { authHeader } from '../_helpers/auth-header.js';
import axios from 'axios';

export const teacherService = {
  getClassesOfTeacher,
  getStudentsOfSubject,
  setScoreForStudent
};

async function getClassesOfTeacher() {
  let respone = await axios.get(
    `${process.env.VUE_APP_API_BACKEND}/account/teacher/classesOfTeacher`,
    {
      headers: authHeader()
    }
  );
  return respone.data;
}

async function getStudentsOfSubject(subjectId) {
  let respone = await axios.get(
    `${process.env.VUE_APP_API_BACKEND}/account/me/${subjectId}/students`,
    {
      headers: authHeader()
    }
  );
  return respone.data;
}

async function setScoreForStudent(subjectId, username, score) {
  let respone = await axios.post(
    `${process.env.VUE_APP_API_BACKEND}/account/me/createscore`,
    {
      subjectId: subjectId,
      studentUsername: username,
      scoreValue: score
    },
    {
      headers: authHeader()
    }
  );
  return respone.data;
}
