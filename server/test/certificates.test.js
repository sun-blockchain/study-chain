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

describe('#POST /certificates ', () => {
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

  it('Request body is invalid', (done) => {
    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Permission Denined with teacher', (done) => {
    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        courseId: '75442486-0878-440c-9db1-a7006c25a39f'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Permission Denined with admin', (done) => {
    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '75442486-0878-440c-9db1-a7006c25a39f'
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
      .post('/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '75442486-0878-440c-9db1-a7006c25a39f'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('This course has no subject', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1fe9f48b-6c41-488d-9085-011f05a24603',
        CourseCode: 'BC02',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description: 'Blockchain',
        Subjects: null,
        Students: ['st01']
      })
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify([
        {
          CourseID: '14245245456',
          StudentUsername: 'hoangdd'
        },
        {
          CourseID: '123457',
          StudentUsername: 'hoangdd'
        }
      ])
    });
    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '1fe9f48b-6c41-488d-9085-011f05a24603'
      })
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.msg).equal('This course has no subject');
        done();
      });
  });

  it('Certificate already exists', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1fe9f48b-6c41-488d-9085-011f05a24603',
        CourseCode: 'BC02',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description: 'Blockchain',
        Subjects: ['f8ce73e3-056e-4e69-99fe-76bbeeaf4650'],
        Students: ['st01']
      })
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify([
        {
          CourseID: '1fe9f48b-6c41-488d-9085-011f05a24603',
          StudentUsername: 'hoangdd'
        },
        {
          CourseID: '123457',
          StudentUsername: 'hoangdd'
        }
      ])
    });
    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '1fe9f48b-6c41-488d-9085-011f05a24603'
      })
      .then((res) => {
        expect(res.status).equal(409);
        expect(res.body.msg).equal('Certificate already exists');
        done();
      });
  });

  it('You have not studied this course yet', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1fe9f48b-6c41-488d-9085-011f05a24603',
        CourseCode: 'BC02',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description: 'Blockchain',
        Subjects: ['f8ce73e3-056e-4e69-99fe-76bbeeaf4650'],
        Students: ['st01']
      })
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify([
        {
          CourseID: '123412412',
          StudentUsername: 'hoangdd'
        },
        {
          CourseID: '123457',
          StudentUsername: 'hoangdd'
        }
      ])
    });

    query.onThirdCall().returns({
      success: true,
      msg: JSON.stringify({
        Username: 'hoangdd',
        Courses: []
      })
    });

    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.msg).equal('You have not studied this course yet');
        done();
      });
  });

  it('Failed to query course in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({
      success: false,
      msg: 'Failed to query course in chaincode'
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify([
        {
          CourseID: '123412412',
          StudentUsername: 'hoangdd'
        },
        {
          CourseID: '123457',
          StudentUsername: 'hoangdd'
        }
      ])
    });

    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '1fe9f48b-6c41-488d-9085-011f05a24603'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Failed to query certificates of student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1fe9f48b-6c41-488d-9085-011f05a24603',
        CourseCode: 'BC02',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description: 'Blockchain',
        Subjects: ['f8ce73e3-056e-4e69-99fe-76bbeeaf4650'],
        Students: ['st01']
      })
    });

    query.onSecondCall().returns({
      success: false,
      msg: 'Failed to query certificates of student in chaincode'
    });

    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '1fe9f48b-6c41-488d-9085-011f05a24603'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Failed to query student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1fe9f48b-6c41-488d-9085-011f05a24603',
        CourseCode: 'BC02',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description: 'Blockchain',
        Subjects: ['f8ce73e3-056e-4e69-99fe-76bbeeaf4650'],
        Students: ['st01']
      })
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify([
        {
          CourseID: '123412412',
          StudentUsername: 'hoangdd'
        },
        {
          CourseID: '123457',
          StudentUsername: 'hoangdd'
        }
      ])
    });

    query.onThirdCall().returns({
      success: false,
      msg: 'Failed to query student in chaincode'
    });

    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '1fe9f48b-6c41-488d-9085-011f05a24603'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Can not invoke chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1fe9f48b-6c41-488d-9085-011f05a24603',
        CourseCode: 'BC02',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description: 'Blockchain',
        Subjects: ['f8ce73e3-056e-4e69-99fe-76bbeeaf4650'],
        Students: ['st01']
      })
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify([
        {
          CourseID: '123412412',
          StudentUsername: 'hoangdd'
        },
        {
          CourseID: '123457',
          StudentUsername: 'hoangdd'
        }
      ])
    });

    query.onThirdCall().returns({
      success: true,
      msg: JSON.stringify({
        Username: 'hoangdd',
        Courses: ['123456']
      })
    });

    createCertificate.returns({
      success: false,
      msg: 'Failed to create certificate'
    });

    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Create certificate successfully', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1fe9f48b-6c41-488d-9085-011f05a24603',
        CourseCode: 'BC02',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description: 'Blockchain',
        Subjects: ['f8ce73e3-056e-4e69-99fe-76bbeeaf4650'],
        Students: ['st01']
      })
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify([
        {
          CourseID: '123412412',
          StudentUsername: 'hoangdd'
        },
        {
          CourseID: '123457',
          StudentUsername: 'hoangdd'
        }
      ])
    });

    query.onThirdCall().returns({
      success: true,
      msg: JSON.stringify({
        Username: 'hoangdd',
        Courses: ['123456']
      })
    });

    createCertificate.returns({
      success: true
    });

    request(app)
      .post('/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(201);
        expect(res.body.msg).equal('Create certificate successfully');
        done();
      });
  });
});

describe('# GET /certificates/:certId ', () => {
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

  it('should get certificate success', (done) => {
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
      .get(`/certificates/${certId}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Failed to connect blockchain', (done) => {
    connect.returns(null);
    request(app)
      .get(`/certificates/${certId}`)
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
      .get(`/certificates/${certId}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get(`/certificates/${certId}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get(`/certificates/${certId}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });
});
