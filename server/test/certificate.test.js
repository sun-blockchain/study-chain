process.env.NODE_DEV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const Cert = require('../models/Certificate');
const sinon = require('sinon');
const network = require('../fabric/network');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const User = require('../models/User');
const app = require('../app');

require('dotenv').config();

describe('Route : /certificate', () => {
  describe('# GET /certificate/create ', () => {
    let connect;
    let query;
    let findOneStub;

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      query = sinon.stub(network, 'query');
      findOneStub = sinon.stub(User, 'findOne');
    });

    afterEach(() => {
      connect.restore();
      query.restore();
      findOneStub.restore();
    });

    it('do not success with admin student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
      request(app)
        .get('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('success get routes', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      request(app)
        .get('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.hello).equal('new teacher');
          done();
        });
    });

    it('do not success with teacher', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
      request(app)
        .get('/certificate/create')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success with student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
      request(app)
        .get('/certificate/create')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });
  });

  describe('#POST /certificate/create ', () => {
    let connect;
    let query;
    let findOneStub;
    let createCertStub;

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      query = sinon.stub(network, 'query');
      findOneStub = sinon.stub(User, 'findOne');
      createCertStub = sinon.stub(network, 'createCertificate');
    });

    afterEach(() => {
      connect.restore();
      query.restore();
      findOneStub.restore();
      createCertStub.restore();
    });

    it('do not success create certificate with admin student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .send({
          subjectId: '7',
          studentUsername: 'tantrinh'
        })
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success create certificate with teacher', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .send({
          subjectId: '7',
          studentUsername: 'tantrinh'
        })
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success create certificate with student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .send({
          subjectId: '7',
          studentUsername: 'tantrinh'
        })
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not succes create certificate with req.body.subjectId is null', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          subjectId: '',
          studentUsername: 'tantrinh'
        })
        .then((res) => {
          expect(res.status).equal(422);
          done();
        });
    });

    it('do not succes create certificate with req.body.studentUsername is null', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          subjectId: '7',
          studentUsername: ''
        })
        .then((res) => {
          expect(res.status).equal(422);
          done();
        });
    });

    it('do not succes create certificate with req.body.studentUsername and req.body.subjectId is null', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          subjectId: '',
          studentUsername: ''
        })
        .then((res) => {
          expect(res.status).equal(422);
          done();
        });
    });

    it('do not succes create certificate because createCertificate error', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      createCertStub.returns({
        success: false,
        msg: 'Failed to register!'
      });

      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          subjectId: '7',
          studentUsername: 'tantrinh'
        })
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Failed to register!');
          done();
        });
    });

    it('do not succes create certificate because GetCertificatesBySubject error', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      createCertStub.returns({
        success: true,
        msg: 'create success!'
      });

      let certBySubject = JSON.stringify([{}]);
      let scoreBySubject = JSON.stringify([{ scoreValue: 8.0, studentUsername: 'tantrinh' }]);
      let studentBySubject = JSON.stringify([{ username: 'tantrinh' }]);

      query.onFirstCall().returns({ success: false, msg: certBySubject });
      query.onSecondCall().returns({ success: true, msg: scoreBySubject });
      query.onThirdCall().returns({ success: true, msg: studentBySubject });

      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          subjectId: '7',
          studentUsername: 'tantrinh'
        })
        .then((res) => {
          expect(res.body.success).equal(false);
          done();
        });
    });

    it('do not succes create certificate because GetScoresBySubject error', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      createCertStub.returns({
        success: true,
        msg: 'create success!'
      });

      let certBySubject = JSON.stringify([{ certId: '1', studentUsername: 'tantrinh' }]);
      let scoreBySubject = JSON.stringify([{}]);
      let studentBySubject = JSON.stringify([{ username: 'tantrinh' }]);

      query.onFirstCall().returns({ success: true, msg: certBySubject });
      query.onSecondCall().returns({ success: false, msg: scoreBySubject });
      query.onThirdCall().returns({ success: true, msg: studentBySubject });

      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          subjectId: '7',
          studentUsername: 'tantrinh'
        })
        .then((res) => {
          expect(res.body.success).equal(false);
          done();
        });
    });

    it('do not succes create certificate because GetScoresBySubject error', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      createCertStub.returns({
        success: true,
        msg: 'create success!'
      });

      let certBySubject = JSON.stringify([{ certId: '1', studentUsername: 'tantrinh' }]);
      let scoreBySubject = JSON.stringify([{}]);
      let studentBySubject = JSON.stringify([{}]);

      query.onFirstCall().returns({ success: true, msg: certBySubject });
      query.onSecondCall().returns({ success: true, msg: scoreBySubject });
      query.onThirdCall().returns({ success: false, msg: studentBySubject });

      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          subjectId: '7',
          studentUsername: 'tantrinh'
        })
        .then((res) => {
          expect(res.body.success).equal(false);
          done();
        });
    });

    it('success create certificate ', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      createCertStub.returns({
        success: true,
        msg: 'create success!'
      });

      let certBySubject = JSON.stringify([{ certId: '1', studentUsername: 'tantrinh' }]);
      let scoreBySubject = JSON.stringify([{ scoreValue: 8.0, studentUsername: 'tantrinh' }]);
      let studentBySubject = JSON.stringify([{ username: 'tantrinh' }]);

      query.onFirstCall().returns({ success: true, msg: certBySubject });
      query.onSecondCall().returns({ success: true, msg: scoreBySubject });
      query.onThirdCall().returns({ success: true, msg: studentBySubject });

      request(app)
        .post('/certificate/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          subjectId: '7',
          studentUsername: 'tantrinh'
        })
        .then((res) => {
          expect(res.body.success).equal(true);
          done();
        });
    });
  });

  describe('# GET /certificate/:certId ', () => {
    let findOneStub;

    let certId = '5d9ac9e4fc93231bc694cb4c';

    beforeEach(() => {
      findOneStub = sinon.stub(Cert, 'findOne');
    });

    afterEach(() => {
      findOneStub.restore();
    });

    it('should get data success', (done) => {
      findOneStub.returns({
        certificateID: '5d9ac9e4fc93231bc694cb4c',
        SubjectID: 'Blockchain',
        username: 'tantv',
        issueDate: 'Mon Oct 07 2019 00:07:17 GMT+0700 (Indochina Time)'
      });

      request(app)
        .get(`/certificate/${certId}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('error query certificate with id', (done) => {
      findOneStub.yields({ error: 'failed query cert' }, null);
      request(app)
        .get(`/certificate/${certId}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it('certificate is not exists', (done) => {
      findOneStub.returns(undefined, null);
      request(app)
        .get(`/certificate/${certId}`)
        .then((res) => {
          expect(res.status).equal(404);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('certificate is not exists');
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

  describe('#GET /certificate/:certId/verify ', () => {
    let findOneUserStub;
    let findOneCertStub;
    let query;
    let verify;
    let certID = '5d9ac9e4fc93231bc694cb4c';

    beforeEach(() => {
      findOneUserStub = sinon.stub(User, 'findOne');
      findOneCertStub = sinon.stub(Cert, 'findOne');
      query = sinon.stub(network, 'connectToNetwork');
      verify = sinon.stub(network, 'verifyCertificate');
    });

    afterEach(() => {
      findOneUserStub.restore();
      findOneCertStub.restore();
      query.restore();
      verify.restore();
    });

    it('success verify certificate', (done) => {
      findOneUserStub.returns({ username: 'hoangdd', role: USER_ROLES.STUDENT });

      findOneCertStub.returns({
        certificateID: '5d9ac9e4fc93231bc694cb4c',
        SubjectID: 'Blockchain',
        username: 'hoangdd',
        issueDate: 'Mon Oct 07 2019 00:07:17 GMT+0700 (Indochina Time)'
      });

      verify.returns({
        success: true,
        msg: {
          certificateID: '5d9ac9e4fc93231bc694cb4c',
          SubjectID: 'Blockchain',
          username: 'hoangdd'
        }
      });

      request(app)
        .get(`/certificate/${certID}/verify`)
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('do not success verify because server error', (done) => {
      findOneCertStub.throws();

      verify.returns({
        success: true,
        msg: {
          certificateID: '5d9ac9e4fc93231bc694cb4c',
          SubjectID: 'Blockchain',
          username: 'hoangdd'
        }
      });

      request(app)
        .get(`/certificate/${certID}/verify`)
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Internal Server Error');
          done();
        });
    });

    it('do not success verify because chaincode response error', (done) => {
      findOneUserStub.returns({ username: 'hoangdd', role: USER_ROLES.STUDENT });

      findOneCertStub.returns({
        certificateID: '5d9ac9e4fc93231bc694cb4c',
        SubjectID: 'Blockchain',
        username: 'hoangdd',
        issueDate: 'Mon Oct 07 2019 00:07:17 GMT+0700 (Indochina Time)'
      });

      verify.returns({
        success: false,
        msg: 'error'
      });

      request(app)
        .get(`/certificate/${certID}/verify`)
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it('do not success verify because error certificate is not exists in database', (done) => {
      findOneCertStub.returns(null);

      request(app)
        .get(`/certificate/${certID}/verify`)
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(404);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('ceritificate is not exists');
          done();
        });
    });
  });
});
