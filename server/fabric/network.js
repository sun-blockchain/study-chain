'use strict';
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const Certificate = require('../models/Certificate');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect database
mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (error) => {
    if (error) console.log(error);
  }
);

mongoose.set('useCreateIndex', true);

exports.connectToNetwork = async function(user, cli = false) {
  try {
    let orgMSP = 'student';

    if (user.role == USER_ROLES.ADMIN_ACADEMY || user.role == USER_ROLES.TEACHER) {
      orgMSP = 'academy';
    } else if (user.role == USER_ROLES.ADMIN_STUDENT || user.role == USER_ROLES.STUDENT) {
      orgMSP = 'student';
    } else {
      let response = {};
      response.error =
        'An identity for the user ' +
        identity +
        ' does not exist in the wallet. Register ' +
        identity +
        ' first';
      return response;
    }

    let identity = user.username;

    const ccpPath = path.resolve(__dirname, '../..', 'network', `connection-${orgMSP}.json`);
    let walletPath = path.join(process.cwd(), `/cli/wallet/wallet-${orgMSP}`);

    if (cli) {
      walletPath = path.join(process.cwd(), `/wallet/wallet-${orgMSP}`);
    }

    const wallet = new FileSystemWallet(walletPath);
    const userExists = await wallet.exists(identity);

    let networkObj;

    if (!userExists) {
      let response = {};
      response.error =
        'An identity for the user ' +
        identity +
        ' does not exist in the wallet. Register ' +
        identity +
        ' first';
      return response;
    } else {
      const gateway = new Gateway();

      await gateway.connect(ccpPath, {
        wallet: wallet,
        identity: identity,
        discovery: { enabled: true, asLocalhost: true }
      });

      const network = await gateway.getNetwork('certificatechannel');
      const contract = await network.getContract('academy');

      networkObj = {
        contract: contract,
        network: network,
        gateway: gateway,
        user: user
      };
    }

    return networkObj;
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    process.exit(1);
  }
};

exports.query = async function(networkObj, func, args) {
  let response = {
    success: false,
    msg: ''
  };
  try {
    if (Array.isArray(args)) {
      response.msg = await networkObj.contract.evaluateTransaction(func, ...args);

      await networkObj.gateway.disconnect();
      response.success = true;
      return response;
    } else if (args) {
      response.msg = await networkObj.contract.evaluateTransaction(func, args);

      await networkObj.gateway.disconnect();
      response.success = true;
      return response;
    } else {
      response.msg = await networkObj.contract.evaluateTransaction(func);

      await networkObj.gateway.disconnect();
      response.success = true;
      return response;
    }
  } catch (error) {
    response.success = false;
    response.msg = error;
    return response;
  }
};

exports.verifyCertificate = async function(networkObj, certificate) {
  let response = {
    success: false,
    msg: ''
  };
  try {
    response.msg = await networkObj.contract.evaluateTransaction(
      'VerifyCertificate',
      certificate.certificateID,
      certificate.subjectID,
      certificate.username
    );

    await networkObj.gateway.disconnect();
    response.success = true;
    return response;
  } catch (error) {
    response.success = false;
    response.msg = error;
    return response;
  }
};

exports.registerTeacherOnBlockchain = async function(networkObj, createdUser) {
  if (!createdUser.username) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  var orgMSP = 'academy';
  var nameMSP = 'Academy';

  try {
    const ccpPath = path.resolve(__dirname, '../..', 'network', `connection-${orgMSP}.json`);
    const walletPath = path.join(process.cwd(), `/cli/wallet/wallet-${orgMSP}`);
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists(createdUser.username);
    if (userExists) {
      console.log(`An identity for the user ${createdUser.username} already exists in the wallet`);
      return;
    }

    // Get the CA client object from the gateway for interacting with the CA.
    const ca = await networkObj.gateway.getClient().getCertificateAuthority();
    const adminIdentity = await networkObj.gateway.getCurrentIdentity();

    await networkObj.contract.submitTransaction(
      'CreateTeacher',
      createdUser.username,
      createdUser.fullname
    );

    let teacher = new User({
      username: createdUser.username,
      password: process.env.TEACHER_DEFAULT_PASSWORD,
      fullname: createdUser.fullname,
      role: USER_ROLES.TEACHER
    });

    let user = await teacher.save();

    if (user) {
      const secret = await ca.register(
        {
          affiliation: '',
          enrollmentID: user.username,
          role: 'client',
          attrs: [{ name: 'username', value: user.username, ecert: true }]
        },
        adminIdentity
      );

      const enrollment = await ca.enroll({
        enrollmentID: user.username,
        enrollmentSecret: secret
      });

      const userIdentity = X509WalletMixin.createIdentity(
        `${nameMSP}MSP`,
        enrollment.certificate,
        enrollment.key.toBytes()
      );

      await wallet.import(user.username, userIdentity);
    }

    let response = {
      success: true,
      msg: 'Register success!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    console.error(`Failed to register!`);
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.registerStudentOnBlockchain = async function(createdUser) {
  let identity = createdUser.username;
  var orgMSP = 'student';
  var nameMSP = 'Student';

  try {
    const ccpPath = path.resolve(__dirname, '../..', 'network', `connection-${orgMSP}.json`);
    const walletPath = path.join(process.cwd(), `/cli/wallet/wallet-${orgMSP}`);
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists(identity);
    if (userExists) {
      let response = {
        success: false,
        msg: 'User already exist!'
      };
      return response;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
      wallet,
      identity: process.env.ADMIN_STUDENT_USERNAME,
      discovery: { enabled: true, asLocalhost: true }
    });

    // Get the CA client object from the gateway for interacting with the CA.
    const ca = gateway.getClient().getCertificateAuthority();
    const adminIdentity = gateway.getCurrentIdentity();
    const network = await gateway.getNetwork('certificatechannel');
    const contract = await network.getContract('academy');

    await contract.submitTransaction('CreateStudent', identity, createdUser.fullname);

    let user = new User({
      username: identity,
      oauthType: createdUser.oauthType,
      password: createdUser.password ? createdUser.password : '',
      role: USER_ROLES.STUDENT
    });

    let userSaved = await user.save();

    if (userSaved) {
      const secret = await ca.register(
        {
          affiliation: '',
          enrollmentID: identity,
          role: 'client',
          attrs: [{ name: 'username', value: identity, ecert: true }]
        },
        adminIdentity
      );

      const enrollment = await ca.enroll({
        enrollmentID: identity,
        enrollmentSecret: secret
      });

      const userIdentity = X509WalletMixin.createIdentity(
        `${nameMSP}MSP`,
        enrollment.certificate,
        enrollment.key.toBytes()
      );

      await wallet.import(identity, userIdentity);
    }

    let response = {
      success: true,
      msg: 'Register success!'
    };

    await gateway.disconnect();
    return response;
  } catch (error) {
    console.error(`Failed to register!`);
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.createSubject = async function(networkObj, subject) {
  if (
    !subject.subjectId ||
    !subject.subjectName ||
    !subject.subjectCode ||
    !subject.shortDescription ||
    !subject.description
  ) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction(
      'CreateSubject',
      subject.subjectId,
      subject.subjectCode,
      subject.subjectName,
      subject.shortDescription,
      subject.description
    );
    let response = {
      success: true,
      msg: 'Create Successfully!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.createClass = async function(networkObj, _class) {
  if (
    !_class.classId ||
    !_class.classCode ||
    !_class.room ||
    !_class.time ||
    !_class.startDate ||
    !_class.endDate ||
    !_class.repeat ||
    !_class.subjectId ||
    !_class.capacity
  ) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }
  try {
    await networkObj.contract.submitTransaction(
      'CreateClass',
      _class.classId,
      _class.classCode,
      _class.room,
      _class.time,
      _class.startDate,
      _class.endDate,
      _class.repeat,
      _class.subjectId,
      _class.capacity
    );

    let response = {
      success: true,
      msg: 'Create Successfully!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };

    return response;
  }
};

exports.closeRegisterClass = async function(networkObj, classId) {
  if (!classId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }
  try {
    await networkObj.contract.submitTransaction('CloseRegisterClass', classId);
    let response = {
      success: true,
      msg: 'Close Successfully!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    console.log(error);
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};
exports.updateClassInfo = async function(networkObj, _class) {
  if (
    !_class.classId ||
    !_class.classCode ||
    !_class.room ||
    !_class.time ||
    !_class.startDate ||
    !_class.endDate ||
    !_class.repeat ||
    !_class.capacity
  ) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction(
      'UpdateClassInfo',
      _class.classId,
      _class.classCode,
      _class.room,
      _class.time,
      _class.startDate,
      _class.endDate,
      _class.repeat,
      _class.capacity
    );

    let response = {
      success: true,
      msg: 'Successfully Updated!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    console.log(error);
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};
exports.createCourse = async function(networkObj, course) {
  if (
    !course.courseId ||
    !course.courseCode ||
    !course.courseName ||
    !course.shortDescription ||
    !course.description
  ) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction(
      'CreateCourse',
      course.courseId,
      course.courseCode,
      course.courseName,
      course.shortDescription,
      course.description
    );
    let response = {
      success: true,
      msg: 'Create Successfully!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.updateCourseInfo = async function(networkObj, course) {
  if (
    !course.courseId ||
    !course.courseCode ||
    !course.courseName ||
    !course.shortDescription ||
    !course.description
  ) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction(
      'UpdateCourseInfo',
      course.courseId,
      course.courseCode,
      course.courseName,
      course.shortDescription,
      course.description
    );
    let response = {
      success: true,
      msg: 'Successfully Updated!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.updateSubjectInfo = async function(networkObj, subject) {
  if (
    !subject.subjectId ||
    !subject.subjectCode ||
    !subject.subjectName ||
    !subject.shortDescription ||
    !subject.description
  ) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can update!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction(
      'UpdateSubjectInfo',
      subject.subjectId,
      subject.subjectCode,
      subject.subjectName,
      subject.shortDescription,
      subject.description
    );
    let response = {
      success: true,
      msg: 'Successfully Updated!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.addSubjectToCourse = async function(networkObj, courseId, subjectId) {
  if (!courseId || !subjectId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can update!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction('AddSubjectToCourse', courseId, subjectId);
    let response = {
      success: true,
      msg: 'Successfully Updated!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.removeSubjectFromCourse = async function(networkObj, courseId, subjectId) {
  if (!courseId || !subjectId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can update!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction('RemoveSubjectFromCourse', courseId, subjectId);
    let response = {
      success: true,
      msg: 'Successfully Removed!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.removeClassFromSubject = async function(networkObj, subjectId, classId) {
  if (!classId || !subjectId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can update!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction('RemoveClassFromSubject', subjectId, classId);
    let response = {
      success: true,
      msg: 'Successfully Removed!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.updateUserInfo = async function(networkObj, newInfo) {
  if (!newInfo.username) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction(
      'UpdateUserInfo',
      newInfo.username,
      newInfo.fullName,
      newInfo.phoneNumber,
      newInfo.email,
      newInfo.address,
      newInfo.sex,
      newInfo.birthday,
      newInfo.country
    );

    let response = {
      success: true,
      msg: 'Successfully Updated!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.updateUserAvatar = async function(networkObj, avatar) {
  if (!avatar) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction('UpdateUserAvatar', avatar);
    let response = {
      success: true,
      msg: 'Successfully Updated!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.deleteCourse = async function(networkObj, courseId) {
  if (!courseId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction('DeleteCourse', courseId);
    let response = {
      success: true,
      msg: 'Deleted successfully!'
    };
    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.deleteSubject = async function(networkObj, subjectId) {
  if (!subjectId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction('DeleteSubject', subjectId);
    let response = {
      success: true,
      msg: 'Deleted successfully!'
    };
    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.createScore = async function(networkObj, score) {
  if (!score.teacher || !score.studentUsername || !score.scoreValue || !score.classId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction(
      'CreateScore',
      score.teacher,
      score.classId,
      score.studentUsername,
      score.scoreValue
    );

    let response = {
      success: true,
      msg: 'Create Successfully!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.createCertificate = async function(networkObj, certificate) {
  if (
    !certificate.certificateId ||
    !certificate.courseId ||
    !certificate.studentUsername ||
    !certificate.issueDate
  ) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }
  try {
    await networkObj.contract.submitTransaction(
      'CreateCertificate',
      certificate.certificateId,
      certificate.courseId,
      certificate.studentUsername,
      certificate.issueDate
    );
    let response = {
      success: true,
      msg: 'Create Successfully!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.addClassToTeacher = async function(networkObj, classId, username) {
  if (!classId || !username) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    await networkObj.contract.submitTransaction('AddClassToTeacher', classId, username);
    let response = {
      success: true,
      msg: 'Create Successfully!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.studentRegisterCourse = async function(networkObj, student, courseId) {
  if (!student || !courseId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }
  try {
    await networkObj.contract.submitTransaction('StudentRegisterCourse', student, courseId);
    let response = {
      success: true,
      msg: 'Register Successfully!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.studentRegisterClass = async function(networkObj, student, classId) {
  if (!student || !classId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }
  try {
    await networkObj.contract.submitTransaction('StudentRegisterClass', student, classId);
    let response = {
      success: true,
      msg: 'Register Successfully!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

exports.studentCancelRegisterClass = async function(networkObj, student, classId) {
  if (!student || !classId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }
  try {
    await networkObj.contract.submitTransaction('StudentCancelRegisterClass', student, classId);
    let response = {
      success: true,
      msg: 'Cancel Successfully!'
    };

    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    let response = {
      success: false,
      msg: error
    };
    return response;
  }
};

function changeCaseFirstLetter(params) {
  if (typeof params === 'string') {
    return params.charAt(0).toUpperCase() + params.slice(1);
  }
  return null;
}
