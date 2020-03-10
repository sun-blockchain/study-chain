package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

func CreateStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	return shim.Error("Error - cide.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" {
	// 	return shim.Error("WHO ARE YOU")
	// }

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	fmt.Println("Start Create Student!")

	Username := args[0]
	Fullname := args[1]

	key := "Student-" + Username
	checkStudentExist, err := getStudent(stub, key)

	if err == nil {
		fmt.Println(checkStudentExist)
		return shim.Error("This student already exists - " + Username)
	}

	var student = Student{Username: Username, Fullname: Fullname}

	studentAsBytes, _ := json.Marshal(student)

	stub.PutState(key, studentAsBytes)

	return shim.Success(nil)
}

func CreateTeacher(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission denied!")
	}

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	fmt.Println("Start Create Teacher!")

	Username := args[0]
	Fullname := args[1]

	key := "Teacher-" + Username
	checkTeacherExist, err := getTeacher(stub, key)

	if err == nil {
		fmt.Println(checkTeacherExist)
		return shim.Error("This teacher already exists - " + Username)
	}

	var teacher = Teacher{Username: Username, Fullname: Fullname}

	teacherAsBytes, _ := json.Marshal(teacher)

	stub.PutState(key, teacherAsBytes)

	return shim.Success(nil)
}

func CreateSubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("WHO ARE YOU")
	}

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	fmt.Println("Start Create Subject!")

	SubjectID := args[0]
	SubjectCode := args[1]
	SubjectName := args[2]
	ShortDescription := args[3]
	Description := args[4]

	keySubject := "Subject-" + SubjectID
	checkSubjectExist, err := getSubject(stub, keySubject)

	if err == nil {
		fmt.Println(checkSubjectExist)
		return shim.Error("This subject already exists - " + SubjectID)
	}

	var subject = Subject{SubjectID: SubjectID, SubjectCode: SubjectCode, SubjectName: SubjectName, ShortDescription: ShortDescription, Description: Description}

	subjectAsBytes, _ := json.Marshal(subject)

	stub.PutState(keySubject, subjectAsBytes)

	return shim.Success(nil)
}

func CreateCourse(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("WHO ARE YOU")
	}

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	fmt.Println("Start Create Subject!")

	CourseID := args[0]
	CourseCode := args[1]
	CourseName := args[2]
	ShortDescription := args[3]
	Description := args[4]

	keyCourse := "Course-" + CourseID
	checkCourseExist, err := getCourse(stub, keyCourse)

	if err == nil {
		fmt.Println(checkCourseExist)
		return shim.Error("This course already exists - " + CourseID)
	}

	var course = Course{CourseID: CourseID, CourseCode: CourseCode, CourseName: CourseName, ShortDescription: ShortDescription, Description: Description, Status: Open}

	courseAsBytes, _ := json.Marshal(course)

	stub.PutState(keyCourse, courseAsBytes)

	return shim.Success(nil)
}

func CreateClass(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission denied!")
	}

	if len(args) != 9 {
		return shim.Error("Incorrect number of arguments. Expecting 9")
	}

	fmt.Println("Start Create Class!")

	ClassID := args[0]
	ClassCode := args[1]
	Room := args[2]
	Time := args[3]
	StartDate := args[4]
	EndDate := args[5]
	Repeat := args[6]
	SubjectID := args[7]
	Capacity := args[8]

	CapacityInt, err := strconv.ParseUint(Capacity, 10, 64)

	if err != nil {
		return shim.Error("Convert Capacity To Integer Failed")
	}

	keyClass := "Class-" + ClassID
	checkClassExist, err := getClass(stub, keyClass)

	if err == nil {
		fmt.Println(checkClassExist)
		return shim.Error("This class already exists - " + ClassID)
	}

	keySubject := "Subject-" + SubjectID
	subject, err := getSubject(stub, keySubject)

	if err != nil {
		return shim.Error("This subject does not exists - " + SubjectID)
	}

	var class = Class{ClassID: ClassID, SubjectID: SubjectID, ClassCode: ClassCode, Room: Room, Time: Time, StartDate: StartDate, EndDate: EndDate, Repeat: Repeat, Status: Open, Capacity: CapacityInt}

	classAsBytes, _ := json.Marshal(class)

	stub.PutState(keyClass, classAsBytes)

	subject.Classes = append(subject.Classes, ClassID)

	subjectAsBytes, _ := json.Marshal(subject)

	stub.PutState(keySubject, subjectAsBytes)

	return shim.Success(nil)
}

func CreateScore(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		fmt.Println("Error - cide.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if err != nil {
		return shim.Error("Error - cide.GetMSPID()?")
	}

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	Teacher := args[0]
	ClassID := args[1]
	Student := args[2]
	ScoreValue, err := strconv.ParseFloat(args[3], 64)

	if err != nil {
		return shim.Error("Failed convert string to float")
	}

	_, err = getStudent(stub, "Student-"+Student)

	if err != nil {
		return shim.Error("Student does not exist - " + Student)
	}

	class, err := getClass(stub, "Class-"+ClassID)

	if err != nil {
		return shim.Error("Class does not exist - " + ClassID)
	}

	if class.TeacherUsername != Teacher {
		return shim.Error("Permission Denied!")
	}

	if class.Status != InProgress {
		return shim.Error("Can not entry score now!")
	}

	var checkExist = false
	var i int
	for i = 0; i < len(class.Students); i++ {
		if class.Students[i] == Student {
			checkExist = true
			break
		}
	}

	if !checkExist {
		return shim.Error("The student does not study in this class!")
	}

	SubjectID := class.SubjectID

	keyScore := "Score-" + " " + "Subject-" + SubjectID + " " + "Student-" + Student
	_, err = getScore(stub, keyScore)

	if err == nil {
		return shim.Error("This score already exists.")
	}

	var score = Score{SubjectID: SubjectID, StudentUsername: Student, ScoreValue: ScoreValue}

	scoreAsBytes, err := json.Marshal(score)

	if err != nil {
		return shim.Error("Can not convert data to bytes!")
	}

	stub.PutState(keyScore, scoreAsBytes)

	return shim.Success(nil)
}

func CreateCertificate(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID != "StudentMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	CertificateID := args[0]
	CourseID := args[1]
	StudentUsername := args[2]
	IssueDate := args[3]

	keyCertificate := "Certificate-" + CertificateID

	_, err = getCertificate(stub, keyCertificate)

	// truong hop uuidv4() sinh bi trung
	if err == nil {
		return shim.Error("This CertificateID already exists!")
	}

	keyCourse := "Course-" + CourseID
	course, err := getCourse(stub, keyCourse)

	if err != nil {
		return shim.Error("This course does not exist!")
	}

	keyStudent := "Student-" + StudentUsername
	student, err := getStudent(stub, keyStudent)
	if err != nil {
		return shim.Error("Student does not exist!")
	}

	var i int
	for i = 0; i < len(student.Certificates); i++ {
		key := "Certificate-" + student.Certificates[i]
		cert, err := getCertificate(stub, key)
		if err != nil {
			return shim.Error("Can not query chaincode!")
		}

		if cert.CourseID == CourseID {
			return shim.Error("Certificate already exist!")
		}
	}

	var checkExist = false
	for i = 0; i < len(course.Students); i++ {
		if course.Students[i] == StudentUsername {
			checkExist = true
			break
		}
	}

	if !checkExist {
		return shim.Error("You have not studied this course yet!")
	}

	// kiem tra da du diem cac mon hoc cua course day hay chua
	for i = 0; i < len(course.Subjects); i++ {
		keyScore := "Score-" + " " + "Subject-" + course.Subjects[i] + " " + "Student-" + StudentUsername
		_, err = getScore(stub, keyScore)
		if err != nil {
			return shim.Error("You have not completed all subjects in course yet!")
		}
	}

	student.Certificates = append(student.Certificates, CertificateID)
	studentAsBytes, err := json.Marshal(student)
	if err != nil {
		return shim.Error("Can not convert data to bytes!")
	}

	var certificate = Certificate{CertificateID: CertificateID, CourseID: CourseID, StudentUsername: StudentUsername, IssueDate: IssueDate}

	certificateAsBytes, err := json.Marshal(certificate)
	if err != nil {
		return shim.Error("Can not convert data to bytes!")
	}

	stub.PutState(keyCertificate, certificateAsBytes)
	stub.PutState(keyStudent, studentAsBytes)

	return shim.Success(nil)
}
