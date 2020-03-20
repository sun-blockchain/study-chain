process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const network = require('../fabric/network');
const app = require('../app');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const User = require('../models/User');

require('dotenv').config();

describe('#POST /academy/:subjectId/class', () => {
  let connect;
  let query;
  let createClass;
  let subjectId = '123456';

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

  it('Start date must occur befor end date at least 1 week!', (done) => {
    connect.returns(null);

    request(app)
      .post(`/academy/subject/${subjectId}/class`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '604800000',
        endDate: '604800000',
        repeat: 'Weekly Monday',
        capacity: 10
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Start date must occur befor end date at least 1 week!');
        done();
      });
  });

  it('Failed connect to blockchain!', (done) => {
    connect.returns(null);

    request(app)
      .post(`/academy/subject/${subjectId}/class`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '604800000',
        endDate: '1604800000',
        repeat: 'Weekly Monday',
        capacity: 10
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
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

    createClass.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .post(`/academy/subject/${subjectId}/class`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '604800000',
        endDate: '1604800000',
        repeat: 'Weekly Monday',
        capacity: 10
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not invoke chaincode!');
        done();
      });
  });

  it('Create Successdfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    createClass.returns({
      success: true
    });

    request(app)
      .post(`/academy/subject/${subjectId}/class`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '604800000',
        endDate: '1604800000',
        repeat: 'Weekly Monday',
        capacity: 10
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Create Successdfully!');
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

describe('#PUT /academy/startClass', () => {
  let connect;
  let query;
  let startClass;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    startClass = sinon.stub(network, 'startClass');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    startClass.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .put('/academy/startClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .put('/academy/startClass')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not success close register because req.body invalid', (done) => {
    request(app)
      .put('/academy/startClass')
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
      .put('/academy/startClass')
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
      .put('/academy/startClass')
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
      Status: 'InProgress'
    });
    query.returns({
      success: true,
      msg: data
    });
    request(app)
      .put('/academy/startClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: 'b2ab2fbd-1053-4848-aac9-2090fee54074'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not start this class!');
        done();
      });
  });

  it('There is not teacher assigned to this class!', (done) => {
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
    request(app)
      .put('/academy/startClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: 'b2ab2fbd-1053-4848-aac9-2090fee54074'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('There is no teacher assigned to this class!');
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
      Status: 'Open',
      TeacherUsername: 'tc01'
    });

    query.returns({
      success: true,
      msg: data
    });

    startClass.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .put('/academy/startClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: 'b2ab2fbd-1053-4848-aac9-2090fee54074'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not invoke chaincode!');
        done();
      });
  });

  it('Start Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassId: 'b2ab2fbd-1053-4848-aac9-2090fee54074',
      Status: 'Open',
      TeacherUsername: 'tc01'
    });

    query.returns({
      success: true,
      msg: data
    });

    startClass.returns({
      success: true
    });

    request(app)
      .put('/academy/startClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: 'b2ab2fbd-1053-4848-aac9-2090fee54074'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Start Successfully!');
        done();
      });
  });
});

describe('#POST /academy/assignTeacherToClass', () => {
  let connect;
  let query;
  let assignTeacherToClass;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    assignTeacherToClass = sinon.stub(network, 'assignTeacherToClass');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    assignTeacherToClass.restore();
  });

  it('param username empty', (done) => {
    request(app)
      .post('/academy/assignTeacherToClass')
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
      .post('/academy/assignTeacherToClass')
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
      .post('/academy/assignTeacherToClass')
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
      .post('/academy/assignTeacherToClass')
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
      .post('/academy/assignTeacherToClass')
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
      .post('/academy/assignTeacherToClass')
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

  it("Can't query class in chaincode!", (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({ success: false, msg: "Can't query class in chaincode!" });

    request(app)
      .post('/academy/assignTeacherToClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '0ce15c8c-29dc-4d6d-be80-f224dac994b8'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal("Can't query class in chaincode!");
        done();
      });
  });

  it('The class was added for this teacher!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let classInfo = JSON.stringify({
      ClassID: '0ce15c8c-29dc-4d6d-be80-f224dac994b8',
      TeacherUsername: 'teacher01'
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .post('/academy/assignTeacherToClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '0ce15c8c-29dc-4d6d-be80-f224dac994b8'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('The class was added for this teacher!');
        done();
      });
  });

  it('The class was added for teacher - teacher02!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let classInfo = JSON.stringify({
      ClassID: '0ce15c8c-29dc-4d6d-be80-f224dac994b8',
      TeacherUsername: 'teacher02'
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .post('/academy/assignTeacherToClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '0ce15c8c-29dc-4d6d-be80-f224dac994b8'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('The class was added for teacher - teacher02!');
        done();
      });
  });

  it('The class was started!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let classInfo = JSON.stringify({
      ClassID: '0ce15c8c-29dc-4d6d-be80-f224dac994b8',
      TeacherUsername: '',
      Status: 'Inprogess'
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .post('/academy/assignTeacherToClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '0ce15c8c-29dc-4d6d-be80-f224dac994b8'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('The class was started!');
        done();
      });
  });

  it('add class to teacher error!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let classInfo = JSON.stringify({
      ClassID: '0ce15c8c-29dc-4d6d-be80-f224dac994b8',
      TeacherUsername: '',
      Status: 'Open'
    });

    query.onFirstCall().returns({ success: true, msg: classInfo });

    assignTeacherToClass.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .post('/academy/assignTeacherToClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '4ca7fc39-7523-424d-984e-87ea590cac66'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not invoke chaincode!');
        done();
      });
  });

  it('Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let classInfo = JSON.stringify({
      ClassID: '0ce15c8c-29dc-4d6d-be80-f224dac994b8',
      TeacherUsername: '',
      Status: 'Open'
    });

    query.returns({ success: true, msg: classInfo });

    assignTeacherToClass.returns({
      success: true,
      msg: 'Assign Successfully!'
    });

    request(app)
      .post('/academy/assignTeacherToClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01',
        classId: '4ca7fc39-7523-424d-984e-87ea590cac66'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Assign Successfully!');
        done();
      });
  });
});

describe('#POST /academy/unassignTeacherFromClass', () => {
  let connect;
  let query;
  let unassignTeacherFromClass;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    unassignTeacherFromClass = sinon.stub(network, 'unassignTeacherFromClass');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    unassignTeacherFromClass.restore();
  });

  it('Permission Denied!', (done) => {
    request(app)
      .post('/academy/unassignTeacherFromClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied!');
        done();
      });
  });

  it('Invalid body!', (done) => {
    request(app)
      .post('/academy/unassignTeacherFromClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('Failed connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .post('/academy/unassignTeacherFromClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
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
      .post('/academy/unassignTeacherFromClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('This class does not belong to any teacher!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassID: '123456',
      TeacherUsername: ''
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/academy/unassignTeacherFromClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('This class does not belong to any teacher!');
        done();
      });
  });

  it('This class was started!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassID: '123456',
      TeacherUsername: 'tc01',
      Status: 'Inprogess'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/academy/unassignTeacherFromClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('This class was started!');
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
      ClassID: '123456',
      TeacherUsername: 'tc01',
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    unassignTeacherFromClass.returns({
      success: false
    });

    request(app)
      .post('/academy/unassignTeacherFromClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not invoke chaincode!');
        done();
      });
  });

  it('Remove Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassID: '123456',
      TeacherUsername: 'tc01',
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    unassignTeacherFromClass.returns({
      success: true
    });

    request(app)
      .post('/academy/unassignTeacherFromClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Unassign Successfully!');
        done();
      });
  });
});
