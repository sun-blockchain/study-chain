process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const network = require('../fabric/network');
const app = require('../app');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const User = require('../models/User');

require('dotenv').config();

describe('#PUT /academy/course', () => {
  let connect;
  let query;
  let updateCourseInfo;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    updateCourseInfo = sinon.stub(network, 'updateCourseInfo');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    updateCourseInfo.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .put('/academy/course')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .put('/academy/course')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('success edit course', (done) => {
    let data = JSON.stringify(
      {
        CourseID: '123-456-789',
        CourseName: 'Blockchain101',
        CourseCode: 'BC101',
        Description: 'Blockchain'
      },
      {
        CourseID: '123-456-783',
        CourseName: 'Blockchain102',
        CourseCode: 'BC102',
        Description: 'Blockchain'
      }
    );

    updateCourseInfo.returns({
      success: true,
      msg: 'Edit success!'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put('/academy/course')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '123-456-789',
        courseCode: 'BC101',
        courseName: 'Blockchain 101',
        shortDescription: 'Blockchain',
        description: 'Blockchain for beginer'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success edit course because req.body invalid', (done) => {
    request(app)
      .put('/academy/course')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '',
        courseCode: 'BC101',
        courseName: 'Blockchain 101',
        description: 'Blockchain'
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('edit course info fail when call editCouseInfo function', (done) => {
    updateCourseInfo.returns({
      success: false,
      msg: 'Error chaincode'
    });

    request(app)
      .put('/academy/course')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '123-456-789',
        courseCode: 'BC101',
        courseName: 'Blockchain 101',
        shortDescription: 'Blockchain',
        description: 'Blockchain for beginer'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('#POST /academy/course', () => {
  let connect;
  let query;
  let createCourse;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    createCourse = sinon.stub(network, 'createCourse');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    createCourse.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .post('/academy/course')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .post('/academy/course')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('success create courses', (done) => {
    let data = JSON.stringify(
      {
        CourseID: '123-456-789',
        CourseName: 'Blockchain101',
        CourseCode: 'BC101',
        Description: 'Blockchain'
      },
      {
        CourseID: '123-456-783',
        CourseName: 'Blockchain102',
        CourseCode: 'BC102',
        Description: 'Blockchain'
      }
    );

    createCourse.returns({
      success: true,
      msg: 'Create success!'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/academy/course')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseCode: 'BC101',
        courseName: 'Blockchain 101',
        shortDescription: 'Blockchain',
        description: 'Full course blockchain'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success create course because req.body invalid', (done) => {
    request(app)
      .post('/academy/course')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseCode: '',
        courseName: 'Blockchain 101',
        description: 'Blockchain'
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('create course fail when call createCourse function', (done) => {
    createCourse.returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/academy/course')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseCode: 'BC101',
        courseName: 'Blockchain 101',
        shortDescription: 'Blockchain',
        description: 'Blockchain 101 for beginer'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('#POST /academy/deleteCourse', () => {
  let connect;
  let query;
  let deleteCourse;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    deleteCourse = sinon.stub(network, 'deleteCourse');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    deleteCourse.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .post('/academy/deleteCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .post('/academy/deleteCourse')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('success delete courses', (done) => {
    let data = JSON.stringify(
      {
        CourseID: '123-456-789',
        CourseName: 'Blockchain101',
        CourseCode: 'BC101',
        Description: 'Blockchain'
      },
      {
        CourseID: '123-456-783',
        CourseName: 'Blockchain102',
        CourseCode: 'BC102',
        Description: 'Blockchain'
      }
    );

    deleteCourse.returns({
      success: true,
      msg: 'Delete success!'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/academy/deleteCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '132-456-987'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success create course because req.body invalid', (done) => {
    request(app)
      .post('/academy/deleteCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('create course fail when call deleteCourse function', (done) => {
    deleteCourse.returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/academy/deleteCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '132-456-987'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('#POST /academy/coursesOfStudent', () => {
  let queryCourses;
  let connect;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    queryCourses = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    queryCourses.restore();
  });

  it('permission denied', (done) => {
    request(app)
      .post('/academy/coursesOfStudent')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: 'conglt'
      })
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed because req.body is invalid', (done) => {
    request(app)
      .post('/academy/coursesOfStudent')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .post('/academy/coursesOfStudent')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'conglt'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('failed to query classes of student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      error: 'Error Network'
    });

    queryCourses.returns({
      success: false,
      msg: data
    });

    request(app)
      .post('/academy/coursesOfStudent')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'conglt'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('success query classes of user student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify([
      {
        CourseID: '1234-456-789-123a',
        CourseCode: 'ETH101',
        ShortDescription: 'Ethereum',
        Description: 'Ethereum101'
      }
    ]);

    queryCourses.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/academy/coursesOfStudent')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'conglt'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('#POST /academy/:subjectId/class', () => {
  let connect;
  let query;
  let createClass;
  let subjectId = 'sj';
  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    createClass = sinon.stub(network, 'createClass');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    createClass.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .post(`/academy/subject/${subjectId}/class`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .post(`/academy/subject/${subjectId}/class`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('success create class', (done) => {
    let data = JSON.stringify(
      {
        classCode: 'CACLC2',
        room: 'Blockchain101',
        time: '12122020'
      },
      {
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020'
      }
    );

    createClass.returns({
      success: true,
      msg: 'Create success!'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post(`/academy/subject/${subjectId}/class`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '24-02-2020',
        endDate: '29-02-2020',
        repeat: 'Weekly Monday',
        capacity: 77
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success create class because req.body invalid', (done) => {
    request(app)
      .post(`/academy/subject/${subjectId}/class`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: '',
        room: 'Blockchain101',
        time: '12122020'
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('create class fail when call createClass function', (done) => {
    createClass.returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post(`/academy/subject/${subjectId}/class`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '24-02-2020',
        endDate: '29-02-2020',
        repeat: 'Weekly Monday',
        capacity: 67
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});
describe('#PUT /class', () => {
  let connect;
  let query;
  let updateClassInfo;
  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    updateClassInfo = sinon.stub(network, 'updateClassInfo');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    updateClassInfo.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .put(`/academy/class`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .put(`/academy/class`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('success edit class', (done) => {
    let data = JSON.stringify({
      classId: '123-123',
      classCode: 'CACLC2',
      room: 'Blockchain101',
      time: '12122020',
      startDate: '24-02-2020',
      endDate: '29-02-2020',
      repeat: 'Weekly Monday',
      subjectId: '123-456-a12b-1231`',
      capacity: 112
    });

    updateClassInfo.returns({
      success: true,
      msg: 'Edit success!'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put(`/academy/class`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123-123',
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '24-02-2020',
        endDate: '29-02-2020',
        repeat: 'Weekly Monday',
        subjectId: '123-456-a12b-1231',
        capacity: 112
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success edit class because req.body invalid', (done) => {
    request(app)
      .put(`/academy/class`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123-123',
        classCode: '',
        room: 'Blockchain101',
        time: '12122020',
        subjectId: 'sj',
        capacity: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('edit course info fail when call editClassInfo function', (done) => {
    updateClassInfo.returns({
      success: false,
      msg: 'Error chaincode'
    });

    request(app)
      .put(`/academy/class`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123-123',
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '24-02-2020',
        endDate: '29-02-2020',
        repeat: 'Weekly Monday',
        subjectId: 'sj',
        capacity: 100
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('#POST /academy/subject', () => {
  let connect;
  let createSubjectStub;
  let query;
  let findOneStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    createSubjectStub = sinon.stub(network, 'createSubject');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    createSubjectStub.restore();
    query.restore();
  });

  it('do not create success subject with empty req.body', (done) => {
    request(app)
      .post('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: '',
        subjectCode: '',
        shortDescription: '',
        description: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not create success subject with empty subjectName', (done) => {
    request(app)
      .post('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: '',
        subjectCode: 'bc001',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not create success subject with empty subjectCode', (done) => {
    request(app)
      .post('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: 'php',
        subjectCode: '',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not create success subject with empty shortDescription', (done) => {
    request(app)
      .post('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: 'php',
        subjectCode: '123',
        shortDescription: '',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not create success subject with empty description', (done) => {
    request(app)
      .post('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: 'php',
        subjectCode: '123',
        shortDescription: 'lorem',
        description: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not create success subject with admin student', (done) => {
    request(app)
      .post('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: 'blockchain',
        subjectCode: 'bc001',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not create success subject with teacher', (done) => {
    request(app)
      .post('/academy/subject')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subjectName: 'blockchain',
        subjectCode: 'bc001',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not create success subject with student', (done) => {
    request(app)
      .post('/academy/subject')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subjectName: 'blockchain',
        subjectCode: 'bc001',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not create success subject with admin academy - error chaincode', (done) => {
    createSubjectStub.returns({
      success: false,
      msg: 'error'
    });

    request(app)
      .post('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectName: 'blockchain',
        subjectCode: 'bc001',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('error');
        done();
      });
  });

  it('create success subject with admin academy', (done) => {
    let data = JSON.stringify(
      {
        SubjectID: '00',
        SubjectCode: 'bc001',
        SubjectName: 'Blockchain',
        ShortDescription: 'lorem01',
        Description: 'lorem01...'
      },
      {
        SubjectID: '01',
        SubjectCode: 'etc002',
        SubjectName: 'ETC',
        ShortDescription: 'lorem02',
        Description: 'lorem02...'
      }
    );

    createSubjectStub.returns({
      success: true,
      msg: 'created'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectName: 'blockchain02',
        subjectCode: 'bc002',
        shortDescription: 'lorem3',
        description: 'lorem3...'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('#POST /academy/addSubjectToCourse', () => {
  let connect;
  let query;
  let addSubjectToCourse;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    addSubjectToCourse = sinon.stub(network, 'addSubjectToCourse');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    addSubjectToCourse.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .post('/academy/addSubjectToCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .post('/academy/addSubjectToCourse')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('Add subject to course failed because req.body invalid', (done) => {
    request(app)
      .post('/academy/addSubjectToCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '',
        subjectId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('Invoke chaincode failed', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    addSubjectToCourse.returns({
      success: false,
      msg: 'Error chaincode'
    });

    request(app)
      .post('/academy/addSubjectToCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: 'e4b5316d-cb22-4e6f-acfd-6ea0feb5478f',
        subjectId: 'baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('#POST /academy/removeSubjectFromCourse', () => {
  let connect;
  let query;
  let removeSubjectFromCourse;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    removeSubjectFromCourse = sinon.stub(network, 'removeSubjectFromCourse');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    removeSubjectFromCourse.restore();
  });

  it('Permission denied when access routes with student', (done) => {
    request(app)
      .post('/academy/removeSubjectFromCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('Permission denied when access routes with teacher', (done) => {
    request(app)
      .post('/academy/removeSubjectFromCourse')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('Remove subject from course failed because req.body invalid', (done) => {
    request(app)
      .post('/academy/removeSubjectFromCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '',
        subjectId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('Can not query chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: false
    });

    request(app)
      .post('/academy/removeSubjectFromCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: 'e4b5316d-cb22-4e6f-acfd-6ea0feb5478f',
        subjectId: 'baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('Subject does not present in course', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      CourseID: 'e4b5316d-cb22-4e6f-acfd-6ea0feb5478f',
      Subjects: []
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/academy/removeSubjectFromCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: 'e4b5316d-cb22-4e6f-acfd-6ea0feb5478f',
        subjectId: 'baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef'
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('This subject does not present in course!');
        done();
      });
  });

  it('Invoke chaincode failed', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      CourseID: 'e4b5316d-cb22-4e6f-acfd-6ea0feb5478f',
      Subjects: ['baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef']
    });

    query.returns({
      success: true,
      msg: data
    });

    removeSubjectFromCourse.returns({
      success: false,
      msg: 'Can not remove this subject from course!'
    });

    request(app)
      .post('/academy/removeSubjectFromCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: 'e4b5316d-cb22-4e6f-acfd-6ea0feb5478f',
        subjectId: 'baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('This subject has been removed from chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      CourseID: 'e4b5316d-cb22-4e6f-acfd-6ea0feb5478f',
      Subjects: ['baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef']
    });

    query.returns({
      success: true,
      msg: data
    });

    removeSubjectFromCourse.returns({
      success: true,
      msg: 'This subject has been removed from course!'
    });

    request(app)
      .post('/academy/removeSubjectFromCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: 'e4b5316d-cb22-4e6f-acfd-6ea0feb5478f',
        subjectId: 'baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('This subject has been removed from course!');
        done();
      });
  });
});

describe('#GET /academy/subjectNoCourse/:courseId', () => {
  let connect;
  let query;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('do not get success subjects with role admin student', (done) => {
    request(app)
      .get('/academy/subjectNoCourse/:courseId')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not get success subjects with role teacher', (done) => {
    request(app)
      .get('/academy/subjectNoCourse/:courseId')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not get success subjects with role student', (done) => {
    request(app)
      .get('/academy/subjectNoCourse/:courseId')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Can not connect to network', (done) => {
    connect.returns(null);
    request(app)
      .get('/academy/subjectNoCourse/:courseId')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('error query chaincode detail course', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.onFirstCall().returns({ success: false });
    query.onSecondCall().returns({ success: true });

    request(app)
      .get('/academy/subjectNoCourse/:courseId')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Query chaincode failed');
        done();
      });
  });

  it('error query chaincode all subjects', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.onFirstCall().returns({ success: true });
    query.onSecondCall().returns({ success: false });

    request(app)
      .get('/academy/subjectNoCourse/:courseId')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Query chaincode failed');
        done();
      });
  });

  it('get success ', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let course = JSON.stringify({
      CourseID: '12312124123421',
      Subjects: []
    });

    let subjects = JSON.stringify([
      {
        SubjectID: '1321321'
      },
      { SubjectID: '163654654654' }
    ]);

    query.onFirstCall().returns({ success: true, msg: course });
    query.onSecondCall().returns({ success: true, msg: subjects });

    request(app)
      .get('/academy/subjectNoCourse/12312124123421')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({})
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.subjects.length).equal(2);
        done();
      });
  });
});

describe('#PUT /academy/subject', () => {
  let connect;
  let updateSubjectStub;
  let query;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    updateSubjectStub = sinon.stub(network, 'updateSubjectInfo');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    updateSubjectStub.restore();
    query.restore();
  });

  it('do not update success subject with empty req.body', (done) => {
    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectId: '',
          subjectName: '',
          subjectCode: '',
          shortDescription: '',
          description: ''
        }
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not update success subject with empty subjectId', (done) => {
    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectId: '',
          subjectName: 'php',
          subjectCode: 'bc001',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not update success subject with empty subjectName', (done) => {
    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectId: '00',
          subjectName: '',
          subjectCode: 'bc001',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not update success subject with empty subjectCode', (done) => {
    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectId: '00',
          subjectName: 'php',
          subjectCode: '',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not update success subject with empty shortDescription', (done) => {
    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectId: '00',
          subjectName: 'php',
          subjectCode: '123',
          shortDescription: '',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not update success subject with empty description', (done) => {
    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectId: '00',
          subjectName: 'php',
          subjectCode: '123',
          shortDescription: 'lorem',
          description: ''
        }
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not update success subject with admin student', (done) => {
    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectId: '00',
          subjectName: 'blockchain',
          subjectCode: 'bc001',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not update success subject with teacher', (done) => {
    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subject: {
          subjectId: '00',
          subjectName: 'blockchain',
          subjectCode: 'bc001',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not update success subject with student', (done) => {
    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectId: '00',
          subjectName: 'blockchain',
          subjectCode: 'bc001',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('No changes', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      SubjectID: 'a98f2f4e-6ef9-492b-96a6-c6f01364fecb',
      SubjectName: 'abcc',
      SubjectCode: 'abc',
      ShortDescription: 'abc',
      Description: 'abc'
    });

    query.returns({
      success: true,
      msg: data
    });

    updateSubjectStub.returns({
      success: false,
      msg: 'error'
    });

    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subject: {
          subjectId: 'a98f2f4e-6ef9-492b-96a6-c6f01364fecb',
          subjectName: 'abcc',
          subjectCode: 'abc',
          shortDescription: 'abc',
          description: 'abc'
        }
      })
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('No changes!');
        done();
      });
  });

  it('error chain code', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      SubjectID: 'a98f2f4e-6ef9-492b-96a6-c6f01364fecb',
      SubjectName: 'abc',
      SubjectCode: 'abc',
      ShortDescription: 'abc',
      Description: 'abc'
    });

    query.returns({
      success: true,
      msg: data
    });

    updateSubjectStub.returns({
      success: false,
      msg: 'error'
    });

    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subject: {
          subjectId: 'a98f2f4e-6ef9-492b-96a6-c6f01364fecb',
          subjectName: 'abcc',
          subjectCode: 'abc',
          shortDescription: 'abc',
          description: 'abc'
        }
      })
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('error');
        done();
      });
  });

  it('update success subject with admin academy', (done) => {
    let data = JSON.stringify({
      SubjectID: 'a98f2f4e-6ef9-492b-96a6-c6f01364fecb',
      SubjectCode: 'abc',
      SubjectName: 'abc',
      ShortDescription: 'abc',
      Description: 'abc...'
    });

    updateSubjectStub.returns({
      success: true,
      msg: 'updated'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subject: {
          subjectId: 'a98f2f4e-6ef9-492b-96a6-c6f01364fecb',
          subjectName: 'abcc',
          subjectCode: 'abc',
          shortDescription: 'abc',
          description: 'abc'
        }
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('#DELETE /academy/subject', () => {
  let connect;
  let deleteSubjectStub;
  let query;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    deleteSubjectStub = sinon.stub(network, 'deleteSubject');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    deleteSubjectStub.restore();
    query.restore();
  });

  it('do not delete success subject with empty req.body', (done) => {
    request(app)
      .delete('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({})
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not delete success subject with empty subjectId', (done) => {
    request(app)
      .delete('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not delete success subject with admin student', (done) => {
    request(app)
      .delete('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectId: '00'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not delete success subject with teacher', (done) => {
    request(app)
      .delete('/academy/subject')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subjectId: '00'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not delete success subject with student', (done) => {
    request(app)
      .delete('/academy/subject')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subjectId: '00'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('cannot be deleted!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    deleteSubjectStub.returns({
      success: false,
      msg: 'Can not delete subject - a98f2f4e-6ef9-492b-96a6-c6f01364fecb'
    });

    request(app)
      .delete('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: 'a98f2f4e-6ef9-492b-96a6-c6f01364fecb'
      })
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not delete subject - a98f2f4e-6ef9-492b-96a6-c6f01364fecb');
        done();
      });
  });

  it('error chain code', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    deleteSubjectStub.returns({
      success: false,
      msg: 'error'
    });

    request(app)
      .delete('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: 'a98f2f4e-6ef9-492b-96a6-c6f01364fecb'
      })
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('error');
        done();
      });
  });

  it('delete success subject with admin academy', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    deleteSubjectStub.returns({
      success: true,
      msg: 'deleted!'
    });

    let data = JSON.stringify({
      SubjectID: 'a98f2f4e-6ef9-492b-96a6-c6f01364fecb',
      SubjectName: 'abcc',
      SubjectCode: 'abc',
      ShortDescription: 'abc',
      Description: 'abc'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .delete('/academy/subject')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: 'a98f2f4e-6ef9-492b-96a6-c6f01364fecb'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('#PUT /academy/closeRegisterClass', () => {
  let connect;
  let query;
  let closeRegisterClass;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    closeRegisterClass = sinon.stub(network, 'closeRegisterClass');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    closeRegisterClass.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .put('/academy/closeRegisterClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .put('/academy/closeRegisterClass')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not success close register because req.body invalid', (done) => {
    request(app)
      .put('/academy/closeRegisterClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('Can not connect to network', (done) => {
    connect.returns(null);

    request(app)
      .put('/academy/closeRegisterClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: 'b2ab2fbd-1053-4848-aac9-2090fee54074'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });
    query.returns({
      success: false,
      msg: 'Can not query in chaincode!'
    });
    request(app)
      .put('/academy/closeRegisterClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: 'b2ab2fbd-1053-4848-aac9-2090fee54074'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query in chaincode!');
        done();
      });
  });

  it('Can not close register because class status != Open', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });
    let data = JSON.stringify({
      ClassId: 'b2ab2fbd-1053-4848-aac9-2090fee54074',
      Status: 'Close Register'
    });
    query.returns({
      success: true,
      msg: data
    });
    request(app)
      .put('/academy/closeRegisterClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: 'b2ab2fbd-1053-4848-aac9-2090fee54074'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not close register!');
        done();
      });
  });

  it('Invoke chaincode failed', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassId: 'b2ab2fbd-1053-4848-aac9-2090fee54074',
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    closeRegisterClass.returns({
      success: false,
      msg: 'Invoke failed'
    });

    request(app)
      .put('/academy/closeRegisterClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: 'b2ab2fbd-1053-4848-aac9-2090fee54074'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Invoke failed');
        done();
      });
  });

  it('Close Successfully', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassId: 'b2ab2fbd-1053-4848-aac9-2090fee54074',
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    closeRegisterClass.returns({
      success: true
    });

    request(app)
      .put('/academy/closeRegisterClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: 'b2ab2fbd-1053-4848-aac9-2090fee54074'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Close Successfully!');
        done();
      });
  });
});

describe('#POST /academy/deleteClass', () => {
  let connect;
  let deleteClass;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    deleteClass = sinon.stub(network, 'deleteClass');
  });

  afterEach(() => {
    connect.restore();
    deleteClass.restore();
  });

  it('Permission denied when access routes with student', (done) => {
    request(app)
      .post('/academy/deleteClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('delete subject successfully', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    deleteClass.returns({
      success: true,
      msg: 'Successfully Removed!'
    });

    request(app)
      .post('/academy/deleteClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '12e9easa-0e3e-40f0-ac30-94827b0c013a'
      })
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('delete subject failed because req.body is invalid', (done) => {
    request(app)
      .post('/academy/deleteClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('delete subject failed because chaincode error', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    deleteClass.returns({
      success: false,
      msg: 'Failed Removed!'
    });
    request(app)
      .post('/academy/deleteClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '12e9easa-0e3e-40f0-ac30-94827b0c013a'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});

// ------------------------------------------------------ Teacher Manager --------------------------------------------------------
// create teacher
describe('#POST /academy/teacher', () => {
  let findOneStub;
  let query;
  let registerTeacherStub;
  let connect;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    findOneStub = sinon.stub(User, 'findOne');
    query = sinon.stub(network, 'query');
    registerTeacherStub = sinon.stub(network, 'registerTeacherOnBlockchain');
  });

  afterEach(() => {
    connect.restore();
    findOneStub.restore();
    query.restore();
    registerTeacherStub.restore();
  });

  it('should fail because the username already exists.', (done) => {
    findOneStub.returns({
      username: 'thienthangaycanh',
      fullname: 'Tan Trinh'
    });

    request(app)
      .post('/academy/teacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(409);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Teacher already exists');

        done();
      });
  });

  it('do not success query all teacher with admin student', (done) => {
    findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
    request(app)
      .post('/academy/teacher')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not success becuse req.body empty', (done) => {
    findOneStub.returns(null);
    connect.returns({ error: null });

    registerTeacherStub.returns({
      success: true,
      msg: 'Register success!'
    });

    let data = JSON.stringify({ username: 'tantv' }, { username: 'nghianv' });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/academy/teacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: '',
        fullname: 'Do Duc Hoang'
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('success query teacher with admin academy', (done) => {
    findOneStub.returns(null);
    connect.returns({ error: null });

    registerTeacherStub.returns({
      success: true,
      msg: 'Register success!'
    });

    let data = JSON.stringify({ username: 'tantv' }, { username: 'nghianv' });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/academy/teacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'hoangdd',
        fullname: 'Do Duc Hoang'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success query teacher with teacher', (done) => {
    request(app)
      .post('/academy/teacher')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not success query teacher with student', (done) => {
    request(app)
      .post('/academy/teacher')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('error when query teacher username', (done) => {
    findOneStub.throws();
    connect.returns({ error: null });
    request(app)
      .post('/academy/teacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Internal Server Error');
        done();
      });
  });

  it('teacher username is exist', (done) => {
    findOneStub.returns({ username: 'thienthangaycanhh', role: USER_ROLES.TEACHER });

    connect.returns({ error: null });

    request(app)
      .post('/academy/teacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(409);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Teacher already exists');
        done();
      });
  });

  it('error when call function registerTeacherOnBlockchain', (done) => {
    findOneStub.returns(null);

    connect.returns({ error: null });

    registerTeacherStub.returns({
      success: false,
      msg: 'err'
    });

    request(app)
      .post('/academy/teacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.status).equal(500);
        done();
      });
  });

  it('error when call function getAllTeacher', (done) => {
    findOneStub.returns(undefined, null);

    connect.returns({ error: null });

    registerTeacherStub.returns({
      success: true,
      msg: 'Register success!'
    });

    let data = JSON.stringify({ username: 'thienthangaycanh' }, { username: 'nghianv' });

    query.returns({
      success: false,
      msg: data
    });

    request(app)
      .post('/academy/teacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});
describe('#GET /academy/student/:username', () => {
  let connect;
  let query;
  let username = 'quangnt';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('Can not connect to network', (done) => {
    connect.returns(null);

    request(app)
      .get(`/academy/student/${username}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: false,
      msg: 'Can not query chaincode!'
    });

    request(app)
      .get(`/academy/student/${username}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });
  it('do not success query teacher with student', (done) => {
    request(app)
      .get(`/academy/student/${username}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });
  it('success query student of class with admin', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      Username: 'abc',
      Fullname: 'abcdef',
      Info: {
        PhoneNumber: 0376724057,
        Email: 'abc@gmail.com',
        Address: 'HN',
        Sex: 'Male',
        Birthday: 22 / 03 / 1990,
        Avatar: 'https://images.com',
        Country: 'VN'
      },
      Courses: 'Blockchain',
      Classes: 'ClassA'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/academy/student/${username}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('#POST /academy/addClassToTeacher', () => {
  let connect;
  let query;
  let addClassToTeacher;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    addClassToTeacher = sinon.stub(network, 'addClassToTeacher');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    addClassToTeacher.restore();
  });

  it('param username empty', (done) => {
    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: '',
        classId: '0ce15c8c-29dc-4d6d-be80-f224dac994b8'
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('param classId empty', (done) => {
    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: 'teacher',
        classId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '0ce15c8c-29dc-4d6d-be80-f224dac994b8'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '0ce15c8c-29dc-4d6d-be80-f224dac994b8'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with admin student', (done) => {
    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '0ce15c8c-29dc-4d6d-be80-f224dac994b8'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('Can not connect to network', (done) => {
    connect.returns(null);
    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '0ce15c8c-29dc-4d6d-be80-f224dac994b8'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query classes by teacher - query 1', (done) => {
    query.onFirstCall().returns({ success: false, msg: "Can't query classes by teacher" });
    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '0ce15c8c-29dc-4d6d-be80-f224dac994b8'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('The class has been added!', (done) => {
    let data = [
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590cac68',
        ClassCode: 'Class01',
        Room: 'Room01',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      },
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590dfc98',
        ClassCode: 'Class02',
        Room: 'Room02',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      }
    ];

    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.onFirstCall().returns({ success: true, msg: JSON.stringify(data) });

    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '4ca7fc39-7523-424d-984e-87ea590cac68'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('The class has been added!');
        done();
      });
  });
  it('add class to teacher error!', (done) => {
    let data = [
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590cac68',
        ClassCode: 'Class01',
        Room: 'Room01',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      },
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590dfc98',
        ClassCode: 'Class02',
        Room: 'Room02',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      }
    ];

    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.onFirstCall().returns({ success: true, msg: JSON.stringify(data) });

    addClassToTeacher.returns({
      success: false,
      msg: 'add class to teacher error!'
    });

    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '4ca7fc39-7523-424d-984e-87ea590cac66'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('add class to teacher error!');
        done();
      });
  });

  it('Can not query classes by teacher - query 2', (done) => {
    let data = [
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590cac68',
        ClassCode: 'Class01',
        Room: 'Room01',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      },
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590dfc98',
        ClassCode: 'Class02',
        Room: 'Room02',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      }
    ];

    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.onFirstCall().returns({ success: true, msg: JSON.stringify(data) });

    addClassToTeacher.returns({
      success: true,
      msg: 'add class to teacher success!'
    });

    query.onFirstCall().returns({ success: false, msg: "Can't query classes by teacher" });

    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '4ca7fc39-7523-424d-984e-87ea590cac66'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal("Can't query classes by teacher");
        done();
      });
  });

  it('add class to teacher success!', (done) => {
    let data = [
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590cac68',
        ClassCode: 'Class01',
        Room: 'Room01',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      },
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590dfc98',
        ClassCode: 'Class02',
        Room: 'Room02',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      }
    ];

    let data1 = [
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590cac68',
        ClassCode: 'Class01',
        Room: 'Room01',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      },
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590dfc98',
        ClassCode: 'Class02',
        Room: 'Room02',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      },
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590cac66',
        ClassCode: 'Class03',
        Room: 'Room02',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      }
    ];

    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.onFirstCall().returns({ success: true, msg: JSON.stringify(data) });

    addClassToTeacher.returns({
      success: true,
      msg: 'add class to teacher success!'
    });

    query.onSecondCall().returns({ success: false, msg: JSON.stringify(data1) });

    request(app)
      .post('/academy/addClassToTeacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '4ca7fc39-7523-424d-984e-87ea590cac66'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('add class to teacher success!');
        expect(res.body.classes.length).equal(3);
        done();
      });
  });
});
describe('#GET /academy/teacher/:username', () => {
  let connect;
  let query;
  let username = 'quangnt';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('Can not connect to network', (done) => {
    connect.returns(null);

    request(app)
      .get(`/academy/teacher/${username}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: false,
      msg: 'Can not query chaincode!'
    });

    request(app)
      .get(`/academy/teacher/${username}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });
  it('do not success query teacher with student', (done) => {
    request(app)
      .get(`/academy/teacher/${username}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });
  it('success query teacher of class with admin', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify(
      {
        Username: 'abc',
        Fullname: 'abcdef',
        Info: {
          PhoneNumber: 0376724057,
          Email: 'abc@gmail.com',
          Address: 'HN',
          Sex: 'Male',
          Birthday: 22 / 03 / 1990,
          Avatar: 'https://images.com',
          Country: 'VN'
        },
        Classes: 'ClassA'
      },
      {
        Username: 'abc',
        Fullname: 'abcdef',
        Info: {
          PhoneNumber: 0376724057,
          Email: 'abc@gmail.com',
          Address: 'HN',
          Sex: 'Male',
          Birthday: 22 / 03 / 1990,
          Avatar: 'https://images.com',
          Country: 'VN'
        },
        Classes: 'ClassA'
      }
    );

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/academy/teacher/${username}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});
