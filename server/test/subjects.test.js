process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const network = require('../fabric/network');
const app = require('../app');
const USER_ROLES = require('../configs/constant').USER_ROLES;

describe('#GET /subjects', () => {
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

  it('should return all subjects', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'conglt', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify(
      {
        SubjectID: '00',
        Name: 'Blockchain',
        TeacherUsername: 'GV00',
        Students: ['Tan', 'Nghia']
      },
      {
        SubjectID: '01',
        Name: 'Sawtooth',
        TeacherUsername: 'GV01',
        Students: ['Tan', 'Nghia', 'Quang']
      }
    );

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/subjects')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .expect(200)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('fail get all subjects because error call chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'conglt', role: USER_ROLES.STUDENT }
    });

    query.returns({
      success: false,
      msg: 'Query chaincode has failed'
    });

    request(app)
      .get('/subjects')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('fail to connect blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/subjects')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});

describe('#POST /subjects', () => {
  let connect;
  let createSubjectStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    createSubjectStub = sinon.stub(network, 'createSubject');
  });

  afterEach(() => {
    connect.restore();
    createSubjectStub.restore();
  });

  it('do not create success subject with empty req.body', (done) => {
    request(app)
      .post('/subjects')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: '',
        subjectCode: '',
        shortDescription: '',
        description: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not create success subject with empty subjectName', (done) => {
    request(app)
      .post('/subjects')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: '',
        subjectCode: 'bc001',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not create success subject with empty subjectCode', (done) => {
    request(app)
      .post('/subjects')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: 'php',
        subjectCode: '',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not create success subject with empty shortDescription', (done) => {
    request(app)
      .post('/subjects')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: 'php',
        subjectCode: '123',
        shortDescription: '',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not create success subject with empty description', (done) => {
    request(app)
      .post('/subjects')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectName: 'php',
        subjectCode: '123',
        shortDescription: 'lorem',
        description: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('permission denied with teacher', (done) => {
    request(app)
      .post('/subjects')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subjectName: 'blockchain',
        subjectCode: 'bc001',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('permission denied with student', (done) => {
    request(app)
      .post('/subjects')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subjectName: 'blockchain',
        subjectCode: 'bc001',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('failed to connect blockchain', (done) => {
    connect.returns(null);

    request(app)
      .post('/subjects')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectName: 'blockchain',
        subjectCode: 'bc001',
        shortDescription: 'lorem',
        description: 'lorem...'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('create success subject with admin academy', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

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

    request(app)
      .post('/subjects')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectName: 'blockchain02',
        subjectCode: 'bc002',
        shortDescription: 'lorem3',
        description: 'lorem3...'
      })
      .then((res) => {
        expect(res.status).equal(201);
        done();
      });
  });
});

describe('#PUT /subjects', () => {
  let connect;
  let updateSubjectStub;
  let query;
  let subjectId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';

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
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectName: '',
          subjectCode: '',
          shortDescription: '',
          description: ''
        }
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not update success subject with empty subjectName', (done) => {
    request(app)
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectName: '',
          subjectCode: 'bc001',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not update success subject with empty subjectCode', (done) => {
    request(app)
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectName: 'php',
          subjectCode: '',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not update success subject with empty shortDescription', (done) => {
    request(app)
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectName: 'php',
          subjectCode: '123',
          shortDescription: '',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not update success subject with empty description', (done) => {
    request(app)
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectName: 'php',
          subjectCode: '123',
          shortDescription: 'lorem',
          description: ''
        }
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not update success subject with student', (done) => {
    request(app)
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subject: {
          subjectName: 'blockchain',
          subjectCode: 'bc001',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not update success subject with teacher', (done) => {
    request(app)
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subject: {
          subjectName: 'blockchain',
          subjectCode: 'bc001',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('failed to connect blockchain', (done) => {
    connect.returns(null);
    request(app)
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subject: {
          subjectName: 'blockchain',
          subjectCode: 'bc001',
          shortDescription: 'lorem',
          description: 'lorem...'
        }
      })
      .then((res) => {
        expect(res.status).equal(500);
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
      SubjectID: subjectId,
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
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subject: {
          subjectName: 'abcc',
          subjectCode: 'abc',
          shortDescription: 'abc',
          description: 'abc'
        }
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('error update subjects in chain code', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      SubjectID: subjectId,
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
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subject: {
          subjectName: 'abcc',
          subjectCode: 'abc',
          shortDescription: 'abc',
          description: 'abc'
        }
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('update success subject with admin academy', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      SubjectID: subjectId,
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
      .put(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subject: {
          subjectId: subjectId,
          subjectName: 'abcc',
          subjectCode: 'abc',
          shortDescription: 'abc',
          description: 'abc'
        }
      })
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#DELETE /subjects/:subjectId', () => {
  let connect;
  let deleteSubjectStub;
  let query;
  let subjectId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';

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

  it('do not delete success subject with teacher', (done) => {
    request(app)
      .delete(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subjectId: '00'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not delete success subject with student', (done) => {
    request(app)
      .delete(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subjectId: '00'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .delete(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
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
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({ success: false });

    request(app)
      .delete(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Can not delete this subject now!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let subject = JSON.stringify({
      SubjectID: subjectId,
      Classes: ['class01']
    });

    query.returns({ success: true, msg: subject });

    request(app)
      .delete(`/subjects/${subjectId}`)
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

    let subject = JSON.stringify({
      SubjectID: subjectId,
      Classes: null
    });

    query.returns({ success: true, msg: subject });

    deleteSubjectStub.returns({ success: false });

    request(app)
      .delete(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Delete Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let subject = JSON.stringify({
      SubjectID: subjectId,
      Classes: null
    });

    query.returns({ success: true, msg: subject });

    deleteSubjectStub.returns({ success: true });

    request(app)
      .delete(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#DELETE /subjects/:subjectId/classes/:classId', () => {
  let connect;
  let query;
  let deleteClass;
  let subjectId = '75442486-0878-440c-9db1-a7006c25a39f';
  let classId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    deleteClass = sinon.stub(network, 'deleteClass');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    deleteClass.restore();
    query.restore();
  });

  it('Permission denied when access routes with student!', (done) => {
    request(app)
      .delete(`/subjects/${subjectId}/classes/${classId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Permission denied when access routes with teacher!', (done) => {
    request(app)
      .delete(`/subjects/${subjectId}/classes/${classId}`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Failed connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .delete(`/subjects/${subjectId}/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
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
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: false
    });

    request(app)
      .delete(`/subjects/${subjectId}/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Can delete this class now!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let classInfo = JSON.stringify({
      ClassID: classId,
      Status: 'Closed'
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .delete(`/subjects/${subjectId}/classes/${classId}`)
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

    let classInfo = JSON.stringify({
      ClassID: classId,
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    deleteClass.returns({
      success: false
    });

    request(app)
      .delete(`/subjects/${subjectId}/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
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

    let classInfo = JSON.stringify({
      ClassID: classId,
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    deleteClass.returns({
      success: true
    });

    request(app)
      .delete(`/subjects/${subjectId}/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.msg).equal('Delete Successfully');
        done();
      });
  });
});

describe('#GET /subjects/:subjectId', () => {
  let connect;
  let query;
  let subjectId = '75442486-0878-440c-9db1-a7006c25a39f';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('should return subject', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      SubjectID: subjectId,
      Name: 'Blockchain',
      TeacherUsername: 'GV00',
      Students: ['Tan', 'Nghia']
    });

    query.returns({
      success: true,
      msg: data
    });
    request(app)
      .get(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('fail query subject because call chaincode error ', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({ success: false, msg: 'err' });

    request(app)
      .get(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('fail to connect blockchain ', (done) => {
    connect.returns(null);

    request(app)
      .get(`/subjects/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});

describe('#GET /subjects/:subjectId/classes', () => {
  let connect;
  let query;
  let subjectId = '4ca7fc39-7523-424d-984e-87ea590cac68';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('success query classess of subject with admin', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      classCode: 'CACLC2',
      room: 'Blockchain101',
      time: '12122020',
      shortDescription: 'short',
      description: 'Blockchain'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/subjects/${subjectId}/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('success query classess of subject with student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'conglt', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      classCode: 'CACLC2',
      room: 'Blockchain101',
      time: '12122020',
      shortDescription: 'short',
      description: 'Blockchain'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/subjects/${subjectId}/classes`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('do not success query class because error query chaincode', (done) => {
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
      .get(`/subjects/${subjectId}/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('failed to connect blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get(`/subjects/${subjectId}/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});
