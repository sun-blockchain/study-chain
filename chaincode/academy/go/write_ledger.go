package main

import (
	"encoding/json"

	"fmt"

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
		return shim.Error("WHO ARE YOU")
	}

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	fmt.Println("Start Create Student!")

	Username := args[0]
	Fullname := args[1]

	key := "Teacher-" + Username
	checkTeacherExist, err := getTeacher(stub, key)

	if err == nil {
		fmt.Println(checkTeacherExist)
		return shim.Error("This teacher already exists - " + Username)
	}

	var teacher = Teacher{Username: Username, Fullname: Fullname, Subjects: nil}

	studentAsBytes, _ := json.Marshal(teacher)

	stub.PutState(key, studentAsBytes)

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

	var course = Course{CourseID: CourseID, CourseCode: CourseCode, CourseName: CourseName, ShortDescription: ShortDescription, Description: Description}

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
		return shim.Error("WHO ARE YOU")
	}

	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments. Expecting 6")
	}

	fmt.Println("Start Create Class!")

	ClassID := args[0]
	ClassCode := args[1]
	Room := args[2]
	Time := args[3]
	ShortDescription := args[4]
	Description := args[5]

	keyClass := "Class-" + ClassID
	checkClassExist, err := getClass(stub, keyClass)

	if err == nil {
		fmt.Println(checkClassExist)
		return shim.Error("This class already exists - " + ClassID)
	}

	var class = Class{ClassID: ClassID, ClassCode: ClassCode, Room: Room,Time: Time, status:true, ShortDescription: ShortDescription, Description: Description, Students: nil}

	classAsBytes, _ := json.Marshal(class)

	stub.PutState(keyClass, classAsBytes)

	return shim.Success(nil)
}
func CreateScore(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cide.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	return shim.Error("You Are Not Teacher!")
	// }

	// TeacherUsername, found, err := cid.GetAttributeValue(stub, "username")

	// if err != nil {
	// 	return shim.Error("Error - cide.GetMSPID()?")
	// }

	// if !found {
	// 	return shim.Error("WHO ARE YOU ?")
	// }

	// fmt.Println("Start Create Score!")

	// if len(args) != 3 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 3")
	// }

	// SubjectID := args[0]
	// StudentUsername := args[1]
	// ScoreValue, err := strconv.ParseFloat(args[2], 64)

	// checkStudentExist, err := getStudent(stub, "Student-"+StudentUsername)

	// if err != nil {
	// 	fmt.Println(checkStudentExist)
	// 	return shim.Error("Student dose not exist - " + StudentUsername)
	// }

	// checkSubjectExist, err := getSubject(stub, "Subject-"+SubjectID)

	// if err != nil {
	// 	fmt.Println(checkSubjectExist)
	// 	return shim.Error("Subject does not exist - " + SubjectID)
	// }

	// if checkSubjectExist.TeacherUsername != TeacherUsername {
	// 	return shim.Error("WHO ARE YOU ?")
	// }

	// key := "Score-" + " " + "Subject-" + SubjectID + " " + "Student-" + StudentUsername
	// checkScoreExist, err := getScore(stub, key)

	// if err == nil {
	// 	fmt.Println(checkScoreExist)
	// 	return shim.Error("This score already exists.")
	// }

	// var score = Score{SubjectID: SubjectID, StudentUsername: StudentUsername, ScoreValue: ScoreValue, Certificated: false}

	// scoreAsBytes, _ := json.Marshal(score)

	// stub.PutState(key, scoreAsBytes)

	return shim.Success(nil)
}

func CreateCertificate(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("You Are Not Teacher!")
	}

	fmt.Println("Start Create Certificate!")

	if len(args) != 4 {
		return shim.Error("Incorrecr")
	}

	CertificateID := args[0]
	SubjectID := args[1]
	StudentUsername := args[2]
	IssueDate := args[3]

	keyCertificate := "Certificate-" + CertificateID

	keyScore := "Score-" + " " + "Subject-" + SubjectID + " " + "Student-" + StudentUsername

	score, err := getScore(stub, keyScore)

	if err != nil {

		return shim.Error("Score dose not exist")

	} else {

		score.Certificated = true

		scoreAsBytes, _ := json.Marshal(score)

		stub.PutState(keyScore, scoreAsBytes)

		var certificate = Certificate{CertificateID: CertificateID, StudentUsername: StudentUsername, SubjectID: SubjectID, IssueDate: IssueDate}

		certificateAsBytes, _ := json.Marshal(certificate)

		stub.PutState(keyCertificate, certificateAsBytes)

		return shim.Success(nil)
	}
}
