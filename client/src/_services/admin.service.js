import { authHeader } from '../_helpers/auth-header.js';
import axios from 'axios';

export const adminService = {
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getStudentsOfSubject,
  getClassesOfSubject,
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
  getStudentsOfCourse,
  confirmCertificate
};

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
    return respone.data.course;
  } catch (error) {
    throw error;
  }
}

async function updateCourse(course) {
  try {
    let respone = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/academy/course`,
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
    return respone.data.courses;
  } catch (error) {
    throw error;
  }
}

async function deleteCourse(courseId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/academy/deleteCourse`,
      { courseId: courseId },
      {
        headers: authHeader()
      }
    );

    return respone.data.courses;
  } catch (error) {
    throw error;
  }
}

async function createCourse(course) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/academy/course`,
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
    return respone.data.courses;
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
    // let respone = await axios.get(
    //   `${process.env.VUE_APP_API_BACKEND}/account/teacher/${username}/subjects`,
    //   {
    //     headers: authHeader()
    //   }
    // );
    // return respone.data;
    return {
      success: true,
      classes: [
        {
          ClassCode: 'ClassA',
          ClassName: 'Hyperledger',
          Description: 'abc'
        },
        {
          listClasses: 'ClassB',
          ClassName: 'a',
          Description: 'xyz'
        }
      ]
    };
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
    // let respone = await axios.get(
    //   `${process.env.VUE_APP_API_BACKEND}/account/teacher/${username}/subjects`,
    //   {
    //     headers: authHeader()
    //   }
    // );
    // return respone.data;
    return {
      success: true,
      subjects: [
        {
          SubjectID: '61e3b1bb-77a7-4830-bbd2-23b35fcc24eb',
          Name: 'Hyperledger',
          TeacherUsername: 'Teacher01',
          Students: ['st01']
        },
        {
          SubjectID: '65640531-cc2f-4967-9b30-c548c7190c2e',
          Name: 'a',
          TeacherUsername: 'Teacher01',
          Students: null
        }
      ],
      subjectsNoTeacher: []
    };
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
    // let respone = await axios.get(
    //   `${process.env.VUE_APP_API_BACKEND}/account/student/${username}/subjects`,
    //   {
    //     headers: authHeader()
    //   }
    // );
    // return respone.data.subjects;
    return [
      {
        SubjectID: '61e3b1bb-77a7-4830-bbd2-23b35fcc24eb',
        Name: 'Hyperledger',
        TeacherUsername: 'Teacher01',
        Students: ['st01']
      },
      {
        SubjectID: '65640531-cc2f-4967-9b30-c548c7190c2e',
        Name: 'a',
        TeacherUsername: 'Teacher01',
        Students: null
      }
    ];
  } catch (error) {
    throw error;
  }
}

// Student Subject Certificate
async function getCertificatesOfSubject(subjectId) {
  // let respone = await axios.get(
  //   `${process.env.VUE_APP_API_BACKEND}/subject/${subjectId}/certificates`,
  //   {
  //     headers: authHeader()
  //   }
  // );
  // return respone.data;
  return {
    success: true,
    students: [
      {
        Username: 'st00',
        Fullname: 'student00',
        Subjects: null,
        statusCertificate: 0,
        ScoreValue: 10
      },
      {
        Username: 'st01',
        Fullname: 'student01',
        Subjects: null,
        statusCertificate: 1,
        ScoreValue: 10
      },
      {
        Username: 'st02',
        Fullname: 'student02',
        Subjects: null,
        statusCertificate: 2,
        ScoreValue: 10
      }
    ]
  };
}
async function getStudentsOfCourse() {
  try {
    // let respone = await axios.get(
    //   `${process.env.VUE_APP_API_BACKEND}/account/student/${username}/subjects`,
    //   {
    //     headers: authHeader()
    //   }
    // );
    // return respone.data.subjects;
    return [
      {
        StudentCode: '61e3b1bb-77a7-4830-bbd2-23b35fcc24eb',
        StudentName: 'Le Van A',
        Class: 'Spring 01'
      },
      {
        StudentCode: '61e3b1bb-77a7-4830-bbd2-23b35fcc24eb',
        StudentName: 'Le Van A',
        Class: 'Spring 01'
      }
    ];
  } catch (error) {
    throw error;
  }
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
