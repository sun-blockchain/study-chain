import { authHeader } from '../_helpers/auth-header.js';
import axios from 'axios';

export const teacherService = {
  getClassesOfTeacher,
  updateScore
};

async function getClassesOfTeacher() {
  let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/me/classes`, {
    headers: authHeader()
  });
  return respone.data;
}

async function updateScore(classId, score, username) {
  let respone = await axios.put(
    `${process.env.VUE_APP_API_BACKEND}/classes/${classId}/${username}/score`,
    {
      scoreValue: score
    },
    {
      headers: authHeader()
    }
  );
  return respone.data;
}
