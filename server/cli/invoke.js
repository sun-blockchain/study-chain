'use strict';

const argv = require('yargs').argv;
const path = require('path');
const conn = require('../fabric/network');
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const uuidv4 = require('uuid/v4');

/**
 * Invoke function of chaincode
 * @param  {String} orgMSP  Org Name (default: student)
 * @param  {String} func  Function Name (required)
 * @param  {String} username User Name (required)
 */

async function main() {
  try {
    if (!argv.func || !argv.username) {
      console.log(`Parameter func or userid cannot undefined`);
      return;
    }

    let functionName = argv.func.toString();
    let username = argv.username.toString();

    await User.findOne({ username: username }, async (err, user) => {
      if (err) throw next(err);
      if (user) {
        const networkObj = await conn.connectToNetwork(user, true);
        if (functionName === 'CreateSubject' && user.role === USER_ROLES.ADMIN_ACADEMY) {
          /**
           * Create Subject
           * @param  {String} subjectid Subject Id (required)
           * @param  {String} subjectname Subject Name (required)
           * @param  {String} teacher Teacher Username (required)
           */

          let SubjectID = argv.subjectid.toString();
          let Name = argv.subjectname.toString();

          let subject = { subjectID: SubjectID, subjectName: Name };

          await conn.createSubject(networkObj, subject);
          console.log('Transaction has been submitted');
          process.exit(0);
        } else if (functionName === 'CreateCourse' && user.role === USER_ROLES.ADMIN_ACADEMY) {
          /**
           * Create Course
           * @param  {String} coursecode course Code (required)
           * @param  {String} coursename course Name (required)
           * @param  {String} description course description (required)
           */
          let CourseID = uuidv4();
          let CourseCode = argv.coursecode.toString();
          let CourseName = argv.coursename.toString();
          let Description = argv.description.toString();

          let course = {
            courseID: CourseID,
            courseCode: CourseCode,
            courseName: CourseName,
            description: Description
          };

          await conn.createCourse(networkObj, course);
          console.log('Transaction has been submitted');
          process.exit(0);
        } else if (functionName === 'CreateCertificate' && user.role === USER_ROLES.ADMIN_ACADEMY) {
          /**
           * Create Certificate
           * @param  {String} subjectid Subject Id (required)
           * @param  {String} student Student Username (required)
           */
          let Student = argv.student.toString();
          let SubjectID = argv.subjectid.toString();
          var issueDate = new Date().toString();
          let certificate = {
            certificateID: uuidv4(),
            subjectID: SubjectID,
            studentUsername: Student,
            issueDate: issueDate
          };
          await conn.createCertificate(networkObj, certificate);
          console.log('Transaction has been submitted 1');

          process.exit(0);
        } else if (
          functionName === 'TeacherRegisterSubject' &&
          user.role === USER_ROLES.ADMIN_ACADEMY
        ) {
          let SubjectID = argv.subjectid.toString();
          let Teacher = argv.teacher.toString();

          await conn.registerTeacherForSubject(networkObj, SubjectID, Teacher);
          console.log('Transaction has been submitted');
          process.exit(0);
        } else if (functionName === 'StudentRegisterSubject' && user.role === USER_ROLES.STUDENT) {
          let SubjectID = argv.subjectid.toString();
          let Student = user.username;

          await conn.registerStudentForSubject(networkObj, SubjectID, Student);
          console.log('Transaction has been submitted');
          process.exit(0);
        } else if (functionName === 'CreateScore' && user.role === USER_ROLES.TEACHER) {
          /**
           * Create Score
           * @param  {String} subjectid Subject Id (required)
           * @param  {String} student Student Username (required)
           * @param  {String} score Point of Subject (required)
           *
           */
          let SubjectID = argv.subjectid.toString();
          let Student = argv.student.toString();
          let ScoreValue = argv.score.toString();

          let score = { subjectID: SubjectID, studentUsername: Student, scoreValue: ScoreValue };
          await conn.createScore(networkObj, score);
          console.log('Transaction has been submitted');
          process.exit(0);
        } else {
          console.log('Failed!');
          process.exit(0);
        }

        // Disconnect from the gateway.
        await networkObj.gateway.disconnect();
      }
    });
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    process.exit(1);
  }
}

main();
