process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const network = require('../fabric/network');
const app = require('../app');
const USER_ROLES = require('../configs/constant').USER_ROLES;

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

describe('#POST /academy/class', () => {
  let connect;
  let query;
  let createClass;

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
      .post('/academy/class')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .post('/academy/class')
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
        time: '12122020',
        shortDescription: 'short',
        description: 'Blockchain'
      },
      {
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        shortDescription: 'short',
        description: 'long'
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
      .post('/academy/class')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        shortDescription: 'short',
        description: 'long'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success create class because req.body invalid', (done) => {
    request(app)
      .post('/academy/class')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: '',
        room: 'Blockchain101',
        time: '12122020',
        shortDescription: 'short',
        description: 'long'
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
      .post('/academy/class')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        shortDescription: 'short',
        description: 'long'
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

  it('Query Chaincode Successfully', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    addSubjectToCourse.returns({
      success: true,
      msg: 'Subject was added successfully'
    });

    let data = JSON.stringify({
      CourseID: 'e4b5316d-cb22-4e6f-acfd-6ea0feb5478f',
      Subjects: ['baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef']
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/academy/addSubjectToCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: 'e4b5316d-cb22-4e6f-acfd-6ea0feb5478f',
        subjectId: 'baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.course.Subjects[0]).equal('baa7df8c-8aa1-4ce0-9a26-6439ab11b8ef');
        done();
      });
  });
});
