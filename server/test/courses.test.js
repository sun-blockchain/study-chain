process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const app = require('../app');

describe('#GET /courses/:username/students', () => {
  let query;
  let connect;
  let username = 'quangnt';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('Permission denied with student', (done) => {
    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Failed to query all students of course in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: false,
      msg: 'Query students failed'
    });

    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Success query students of course with role admin academy', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify([
      {
        Username: 'messi',
        Fullname: 'lionel messi'
      },
      {
        Username: 'ronaldo',
        Fullname: 'cristiano ronaldo'
      }
    ]);

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Success query students of course with role teacher', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'teacher01', role: USER_ROLES.TEACHER }
    });

    let data = JSON.stringify([
      {
        Username: 'messi',
        Fullname: 'lionel messi'
      },
      {
        Username: 'ronaldo',
        Fullname: 'cristiano ronaldo'
      }
    ]);

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Response from chaincode is null', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: true,
      msg: null
    });

    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('POST /courses/enroll', () => {
  let connect;
  let query;
  let studentRegisterCourse;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    studentRegisterCourse = sinon.stub(network, 'studentRegisterCourse');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    studentRegisterCourse.restore();
  });

  it('Validate body fail!', (done) => {
    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Permission Denied!', (done) => {
    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Failed to connect to blockchain', (done) => {
    connect.returns(null);
    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('Can not query chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    query.returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('You studied this course!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      CourseID: '123456',
      Students: ['hoangdd']
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('This course was closed!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      CourseID: '123456',
      Students: null,
      Status: 'Closed'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Can not invoke chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });
    let data = JSON.stringify({
      CourseID: '123456',
      Students: null,
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    studentRegisterCourse.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Register Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      CourseID: '123456',
      Students: null,
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    studentRegisterCourse.returns({
      success: true
    });

    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(201);
        done();
      });
  });
});

describe('#PUT /courses/:courseId', () => {
  let connect;
  let query;
  let updateCourseInfo;
  let courseId = '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000';

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
      .put(`/courses/${courseId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .put(`/courses/${courseId}`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
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
      .put(`/courses/${courseId}`)
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
        done();
      });
  });

  it('do not success edit course because req.body invalid', (done) => {
    request(app)
      .put(`/courses/${courseId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '',
        courseCode: 'BC101',
        courseName: 'Blockchain 101',
        description: 'Blockchain'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('edit course info fail when call editCouseInfo function', (done) => {
    updateCourseInfo.returns({
      success: false,
      msg: 'Error chaincode'
    });

    request(app)
      .put(`/courses/${courseId}`)
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
        done();
      });
  });
});

describe('#POST /courses', () => {
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
      .post('/courses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .post('/courses')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
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
      .post('/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseCode: 'BC101',
        courseName: 'Blockchain 101',
        shortDescription: 'Blockchain',
        description: 'Full course blockchain'
      })
      .then((res) => {
        expect(res.status).equal(201);
        done();
      });
  });

  it('do not success create course because req.body invalid', (done) => {
    request(app)
      .post('/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseCode: '',
        courseName: 'Blockchain 101',
        description: 'Blockchain'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('create course fail when call createCourse function', (done) => {
    createCourse.returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseCode: 'BC101',
        courseName: 'Blockchain 101',
        shortDescription: 'Blockchain',
        description: 'Blockchain 101 for beginer'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});

describe('#PUT /courses/:courseId/status', () => {
  let connect;
  let query;
  let openCourse;
  let closeCourse;
  let courseId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    openCourse = sinon.stub(network, 'openCourse');
    closeCourse = sinon.stub(network, 'closeCourse');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    openCourse.restore();
    closeCourse.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .put(`/courses/${courseId}/status`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .put(`/courses/${courseId}/status`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Failed connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .put(`/courses/${courseId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        status: 'Open'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Can not query chaincode!', (done) => {
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
      .put(`/courses/${courseId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        status: 'Open'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Close course is opening successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      CourseID: '123456',
      Status: 'Closed'
    });

    query.returns({
      success: true,
      msg: data
    });

    openCourse.returns({
      success: true
    });

    request(app)
      .put(`/courses/${courseId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        status: 'Open'
      })
      .then((res) => {
        expect(res.status).equal(200);

        done();
      });
  });

  it('Open course is closing successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      CourseID: '123456',
      Status: 'Closed'
    });

    query.returns({
      success: true,
      msg: data
    });

    openCourse.returns({
      success: true
    });

    request(app)
      .put(`/courses/${courseId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        status: 'Open'
      })
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Can not invoke chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      CourseID: '123456',
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    closeCourse.returns({
      success: false
    });

    request(app)
      .put(`/courses/${courseId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        status: 'Closed'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});

describe('#POST /courses/:courseId/subjects', () => {
  let connect;
  let query;
  let addSubjectToCourse;
  let courseId = '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000';

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
      .post(`/courses/${courseId}/subjects`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .post(`/courses/${courseId}/subjects`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Add subject to course failed because req.body invalid', (done) => {
    request(app)
      .post(`/courses/${courseId}/subjects`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Failed connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .post(`/courses/${courseId}/subjects`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: 'subject01'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Can not query chaincode!', (done) => {
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
      .post(`/courses/${courseId}/subjects`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: 'subject01'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('This course was closed!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let course = JSON.stringify({
      CourseID: 'course01',
      Status: 'Closed'
    });

    query.returns({
      success: true,
      msg: course
    });

    request(app)
      .post(`/courses/${courseId}/subjects`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: 'subject01'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('This subject already presents in course!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let course = JSON.stringify({
      CourseID: 'course01',
      Status: 'Open',
      Subjects: ['subject01']
    });

    query.returns({
      success: true,
      msg: course
    });

    request(app)
      .post(`/courses/${courseId}/subjects`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: 'subject01'
      })
      .then((res) => {
        expect(res.status).equal(409);
        done();
      });
  });

  it('Can not invoke chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let course = JSON.stringify({
      CourseID: 'course01',
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: course
    });

    addSubjectToCourse.returns({
      success: false
    });

    request(app)
      .post(`/courses/${courseId}/subjects`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: 'subject01'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Add Sucessfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let course = JSON.stringify({
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: course
    });

    addSubjectToCourse.returns({
      success: true
    });

    request(app)
      .post(`/courses/${courseId}/subjects`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: 'subject01'
      })
      .then((res) => {
        expect(res.status).equal(201);
        done();
      });
  });
});

describe('#DELETE /courses/:courseId/subjects/:subjectId', () => {
  let connect;
  let query;
  let removeSubjectFromCourse;
  let courseId = '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000';
  let subjectId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';

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
      .delete(`/courses/${courseId}/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Permission denied when access routes with teacher', (done) => {
    request(app)
      .delete(`/courses/${courseId}/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Failed connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .delete(`/courses/${courseId}/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Can not query chaincode!', (done) => {
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
      .delete(`/courses/${courseId}/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('This subject does not present in course!', (done) => {
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
      .delete(`/courses/${courseId}/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Can not invoke chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      CourseID: courseId,
      Subjects: ['baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef', subjectId]
    });

    query.returns({
      success: true,
      msg: data
    });

    removeSubjectFromCourse.returns({
      success: false
    });

    request(app)
      .delete(`/courses/${courseId}/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('This subject has been removed from course!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      CourseID: courseId,
      Subjects: ['baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef', subjectId]
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
      .delete(`/courses/${courseId}/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#GET /courses/:courseId/subjects/not-in', () => {
  let connect;
  let query;
  let courseId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';

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
      .get(`/courses/${courseId}/subjects/not-in`)
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('do not get success subjects with role teacher', (done) => {
    request(app)
      .get(`/courses/${courseId}/subjects/not-in`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('do not get success subjects with role student', (done) => {
    request(app)
      .get(`/courses/${courseId}/subjects/not-in`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Can not connect to network', (done) => {
    connect.returns(null);
    request(app)
      .get(`/courses/${courseId}/subjects/not-in`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(500);
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
      .get(`/courses/${courseId}/subjects/not-in`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(404);
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
      .get(`/courses/${courseId}/subjects/not-in`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '1'
      })
      .then((res) => {
        expect(res.status).equal(404);
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
      CourseID: courseId,
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
      .get(`/courses/${courseId}/subjects/not-in`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({})
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#GET /courses', () => {
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

  it('success query all courses', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

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
      .get('/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('do not success query all courses because error query chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: false,
      msg: 'Error query chaincode'
    });

    request(app)
      .get('/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Failed to connect blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});

describe('#GET /courses/:courseId', () => {
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

  it('Failed to connect blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get(`/courses/${courseId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('success query course', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

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
      .get(`/courses/${courseId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('do not success query course because error query chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: false,
      msg: 'Error query chaincode'
    });

    request(app)
      .get(`/courses/${courseId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });
});
