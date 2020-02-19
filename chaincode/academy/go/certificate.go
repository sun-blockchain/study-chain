package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type Course struct {
	CourseID         string
	CourseCode       string
	CourseName       string
	ShortDescription string
	Description      string
	Subjects         []string
}

type Subject struct {
	SubjectID        string
	SubjectCode      string
	SubjectName      string
	ShortDescription string
	Description      string
	Classes 		[]string
}

type Class struct {
	ClassID          string
	ClassCode        string
	Room             string
	Time             string
	Status           bool
	ShortDescription string
	Description      string
	Students         []string
}

type Teacher struct {
	Username string
	Fullname string
	Info     Information
	Subjects []string
}

type Student struct {
	Username string
	Fullname string
	Info     Information
	Courses  []string
}

type Information struct {
	PhoneNumber string
	Email       string
	Address     string
	Sex         string
	Birthday    string
	Avatar      string
}

type Score struct {
	SubjectID       string
	StudentUsername string
	ScoreValue      float64
	Certificated    bool
}

type Certificate struct {
	CertificateID   string
	SubjectID       string
	StudentUsername string
	IssueDate       string
}

func (s *SmartContract) Init(stub shim.ChaincodeStubInterface) sc.Response {
	key := "Student-St01"

	var student = Student{Username: "St01", Courses: nil}

	studentAsBytes, _ := json.Marshal(student)

	stub.PutState(key, studentAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) Invoke(stub shim.ChaincodeStubInterface) sc.Response {

	function, args := stub.GetFunctionAndParameters()

	if function == "CreateStudent" {
		return CreateStudent(stub, args)
	} else if function == "CreateSubject" {
		return CreateSubject(stub, args)
	} else if function == "CreateClass" {
		return CreateClass(stub, args)
	} else if function == "CreateScore" {
		return CreateScore(stub, args)
	} else if function == "CreateCertificate" {
		return CreateCertificate(stub, args)
	} else if function == "CreateTeacher" {
		return CreateTeacher(stub, args)
	} else if function == "QuerySubject" {
		return QuerySubject(stub, args)
	} else if function == "QuerySubjectsOfCourse" {
		return QuerySubjectsOfCourse(stub, args)
	} else if function == "QueryScore" {
		return QueryScore(stub, args)
	} else if function == "QueryStudent" {
		return QueryStudent(stub, args)
	} else if function == "QueryCertificate" {
		return QueryCertificate(stub, args)
	} else if function == "VerifyCertificate" {
		return VerifyCertificate(stub, args)
	} else if function == "QueryTeacher" {
		return QueryTeacher(stub, args)
	} else if function == "GetAllSubjects" {
		return GetAllSubjects(stub)
	} else if function == "GetAllClassesOfSubject" {
		return GetAllClassesOfSubject(stub,args)
	} else if function == "GetAllClasses" {
		return GetAllClasses(stub)
	} else if function == "GetAllStudents" {
		return GetAllStudents(stub)
	} else if function == "GetAllScores" {
		return GetAllScores(stub)
	} else if function == "GetAllTeachers" {
		return GetAllTeachers(stub)
	} else if function == "GetMyCerts" {
		return GetMyCerts(stub)
	} else if function == "GetMySubjects" {
		return GetMySubjects(stub)
	} else if function == "GetMyScores" {
		return GetMyScores(stub)
	} else if function == "StudentRegisterSubject" {
		return StudentRegisterSubject(stub, args)
	} else if function == "TeacherRegisterSubject" {
		return TeacherRegisterSubject(stub, args)
	} else if function == "GetSubjectsByStudent" {
		return GetSubjectsByStudent(stub, args)
	} else if function == "GetCertificatesByStudent" {
		return GetCertificatesByStudent(stub, args)
	} else if function == "GetScoresByStudent" {
		return GetScoresByStudent(stub, args)
	} else if function == "GetSubjectsByTeacher" {
		return GetSubjectsByTeacher(stub, args)
	} else if function == "GetCertificatesBySubject" {
		return GetCertificatesBySubject(stub, args)
	} else if function == "GetStudentsBySubject" {
		return GetStudentsBySubject(stub, args)
	} else if function == "GetScoresBySubject" {
		return GetScoresBySubject(stub, args)
	} else if function == "GetScoresBySubjectOfTeacher" {
		return GetScoresBySubjectOfTeacher(stub, args)
	} else if function == "CreateCourse" {
		return CreateCourse(stub, args)
	} else if function == "QueryCourse" {
		return QueryCourse(stub, args)
	} else if function == "GetAllCourses" {
		return GetAllCourses(stub)
	} else if function == "UpdateCourseInfo" {
		return UpdateCourseInfo(stub, args)
	} else if function == "DeleteCourse" {
		return DeleteCourse(stub, args)
	} else if function == "UpdateUserInfo" {
		return UpdateUserInfo(stub, args)
	} else if function == "UpdateUserAvatar" {
		return UpdateUserAvatar(stub, args)
	} else if function == "UpdateSubjectInfo" {
		return UpdateSubjectInfo(stub, args)
	} else if function == "AddSubjectToCourse" {
		return AddSubjectToCourse(stub, args)
	} else if function == "RemoveSubjectFromCourse" {
		return RemoveSubjectFromCourse(stub, args)
	}

	return shim.Error("Invalid Smart Contract function name!")
}

func TeacherRegisterSubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	// var TeacherUsername string

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	return shim.Error("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	return shim.Error("Permission Denied!")
	// }

	// TeacherUsername, ok, err := cid.GetAttributeValue(stub, "username")

	// if err != nil {
	// 	return shim.Error("Error - cid.GetAttributeValue()")
	// }

	// if !ok {
	// 	TeacherUsername = args[1]
	// }

	// SubjectID := args[0]

	// keySubject := "Subject-" + SubjectID
	// keyTeacher := "Teacher-" + TeacherUsername

	// subject, err := getSubject(stub, keySubject)

	// if err != nil {

	// 	return shim.Error("Subject does not exist !")

	// } else {

	// 	teacher, err := getTeacher(stub, keyTeacher)

	// 	if err != nil {

	// 		return shim.Error("Student does not exist !")

	// 	} else {

	// 		teacher.Subjects = append(teacher.Subjects, SubjectID)

	// 		subject.TeacherUsername = TeacherUsername

	// 		subjectAsBytes, _ := json.Marshal(subject)

	// 		teacherAsBytes, _ := json.Marshal(teacher)

	// 		stub.PutState(keyTeacher, teacherAsBytes)

	// 		stub.PutState(keySubject, subjectAsBytes)

	// 		return shim.Success(nil)
	// 	}
	// }
	return shim.Success(nil)
}

func StudentRegisterSubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	// var StudentUsername string

	// StudentUsername, ok, err := cid.GetAttributeValue(stub, "username")

	// if err != nil {
	// 	return shim.Error("Error - cid.GetAttributeValue()")
	// }

	// if ok == false {
	// 	return shim.Error("Permission Denied!")
	// }

	// SubjectID := args[0]

	// keySubject := "Subject-" + SubjectID
	// keyStudent := "Student-" + StudentUsername

	// subject, err := getSubject(stub, keySubject)

	// if err != nil {

	// 	return shim.Error("Subject does not exist !")

	// } else {

	// 	student, err := getStudent(stub, keyStudent)

	// 	if err != nil {

	// 		return shim.Error("Student does not exist !")

	// 	} else {

	// 		student.Subjects = append(student.Subjects, SubjectID)

	// 		subject.Students = append(subject.Students, StudentUsername)

	// 		subjectAsBytes, _ := json.Marshal(subject)

	// 		studentAsBytes, _ := json.Marshal(student)

	// 		stub.PutState(keyStudent, studentAsBytes)

	// 		stub.PutState(keySubject, subjectAsBytes)

	// 		return shim.Success(nil)
	// 	}
	// }
	return shim.Success(nil)
}

func AddSubjectToCourse(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	CourseID := args[0]
	SubjectID := args[1]

	keyCourse := "Course-" + CourseID
	course, err := getCourse(stub, keyCourse)

	if err != nil {

		return shim.Error("Course does not exist!")

	}

	keySubject := "Subject-" + SubjectID
	_, err = getSubject(stub, keySubject)

	if err != nil {
		return shim.Error("Subject does not exist!")
	}

	course.Subjects = append(course.Subjects, SubjectID)

	courseAsBytes, _ := json.Marshal(course)

	stub.PutState(keyCourse, courseAsBytes)

	return shim.Success(nil)
}

func RemoveSubjectFromCourse(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	CourseID := args[0]
	SubjectID := args[1]

	keyCourse := "Course-" + CourseID
	course, err := getCourse(stub, keyCourse)

	if err != nil {
		return shim.Error("This course doesn't eixst!")
	}

	var i int
	len := len(course.Subjects)

	for i = 0; i < len; i++ {
		if course.Subjects[i] == SubjectID {
			break
		}
	}

	copy(course.Subjects[i:], course.Subjects[i+1:])
	course.Subjects[len-1] = ""
	course.Subjects = course.Subjects[:len-1]

	courseAsBytes, _ := json.Marshal(course)

	stub.PutState(keyCourse, courseAsBytes)

	return shim.Success(nil)

}

func UpdateCourseInfo(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	CourseID := args[0]
	CourseCode := args[1]
	CourseName := args[2]
	ShortDescription := args[3]
	Description := args[4]

	keyCourse := "Course-" + CourseID
	course, err := getCourse(stub, keyCourse)

	if err != nil {

		return shim.Error("Course does not exist !")
	}

	course.CourseCode = CourseCode

	course.CourseName = CourseName

	course.ShortDescription = ShortDescription

	course.Description = Description

	courseAsBytes, _ := json.Marshal(course)

	stub.PutState(keyCourse, courseAsBytes)

	return shim.Success(nil)
}

func UpdateUserInfo(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 7 {
		return shim.Error("Incorrect number of arguments. Expecting 7")
	}

	Username := args[0]
	Fullname := args[1]
	PhoneNumber := args[2]
	Email := args[3]
	Address := args[4]
	Sex := args[5]
	Birthday := args[6]

	if MSPID == "StudentMSP" {
		keyUser := "Student-" + Username
		user, err := getStudent(stub, keyUser)

		if err != nil {

			return shim.Error("User does not exist !")

		}

		if Fullname != "" {
			user.Fullname = Fullname
		}
		if PhoneNumber != "" {
			user.Info.PhoneNumber = PhoneNumber
		}
		if Email != "" {
			user.Info.Email = Email
		}
		if Address != "" {
			user.Info.Address = Address
		}
		if Sex != "" {
			user.Info.Sex = Sex
		}
		if Birthday != "" {
			user.Info.Birthday = Birthday
		}

		userAsBytes, _ := json.Marshal(user)

		stub.PutState(keyUser, userAsBytes)

		return shim.Success(nil)
	} else {
		keyUser := "Teacher-" + Username
		user, err := getTeacher(stub, keyUser)

		if err != nil {

			return shim.Error("User does not exist !")

		}

		if Fullname != "" {
			user.Fullname = Fullname
		}
		if PhoneNumber != "" {
			user.Info.PhoneNumber = PhoneNumber
		}
		if Email != "" {
			user.Info.Email = Email
		}
		if Address != "" {
			user.Info.Address = Address
		}
		if Sex != "" {
			user.Info.Sex = Sex
		}
		if Birthday != "" {
			user.Info.Birthday = Birthday
		}

		userAsBytes, _ := json.Marshal(user)

		stub.PutState(keyUser, userAsBytes)

		return shim.Success(nil)
	}
}

func UpdateSubjectInfo(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	SubjectID := args[0]
	SubjectCode := args[1]
	SubjectName := args[2]
	ShortDescription := args[3]
	Description := args[4]

	keySubject := "Subject-" + SubjectID
	subject, err := getSubject(stub, keySubject)

	if err != nil {

		return shim.Error("Subject does not exist !")

	}

	if SubjectCode != "" {
		subject.SubjectCode = SubjectCode
	}
	if SubjectName != "" {
		subject.SubjectName = SubjectName
	}
	if ShortDescription != "" {
		subject.ShortDescription = ShortDescription
	}
	if Description != "" {
		subject.Description = Description
	}

	subjectAsBytes, _ := json.Marshal(subject)

	stub.PutState(keySubject, subjectAsBytes)

	return shim.Success(nil)
}

func UpdateUserAvatar(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	Avatar := args[0]

	Username, _, err := cid.GetAttributeValue(stub, "username")

	if err != nil {
		return shim.Error("Error - cid.GetAttributeValue()")
	}

	if MSPID == "StudentMSP" {
		keyUser := "Student-" + Username
		user, err := getStudent(stub, keyUser)

		if err != nil {

			return shim.Error("User does not exist !")

		}

		if Avatar != "" {
			user.Info.Avatar = Avatar
		}

		userAsBytes, _ := json.Marshal(user)

		stub.PutState(keyUser, userAsBytes)

		return shim.Success(nil)

	} else {
		keyUser := "Teacher-" + Username
		user, err := getTeacher(stub, keyUser)

		if err != nil {

			return shim.Error("User does not exist !")

		}

		if Avatar != "" {
			user.Info.Avatar = Avatar
		}

		userAsBytes, _ := json.Marshal(user)

		stub.PutState(keyUser, userAsBytes)

		return shim.Success(nil)

	}
}

func DeleteCourse(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	CourseID := args[0]

	keyCourse := "Course-" + CourseID
	_, err = getCourse(stub, keyCourse)

	if err != nil {

		return shim.Error("Course does not exist !")

	} else {

		stub.DelState(keyCourse)

		return shim.Success(nil)
	}
}

func QuerySubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	var SubjectID string

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	shim.Error("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	SubjectID = args[0]

	key := "Subject-" + SubjectID
	subjectAsBytes, err := stub.GetState(key)

	if err != nil {
		return shim.Error("Failed")
	}

	if subjectAsBytes == nil {
		return shim.Error("Subject does not exist - " + args[0])
	}

	return shim.Success(subjectAsBytes)
}

func QueryCourse(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	var CourseID string

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	shim.Error("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	CourseID = args[0]

	key := "Course-" + CourseID
	courseAsBytes, err := stub.GetState(key)

	if err != nil {
		return shim.Error("Failed")
	}

	if courseAsBytes == nil {
		return shim.Error("Course does not exist - " + args[0])
	}

	return shim.Success(courseAsBytes)
}

func QuerySubjectsOfCourse(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	_, err := cid.GetMSPID(stub)

	if err != nil {
		fmt.Println("Error - cid.GetMSPID()")
	}

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	CourseID := args[0]

	course, err := getCourse(stub, "Course-"+CourseID)

	if err != nil {
		return shim.Error("Course dose not exist - " + CourseID)
	}

	var tlist []Subject
	var i int

	for i = 0; i < len(course.Subjects); i++ {

		subject, err := getSubject(stub, "Subject-"+course.Subjects[i])
		if err != nil {
			return shim.Error("Subject does not exist - " + course.Subjects[i])
		}
		tlist = append(tlist, subject)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func QueryStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	shim.Error("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	Username := args[0]

	key := "Student-" + Username
	studentAsBytes, err := stub.GetState(key)

	if err != nil {
		return shim.Error("Failed")
	}

	if studentAsBytes == nil {

		return shim.Error("Student does not exits - " + args[0])

	} else {

		// infoAsBytes, err := stub.GetState("Info- Student- " + Username)

		// if err != nil {
		// 	return shim.Error("Failed")
		// }

		// if infoAsBytes == nil {
		// 	return shim.Success(studentAsBytes)
		// }

		// student := Student{}
		// json.Unmarshal(studentAsBytes, &student)
		// info := Info{}
		// json.Unmarshal(infoAsBytes, &info)
		// student.Info = info

		// jsonRow, err := json.Marshal(student)

		return shim.Success(studentAsBytes)
	}
}

func QueryTeacher(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	shim.Error("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	Username := args[0]

	key := "Teacher-" + Username
	studentAsBytes, err := stub.GetState(key)

	if err != nil {
		return shim.Error("Failed")
	}

	if studentAsBytes == nil {
		return shim.Error("Student does not exits - " + args[0])
	}

	return shim.Success(studentAsBytes)
}

func QueryScore(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	var StudentUsername string
	var SubjectID string

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID == "StudentMSP" {
		StudentUsername, _, err = cid.GetAttributeValue(stub, "username")

		if err != nil {
			shim.Error("Error - Can not Get Student")
		}

	} else if MSPID == "AcademyMSP" {
		StudentUsername = args[1]
	} else {
		shim.Error("Permission Denied!")
	}
	SubjectID = args[0]

	key := "Score-" + " " + "Subject-" + SubjectID + " " + "Student-" + StudentUsername
	scoreAsBytes, err := stub.GetState(key)

	if err != nil {
		return shim.Error("Failed")
	}

	if scoreAsBytes == nil {
		return shim.Error("Score does not exist")
	}

	return shim.Success(scoreAsBytes)
}

func QueryCertificate(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	shim.Error("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" && MSPID == "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	CertificateID := args[0]

	key := "Certificate-" + CertificateID

	certificateAsBytes, err := stub.GetState(key)

	if err != nil {
		return shim.Error("Failed")
	}

	if certificateAsBytes == nil {
		return shim.Error("Certificate does not exist")
	}

	return shim.Success(certificateAsBytes)
}

func VerifyCertificate(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "StudentMSP" && MSPID == "AcademyMSP" {
		shim.Error("Permission Denied!")
	}

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	CertificateID := args[0]
	SubjectID := args[1]
	StudentUsername := args[2]

	key := "Certificate-" + CertificateID

	certificate, err := getCertificate(stub, key)
	certificateAsBytes, _ := json.Marshal(certificate)

	if err != nil {
		fmt.Println(certificate)
		return shim.Error("Certificate does not exist !")
	} else {
		if certificate.StudentUsername == StudentUsername && certificate.SubjectID == SubjectID {
			return shim.Success(certificateAsBytes)
		} else {
			return shim.Error("Not Right!")
		}
	}
}

func GetAllSubjects(stub shim.ChaincodeStubInterface) sc.Response {

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	allSubjects, _ := getListSubjects(stub)

	defer allSubjects.Close()

	var tlist []Subject
	var i int

	for i = 0; allSubjects.HasNext(); i++ {

		record, err := allSubjects.Next()

		if err != nil {
			return shim.Success(nil)
		}

		subject := Subject{}
		json.Unmarshal(record.Value, &subject)
		tlist = append(tlist, subject)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetAllClassesOfSubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	SubjectID := args[0]

	subject, err := getSubject(stub, "Subject-"+SubjectID)

	if err != nil {
		return shim.Error("Subject dose not exist - " + SubjectID)
	}

	var tlist []Class
	var i int

	for i = 0; i < len(subject.Classes); i++ {

		class, err := getClass(stub, "Class-"+subject.Classes[i])
		if err != nil {
			return shim.Error("Class does not exist - " + subject.Classes[i])
		}
		tlist = append(tlist, class)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)

}

func GetAllCourses(stub shim.ChaincodeStubInterface) sc.Response {

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	allCourses, _ := getListCourses(stub)

	defer allCourses.Close()

	var tlist []Course
	var i int

	for i = 0; allCourses.HasNext(); i++ {

		record, err := allCourses.Next()

		if err != nil {
			return shim.Success(nil)
		}

		course := Course{}
		json.Unmarshal(record.Value, &course)
		tlist = append(tlist, course)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}
func GetAllClasses(stub shim.ChaincodeStubInterface) sc.Response {

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	allClasses, _ := getListClasses(stub)

	defer allClasses.Close()

	var tlist []Class
	var i int

	for i = 0; allClasses.HasNext(); i++ {

		record, err := allClasses.Next()

		if err != nil {
			return shim.Success(nil)
		}

		class := Class{}
		json.Unmarshal(record.Value, &class)
		tlist = append(tlist, class)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}
func GetAllStudents(stub shim.ChaincodeStubInterface) sc.Response {

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	shim.Error("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	return shim.Error("Permission Denied!")
	// }

	allStudents, _ := getListStudents(stub)

	defer allStudents.Close()

	var tlist []Student
	var i int

	for i = 0; allStudents.HasNext(); i++ {

		record, err := allStudents.Next()

		if err != nil {
			return shim.Success(nil)
		}

		student := Student{}
		json.Unmarshal(record.Value, &student)
		tlist = append(tlist, student)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetAllTeachers(stub shim.ChaincodeStubInterface) sc.Response {

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	shim.Error("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	return shim.Error("Permission Denied!")
	// }

	allTeachers, _ := getListTeachers(stub)

	defer allTeachers.Close()

	var tlist []Teacher
	var i int

	for i = 0; allTeachers.HasNext(); i++ {

		record, err := allTeachers.Next()

		if err != nil {
			return shim.Success(nil)
		}

		teacher := Teacher{}
		json.Unmarshal(record.Value, &teacher)
		tlist = append(tlist, teacher)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetAllScores(stub shim.ChaincodeStubInterface) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		shim.Error("Permission Denied!")
	}

	allScores, err := getListScores(stub)

	if err != nil {
		shim.Error("Error - Can not get all scores")
	}

	defer allScores.Close()

	var tlist []Score
	var i int

	for i = 0; allScores.HasNext(); i++ {

		record, err := allScores.Next()

		if err != nil {
			return shim.Success(nil)
		}

		score := Score{}
		json.Unmarshal(record.Value, &score)
		tlist = append(tlist, score)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetMyCerts(stub shim.ChaincodeStubInterface) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "StudentMSP" {
		return shim.Error("Permission Denied!")
	}

	StudentUsername, ok, err := cid.GetAttributeValue(stub, "username")

	if err != nil {
		return shim.Error("Error - Can not Get StudentUsername")
	}

	if !ok {
		return shim.Error("Permission Denied!")
	}

	allCertificates, err := getListCertificates(stub)

	if err != nil {
		return shim.Error("Error - Can not get all scores")
	}

	defer allCertificates.Close()

	var tlist []Certificate
	var i int

	for i = 0; allCertificates.HasNext(); i++ {

		record, err := allCertificates.Next()

		if err != nil {
			return shim.Success(nil)
		}

		certificate := Certificate{}
		json.Unmarshal(record.Value, &certificate)

		if certificate.StudentUsername == StudentUsername {
			tlist = append(tlist, certificate)
		}
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetMySubjects(stub shim.ChaincodeStubInterface) sc.Response {

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	return shim.Error("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" {
	// 	return shim.Error("Permission Denied!")
	// }

	// StudentUsername, ok, err := cid.GetAttributeValue(stub, "username")

	// if err != nil {
	// 	return shim.Error("Error - Can not Get StudentUsername")
	// }

	// if !ok {
	// 	return shim.Error("Permission Denied!")
	// }

	// student, err := getStudent(stub, "Student-"+StudentUsername)

	// if err != nil {
	// 	return shim.Error("Student dose not exist - " + StudentUsername)
	// }

	// var tlist []Subject
	// var i int

	// for i = 0; i < len(student.Subjects); i++ {

	// 	subject, err := getSubject(stub, "Subject-"+student.Subjects[i])
	// 	if err != nil {
	// 		return shim.Error("Subject does not exist - " + student.Subjects[i])
	// 	}
	// 	subject.Students = nil
	// 	tlist = append(tlist, subject)
	// }

	// jsonRow, err := json.Marshal(tlist)

	// if err != nil {
	// 	return shim.Error("Failed")
	// }

	// return shim.Success(jsonRow)
	return shim.Success(nil)
}

func GetMyScores(stub shim.ChaincodeStubInterface) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "StudentMSP" {
		return shim.Error("Permission Denied!")
	}

	StudentUsername, ok, err := cid.GetAttributeValue(stub, "username")

	if err != nil {
		return shim.Error("Error - Can not Get StudentUsername")
	}

	if !ok {
		return shim.Error("Permission Denied!")
	}

	allScores, err := getListScores(stub)

	if err != nil {
		return shim.Error("Error - Can not get all scores")
	}

	defer allScores.Close()

	var tlist []Score
	var i int

	for i = 0; allScores.HasNext(); i++ {

		record, err := allScores.Next()

		if err != nil {
			return shim.Success(nil)
		}

		score := Score{}
		json.Unmarshal(record.Value, &score)

		if score.StudentUsername == StudentUsername {
			tlist = append(tlist, score)
		}
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetSubjectsByStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	// if len(args) != 1 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 1")
	// }

	// StudentUsername := args[0]

	// student, err := getStudent(stub, "Student-"+StudentUsername)

	// if err != nil {
	// 	return shim.Error("Student dose not exist - " + StudentUsername)
	// }

	// var tlist []Subject
	// var i int

	// for i = 0; i < len(student.Subjects); i++ {

	// 	subject, err := getSubject(stub, "Subject-"+student.Subjects[i])
	// 	if err != nil {
	// 		return shim.Error("Subject does not exist - " + student.Subjects[i])
	// 	}
	// 	subject.Students = nil
	// 	tlist = append(tlist, subject)
	// }

	// jsonRow, err := json.Marshal(tlist)

	// if err != nil {
	// 	return shim.Error("Failed")
	// }

	// return shim.Success(jsonRow)

	return shim.Success(nil)
}

func GetCertificatesByStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	StudentUsername := args[0]

	_, err := getStudent(stub, "Student-"+StudentUsername)

	if err != nil {
		return shim.Error("Student dose not exist - " + StudentUsername)
	}

	allCertificates, _ := getListCertificates(stub)

	defer allCertificates.Close()

	var tlist []Certificate
	var i int

	for i = 0; allCertificates.HasNext(); i++ {

		record, err := allCertificates.Next()

		if err != nil {
			return shim.Success(nil)
		}

		certificate := Certificate{}
		json.Unmarshal(record.Value, &certificate)
		if certificate.StudentUsername == StudentUsername {
			tlist = append(tlist, certificate)
		}
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetScoresByStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	StudentUsername := args[0]

	_, err := getStudent(stub, "Student-"+StudentUsername)

	if err != nil {
		return shim.Error("Student dose not exist - " + StudentUsername)
	}

	allScores, _ := getListScores(stub)

	defer allScores.Close()

	var tlist []Score
	var i int

	for i = 0; allScores.HasNext(); i++ {

		record, err := allScores.Next()

		if err != nil {
			return shim.Success(nil)
		}

		score := Score{}
		json.Unmarshal(record.Value, &score)
		if score.StudentUsername == StudentUsername {
			tlist = append(tlist, score)
		}
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetSubjectsByTeacher(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	// if len(args) != 1 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 1")
	// }

	// TeacherUsername := args[0]

	// allSubjects, _ := getListSubjects(stub)

	// defer allSubjects.Close()

	// var tlist []Subject
	// var i int

	// for i = 0; allSubjects.HasNext(); i++ {

	// 	record, err := allSubjects.Next()

	// 	if err != nil {
	// 		return shim.Success(nil)
	// 	}

	// 	subject := Subject{}
	// 	json.Unmarshal(record.Value, &subject)
	// 	if subject.TeacherUsername == TeacherUsername {
	// 		tlist = append(tlist, subject)
	// 	}
	// }

	// jsonRow, err := json.Marshal(tlist)

	// if err != nil {
	// 	return shim.Error("Failed")
	// }

	// return shim.Success(jsonRow)

	return shim.Success(nil)
}

func GetScoresBySubjectOfTeacher(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	// if len(args) != 1 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 1")
	// }

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	return shim.Error("Permission Denied!")
	// }

	// TeacherUsername, ok, err := cid.GetAttributeValue(stub, "username")

	// if err != nil {
	// 	return shim.Error("Error - Can not Get TeacherUsername")
	// }

	// if !ok {
	// 	return shim.Error("Permission Denied!")
	// }

	// _, err = getTeacher(stub, "Teacher-"+TeacherUsername)

	// if err != nil {
	// 	return shim.Error("Error - Teacher Does not exist !")
	// }

	// SubjectID := args[0]

	// subject, err := getSubject(stub, "Subject-"+SubjectID)

	// if err != nil {
	// 	return shim.Error("Subject dose not exist - " + SubjectID)
	// }

	// if subject.TeacherUsername != TeacherUsername {
	// 	return shim.Error("Permission Denied!")
	// }

	// allScores, _ := getListScores(stub)

	// defer allScores.Close()

	// var tlist []Score
	// var i int

	// for i = 0; allScores.HasNext(); i++ {

	// 	record, err := allScores.Next()

	// 	if err != nil {
	// 		return shim.Success(nil)
	// 	}

	// 	score := Score{}
	// 	json.Unmarshal(record.Value, &score)
	// 	if score.SubjectID == SubjectID {
	// 		tlist = append(tlist, score)
	// 	}
	// }

	// jsonRow, err := json.Marshal(tlist)

	// if err != nil {
	// 	return shim.Error("Failed")
	// }

	// return shim.Success(jsonRow)
	return shim.Success(nil)
}

func GetStudentsBySubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	// if len(args) != 1 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 1")
	// }

	// SubjectID := args[0]

	// subject, err := getSubject(stub, "Subject-"+SubjectID)

	// if err != nil {
	// 	return shim.Error("Subject dose not exist - " + SubjectID)
	// }

	// var tlist []Student
	// var i int

	// for i = 0; i < len(subject.Students); i++ {

	// 	student, err := getStudent(stub, "Student-"+subject.Students[i])
	// 	if err != nil {
	// 		return shim.Error("Student dose not exist - " + subject.Students[i])
	// 	}
	// 	student.Subjects = nil
	// 	tlist = append(tlist, student)
	// }

	// jsonRow, err := json.Marshal(tlist)

	// if err != nil {
	// 	return shim.Error("Failed")
	// }

	// return shim.Success(jsonRow)
	return shim.Success(nil)
}

func GetCertificatesBySubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	SubjectID := args[0]

	_, err := getSubject(stub, "Subject-"+SubjectID)

	if err != nil {
		return shim.Error("Subject dose not exist - " + SubjectID)
	}

	allCertificates, _ := getListCertificates(stub)

	defer allCertificates.Close()

	var tlist []Certificate
	var i int

	for i = 0; allCertificates.HasNext(); i++ {

		record, err := allCertificates.Next()

		if err != nil {
			return shim.Success(nil)
		}

		certificate := Certificate{}
		json.Unmarshal(record.Value, &certificate)
		if certificate.SubjectID == SubjectID {
			tlist = append(tlist, certificate)
		}
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetScoresBySubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	shim.Error("Permission Denied!")
	// }

	SubjectID := args[0]

	_, err := getSubject(stub, "Subject-"+SubjectID)

	if err != nil {
		return shim.Error("Subject dose not exist - " + SubjectID)
	}

	allScores, _ := getListScores(stub)

	defer allScores.Close()

	var tlist []Score
	var i int

	for i = 0; allScores.HasNext(); i++ {

		record, err := allScores.Next()

		if err != nil {
			return shim.Success(nil)
		}

		score := Score{}
		json.Unmarshal(record.Value, &score)
		if score.SubjectID == SubjectID {
			tlist = append(tlist, score)
		}
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func main() {

	err := shim.Start(new(SmartContract))

	if err != nil {
		fmt.Printf("Error createing new Smart Contract: %s", err)
	}
}
