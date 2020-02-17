process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const network = require('../fabric/network');
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const app = require('../app');

require('dotenv').config();

describe('#GET /academy/courses', () => {
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

  it('permission denied when access routes with student', (done) => {
    request(app)
      .get('/academy/courses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .get('/academy/courses')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('success query all courses', (done) => {
    let data = JSON.stringify(
      {
        CourseID: '00',
        CourseName: 'Blockchain101',
        CourseCode: 'BC101',
        Description: 'Blockchain'
      },
      {
        CourseID: '01',
        CourseName: 'Blockchain102',
        CourseCode: 'BC102',
        Description: 'Blockchain'
      }
    );

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/academy/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success query all courses because error query chaincode', (done) => {
    query.returns({
      success: false,
      msg: 'Error query chaincode'
    });

    request(app)
      .get('/academy/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('#GET /academy/course/:courseId', () => {
  let connect;
  let query;
  let courseId = '4ca7fc39-7523-424d-984e-87ea590cac68';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .get(`/academy/course/${courseId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .get(`/academy/course/${courseId}`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('success query all courses', (done) => {
    let data = JSON.stringify({
      CourseID: '4ca7fc39-7523-424d-984e-87ea590cac68',
      CourseName: 'Blockchain101',
      CourseCode: 'BC101',
      Description: 'Blockchain'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/academy/course/${courseId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success query all courses because error query chaincode', (done) => {
    query.returns({
      success: false,
      msg: 'Error query chaincode'
    });

    request(app)
      .get(`/academy/course/${courseId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

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
