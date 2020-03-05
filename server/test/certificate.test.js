process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const Cert = require('../models/Certificate');
const sinon = require('sinon');
const network = require('../fabric/network');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const User = require('../models/User');
const app = require('../app');

require('dotenv').config();

describe('#POST /certificate ', () => {
  let connect;
  let query;
  let createCertificate;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    createCertificate = sinon.stub(network, 'createCertificate');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    createCertificate.restore();
  });

  it('Invalid body!', (done) => {
    request(app)
      .post('/certificate')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        courseId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('Permission Denined!', (done) => {
    request(app)
      .post('/certificate')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied!');
        done();
      });
  });

  it('Permission Denined!', (done) => {
    request(app)
      .post('/certificate')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied!');
        done();
      });
  });

  it('Failed connect to blockchain!', (done) => {
    connect.returns(null);

    request(app)
      .post('/certificate')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not get certificates of student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.returns({
      success: false
    });

    request(app)
      .post('/certificate')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('Certificate already exists!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let certificates = JSON.stringify([
      {
        CourseID: '123456',
        StudentUsername: 'hoangdd'
      },
      {
        CourseID: '123457',
        StudentUsername: 'hoangdd'
      }
    ]);

    query.returns({
      success: true,
      msg: certificates
    });
    request(app)
      .post('/certificate')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Certificate already exists!');
        done();
      });
  });

  it('Cannot get student!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let certificates = JSON.stringify([
      {
        CourseID: '123457',
        StudentUsername: 'hoangdd'
      },
      {
        CourseID: '123458',
        StudentUsername: 'hoangdd'
      }
    ]);

    query.onFirstCall().returns({
      success: true,
      msg: certificates
    });

    query.onSecondCall().returns({
      success: false
    });

    request(app)
      .post('/certificate')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('You have not studied this course yet!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let certificates = JSON.stringify([
      {
        CourseID: '123457',
        StudentUsername: 'hoangdd'
      },
      {
        CourseID: '123458',
        StudentUsername: 'hoangdd'
      }
    ]);

    query.onFirstCall().returns({
      success: true,
      msg: certificates
    });

    let studentInfo = JSON.stringify({
      Username: 'hoangdd',
      Courses: []
    });

    query.onSecondCall().returns({
      success: true,
      msg: studentInfo
    });

    request(app)
      .post('/certificate')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('You have not studied this course yet!');
        done();
      });
  });

  it('Can not invoke chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let certificates = JSON.stringify([
      {
        CourseID: '123457',
        StudentUsername: 'hoangdd'
      },
      {
        CourseID: '123458',
        StudentUsername: 'hoangdd'
      }
    ]);

    query.onFirstCall().returns({
      success: true,
      msg: certificates
    });

    let studentInfo = JSON.stringify({
      Username: 'hoangdd',
      Courses: ['123456']
    });

    query.onSecondCall().returns({
      success: true,
      msg: studentInfo
    });

    createCertificate.returns({
      success: false
    });

    request(app)
      .post('/certificate')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not invoke chaincode!');
        done();
      });
  });

  it('Create certificate successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let certificates = JSON.stringify([
      {
        CourseID: '123457',
        StudentUsername: 'hoangdd'
      },
      {
        CourseID: '123458',
        StudentUsername: 'hoangdd'
      }
    ]);

    query.onFirstCall().returns({
      success: true,
      msg: certificates
    });

    let studentInfo = JSON.stringify({
      Username: 'hoangdd',
      Courses: ['123456']
    });

    query.onSecondCall().returns({
      success: true,
      msg: studentInfo
    });

    createCertificate.returns({
      success: true
    });

    request(app)
      .post('/certificate')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Create certificate successfully!');
        done();
      });
  });
});

describe('# GET /certificate/all ', () => {
  let findOneUserStub;
  let findOneCertStub;

  beforeEach(() => {
    findOneUserStub = sinon.stub(User, 'findOne');
    findOneCertStub = sinon.stub(Cert, 'find');
  });

  afterEach(() => {
    findOneUserStub.restore();
    findOneCertStub.restore();
  });

  it('success query all certificate', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });

    findOneCertStub.yields(
      undefined,
      {
        certificateID: '5d9ac9e4fc93231bc694cb4c',
        SubjectID: 'Blockchain',
        username: 'hoangdd',
        issueDate: 'Mon Oct 07 2019 00:07:17 GMT+0700 (Indochina Time)'
      },
      {
        certificateID: '5d9ac9e4fc9323134fdcb4c',
        SubjectID: 'Web',
        username: 'hoangdd',
        issueDate: 'Mon Oct 07 2019 10:07:17 GMT+0700 (Indochina Time)'
      }
    );

    request(app)
      .get(`/certificate/all`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success query teacher with admin student', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
    request(app)
      .get(`/certificate/all`)
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not success query teacher with teacher', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
    request(app)
      .get(`/certificate/all`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not success query teacher with student', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
    request(app)
      .get(`/certificate/all`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('error query all certificates', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
    findOneCertStub.yields({ error: 'failed query cert' }, null);
    request(app)
      .get(`/certificate/all`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('certificates is not exists', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
    findOneCertStub.yields(undefined, null);
    request(app)
      .get(`/certificate/all`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('do not have certificate');
        done();
      });
  });
});

describe('# GET /certificate/:certId ', () => {
  let certId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';
  let courseId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
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

  it('should get data success', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT }
    });

    let cert = JSON.stringify([
      {
        CertificateID: certId,
        CourseID: courseId,
        StudentUsername: 'tantrinh',
        IssueDate: '01-01-2020'
      }
    ]);

    let student = JSON.stringify({
      Username: 'hoangdd',
      Fullname: 'Do Hoang'
    });

    let course = JSON.stringify({
      CourseName: 'Blockchain',
      CourseCode: 'BC101'
    });

    query.onFirstCall().returns({
      success: true,
      msg: cert
    });

    query.onSecondCall().returns({
      success: true,
      msg: student
    });

    query.onThirdCall().returns({
      success: true,
      msg: course
    });

    request(app)
      .get(`/certificate/${certId}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Failed to connect blockchain', (done) => {
    connect.returns(null);
    request(app)
      .get(`/certificate/${certId}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Error chaincode when query certificate', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT }
    });

    query.onFirstCall().returns({
      success: false,
      msg: 'error'
    });
    request(app)
      .get(`/certificate/${certId}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Error chaincode when query student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT }
    });

    let cert = JSON.stringify([
      {
        CertificateID: certId,
        CourseID: courseId,
        StudentUsername: 'tantrinh',
        IssueDate: '01-01-2020'
      }
    ]);

    query.onFirstCall().returns({
      success: true,
      msg: cert
    });

    query.onSecondCall().returns({
      success: false,
      msg: 'error'
    });

    request(app)
      .get(`/certificate/${certId}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Error chaincode when query course', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT }
    });

    let cert = JSON.stringify([
      {
        CertificateID: certId,
        CourseID: courseId,
        StudentUsername: 'tantrinh',
        IssueDate: '01-01-2020'
      }
    ]);

    let student = JSON.stringify({
      Username: 'hoangdd',
      Fullname: 'Do Hoang'
    });

    query.onFirstCall().returns({
      success: true,
      msg: cert
    });

    query.onSecondCall().returns({
      success: true,
      msg: student
    });

    query.onThirdCall().returns({
      success: false,
      msg: 'error'
    });

    request(app)
      .get(`/certificate/${certId}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});
