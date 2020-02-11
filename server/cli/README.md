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
	node registerUser.js --username=20156425 --orgMSP=student --fullname=TrinhVanTan --password=123456
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
	node query.js --username=adminacademy --func=QueryStudent --args=st01
```

```bash
	node query.js --username=adminacademy --func=QueryTeacher --args=gv01
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
	node query.js --username=adminacademy --func=QuerySubject --args=ethereum
```

```bash
	node query.js --username=adminacademy --func=GetScoresByStudent --args=st01
```

```bash
	node query.js --username=adminacademy --func=GetAllScores
```

```bash
	node query.js --username=adminacademy --func=GetScoresBySubject --args=ethereum
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

Query Score with role admin student with studentId and subjectId

```bash
	// arguments = [StudentId, SubjectId]
	node query.js --username=trinh --func=QueryScore --args=10 --args=160212
```

## Invoke Ledger

- orgMSP {String} (default: student)
- func {String} Function Name (required)
- username {String} (required)
- argument {String} (optional: depend of function call)

#### Example:

```bash
 node invoke.js --username=adminacademy --func=CreateCourse --coursecode=BC01 --coursename=Blockchain --description=Blockchain
```

```bash
 node invoke.js --username=adminacademy --func=editCourseInfo --courseid=xxxx  --coursecode=BC01 --coursename=Blockchain --description=Blockchain
```

```bash
 node invoke.js --username=adminacademy --func=CreateSubject --subjectid=ethereum --subjectname=tantr
```

```bash
node invoke.js --username=adminacademy --func=TeacherRegisterSubject --subjectid=ethereum --teacher=gv01
```

```bash
node invoke.js --username=st01 --func=StudentRegisterSubject --subjectid=ethereum
```

```bash
node invoke.js --username=gv01 --func=CreateScore --subjectid=ethereum --student=st01 --score=10
```

```bash
	node invoke.js --username=adminacademy --func=CreateCertificate --subjectid=ethereum --student=st01
```
