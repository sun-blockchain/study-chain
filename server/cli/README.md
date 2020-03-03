## 1. Enroll admin

- orgid {String} (default: student}

```bash
node enrollAdmin.js --orgMSP=[OrgName] --username=[username]
```

#### Example:

enrollAdmin Org student:

```bash
node enrollAdmin.js --username=adminstudent
```

enrollAdmin Org academy:

```bash
node enrollAdmin.js --orgMSP=academy --username=adminacademy
```

## 2. Register user

- orgid {String} (default: student}
- userid {String} (required)

```bash
node registerUser.js --username=[username] --orgMSP=[OrgName] --fullname=[Fullname]
```

#### Example:

Register 20156425 in studen (student):

```bash
node registerUser.js --username=st01 --orgMSP=student --password=123456 --fullname=TrinhVanTan
```

Register GV00 in academy (teacher):

```bash
node registerUser.js --username=GV00 --orgMSP=academy --fullname=ABC --password=123456
```

## Enroll admin and register user with `intit.sh`

```bash
chmod +x ./init.sh
./init.sh
```

## Query Ledger

- orgid {String} (default: student)
- func {String} Function Name (required)
- userid {String} (required)
- args {String} argument of function (optional)

```bash
node query.js --userid=[UserId] --org=[OrgName] --func=[FunctionName] --args=[Argument]
```

#### Example:

Query student id is 1 with role academy admin:

```bash
node query.js --username=adminacademy --func=GetStudent --args=st01
```

```bash
node query.js --username=adminacademy --func=GetTeacher --args=gv01
```

Query All student with role academy admin:

```bash
node query.js --username=adminacademy --func=GetAllStudents
```

```bash
node query.js --username=adminacademy --func=GetAllCourses
```

```bash
node query.js --username=adminacademy --func=GetAllSubjects
```

```bash
node query.js --username=adminacademy --func=GetAllClasses
```

```bash
node query.js --username=adminacademy --func=GetSubject --args=ethereum
```

```bash
node query.js --username=adminacademy --func=GetClassesOfStudent --args="St01"
```

```bash
node query.js --username=adminacademy --func=GetCoursesOfStudent --args="St01"
```

```bash
node query.js --username=adminacademy --func=GetStudentsOfCourse --args="xxxx"
```

```bash
node query.js --username=adminacademy --func=GetScoresByStudent --args=st01
```

```bash
node query.js --username=adminacademy --func=GetAllScores
```

```bash
node query.js --username=adminacademy --func=GetSubjectsByStudent --args=st01
```

```bash
node query.js --username=adminacademy --func=GetCertificatesByStudent --args=st01
```

```bash
node query.js --username=adminacademy --func=GetCertificatesBySubject --args=ethereum
```

```bash
node query.js --username=adminacademy --func=GetStudentsOfClass --args=classId
```

Query all Subject of Course by CourseID

```bash
node query.js --username=adminacademy --func=GetSubjectsOfCourse --args=xxx
```

## Invoke Ledger

- orgMSP {String} (default: student)
- func {String} Function Name (required)
- username {String} (required)
- argument {String} (optional: depend of function call)

#### Example:

```bash
node invoke.js --username=adminacademy --func=CreateCourse --courseCode=BC01 --courseName=Blockchain --description=Blockchain --shortDescription=Blockchain
```

```bash
node invoke.js --username=adminacademy --func=UpdateCourseInfo --courseId=xxxx  --courseCode=BC01 --courseName=Blockchain --description=Blockchain --shortDescription=Blockchain
```

```bash
node invoke.js --username=adminacademy --func=UpdateClassInfo --classId=xxx --classCode=Fabric101 --room=F13 --time="11:45" --capacity=99
```

```bash
node invoke.js --username=st01 --func=UpdateUserInfo --phoneNumber=0382794668  --email=BC01 --address=KienGiang --fullName=TrinhVanTan
```

```bash
node invoke.js --username=adminacademy --func=DeleteCourse --courseId=xxxx
```

```bash
node invoke.js --username=adminacademy --func=CreateSubject --subjectCode=ET01 --subjectName=Ethereum --shortDescription=Ethereum --description=Ethereum
```

```bash
node invoke.js --username=adminacademy --func=CreateClass --classCode=ETH101 --room=F13 --time="11:00" --startDate=abc --endDate=abc --repeat=Weekly  --subjectId="abc-def" --capacity=100
```

```bash
node invoke.js --username=adminacademy --func=UpdateSubjectInfo --subjectId=xxxx  --subjectCode=BC01 --subjectName=Blockchain --description=Blockchain --shortDescription=Blockchain0001
```

```bash
node invoke.js --username=adminacademy --func=DeleteSubject --subjectId=xxxx
```

```bash
node invoke.js --username=adminacademy --func=AddSubjectToCourse --courseId=xxxx --subjectId=xxxx
```

```bash
node invoke.js --username=adminacademy --func=RemoveSubjectFromCourse --courseId=xxxx --subjectId=xxxx
```

```bash
node invoke.js --username=adminacademy --func=RemoveClassFromSubject --subjectId=xxxx --classId=xxxx
```

```bash
node invoke.js --username=adminacademy --func=CloseRegisterClass --classId=xxxx
```

```bash
node invoke.js --username=adminacademy --func=TeacherRegisterSubject --subjectid=ethereum --teacher=gv01
```

```bash
node invoke.js --username=st01 --func=StudentRegisterCourse --courseId=xxxx
```

```bash
node invoke.js --username=st01 --func=StudentRegisterClass --classId=xxxx
```

```bash
node invoke.js --username=st01 --func=StudentCancelRegisterClass --classId=xxxx
```

```bash
node invoke.js --username=gv01 --func=CreateScore --subjectId= --classId= --studentUsername=conglt --scoreValue=10
```

```bash
node invoke.js --username=adminacademy --func=CreateCertificate --subjectid=ethereum --student=st01
```
