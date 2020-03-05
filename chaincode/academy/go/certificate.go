package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type ClassStatus string

const (
	Open      ClassStatus = "Open"
	Closed    ClassStatus = "Closed"
	Completed ClassStatus = "Completed"
)

type Course struct {
	CourseID         string
	CourseCode       string
	CourseName       string
	ShortDescription string
	Description      string
	Subjects         []string
	Students         []string
}

type Subject struct {
	SubjectID        string
	SubjectCode      string
	SubjectName      string
	ShortDescription string
	Description      string
	Classes          []string
}

type Class struct {
	ClassID         string
	SubjectID       string
	ClassCode       string
	Room            string
	Time            string
	Status          ClassStatus
	StartDate       string
	EndDate         string
	Repeat          string
	Students        []string
	Capacity        uint64
	TeacherUsername string
}

type Teacher struct {
	Username string
	Fullname string
	Info     Information
	Classes  []string
}

type Student struct {
	Username     string
	Fullname     string
	Info         Information
	Courses      []string
	Classes      []string
	Certificates []string
}

type Information struct {
	PhoneNumber string
	Email       string
	Address     string
	Sex         string
	Birthday    string
	Avatar      string
	Country     string
}

type Score struct {
	SubjectID       string
	StudentUsername string
	ScoreValue      float64
}

type Certificate struct {
	CertificateID   string
	CourseID        string
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
	} else if function == "GetSubject" {
		return GetSubject(stub, args)
	} else if function == "GetSubjectsOfCourse" {
		return GetSubjectsOfCourse(stub, args)
	} else if function == "GetStudent" {
		return GetStudent(stub, args)
	} else if function == "GetTeacher" {
		return GetTeacher(stub, args)
	} else if function == "GetCertificate" {
		return GetCertificate(stub, args)
	} else if function == "GetAllSubjects" {
		return GetAllSubjects(stub)
	} else if function == "GetClassesOfSubject" {
		return GetClassesOfSubject(stub, args)
	} else if function == "GetAllClasses" {
		return GetAllClasses(stub)
	} else if function == "GetStudentsOfClass" {
		return GetStudentsOfClass(stub, args)
	} else if function == "GetAllStudents" {
		return GetAllStudents(stub)
	} else if function == "GetAllTeachers" {
		return GetAllTeachers(stub)
	} else if function == "GetAllScores" {
		return GetAllScores(stub)
	} else if function == "GetAllCertificates" {
		return GetAllCertificates(stub)
	} else if function == "StudentRegisterCourse" {
		return StudentRegisterCourse(stub, args)
	} else if function == "StudentRegisterClass" {
		return StudentRegisterClass(stub, args)
	} else if function == "StudentCancelRegisterClass" {
		return StudentCancelRegisterClass(stub, args)
	} else if function == "GetScoresByStudent" {
		return GetScoresByStudent(stub, args)
	} else if function == "GetClassesByTeacher" {
		return GetClassesByTeacher(stub, args)
	} else if function == "CreateCourse" {
		return CreateCourse(stub, args)
	} else if function == "GetCourse" {
		return GetCourse(stub, args)
	} else if function == "GetAllCourses" {
		return GetAllCourses(stub)
	} else if function == "UpdateCourseInfo" {
		return UpdateCourseInfo(stub, args)
	} else if function == "UpdateClassInfo" {
		return UpdateClassInfo(stub, args)
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
	} else if function == "AddClassToTeacher" {
		return AddClassToTeacher(stub, args)
	} else if function == "RemoveSubjectFromCourse" {
		return RemoveSubjectFromCourse(stub, args)
	} else if function == "DeleteSubject" {
		return DeleteSubject(stub, args)
	} else if function == "CloseRegisterClass" {
		return CloseRegisterClass(stub, args)
	} else if function == "GetClass" {
		return GetClass(stub, args)
	} else if function == "GetClassesOfStudent" {
		return GetClassesOfStudent(stub, args)
	} else if function == "GetCoursesOfStudent" {
		return GetCoursesOfStudent(stub, args)
	} else if function == "DeleteClass" {
		return DeleteClass(stub, args)
	} else if function == "GetStudentsOfCourse" {
		return GetStudentsOfCourse(stub, args)
	} else if function == "GetCertificatesOfStudent" {
		return GetCertificatesOfStudent(stub, args)
	}

	return shim.Error("Invalid Smart Contract function name!")
}

func StudentRegisterClass(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "StudentMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	Student := args[0]
	ClassID := args[1]

	keyStudent := "Student-" + Student
	keyClass := "Class-" + ClassID

	student, err := getStudent(stub, keyStudent)

	if err != nil {
		return shim.Error("Student does not exist!")
	}

	class, err := getClass(stub, keyClass)

	if err != nil {
		return shim.Error("Class does not exist!")
	}

	if class.Status == Completed {
		return shim.Error("This class was completed!")
	}

	if class.Status == Closed {
		return shim.Error("Class register closed!")
	}

	var i int
	for i = 0; i < len(student.Classes); i++ {
		if ClassID == student.Classes[i] {
			return shim.Error("You registered this class!")
		}

		classInfo, _ := getClass(stub, "Class-"+student.Classes[i])
		if classInfo.SubjectID == class.SubjectID {
			return shim.Error("You studied this subject!")
		}
	}

	if uint64(len(class.Students)) >= class.Capacity {
		return shim.Error("This class is full!")
	}

	class.Students = append(class.Students, Student)
	student.Classes = append(student.Classes, ClassID)

	classAsBytes, _ := json.Marshal(class)
	studentAsBytes, _ := json.Marshal(student)

	stub.PutState(keyClass, classAsBytes)
	stub.PutState(keyStudent, studentAsBytes)

	return shim.Success(nil)
}

func StudentCancelRegisterClass(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "StudentMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	Username := args[0]
	ClassID := args[1]

	keyStudent := "Student-" + Username
	keyClass := "Class-" + ClassID

	student, err := getStudent(stub, keyStudent)

	if err != nil {
		return shim.Error("Student does not exist!")
	}

	class, err := getClass(stub, keyClass)

	if err != nil {
		return shim.Error("Class does not exist!")
	}

	if class.Status != Open {
		return shim.Error("Can not cancel register!")
	}

	var i int
	var lenStudent = len(class.Students)
	var checkExist = false
	for i = 0; i < lenStudent; i++ {
		if class.Students[i] == Username {
			checkExist = true
			break
		}
	}

	if !checkExist {
		return shim.Error("You have not registed this class yet!")
	}

	copy(class.Students[i:], class.Students[i+1:])
	class.Students[lenStudent-1] = ""
	class.Students = class.Students[:lenStudent-1]

	var lenClasses = len(student.Classes)
	for i = 0; i < lenClasses; i++ {
		if student.Classes[i] == ClassID {
			break
		}
	}

	copy(student.Classes[i:], student.Classes[i+1:])
	student.Classes[lenClasses-1] = ""
	student.Classes = student.Classes[:lenClasses-1]

	classAsBytes, err := json.Marshal(class)
	if err != nil {
		return shim.Error("Can not convert data to bytes!")
	}

	studentAsBytes, err := json.Marshal(student)
	if err != nil {
		return shim.Error("Can not convert data to bytes!")
	}

	stub.PutState(keyClass, classAsBytes)
	stub.PutState(keyStudent, studentAsBytes)

	return shim.Success(nil)
}

func StudentRegisterCourse(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "StudentMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	Username := args[0]
	CourseID := args[1]

	keyStudent := "Student-" + Username
	keyCourse := "Course-" + CourseID

	student, err := getStudent(stub, keyStudent)
	if err != nil {
		return shim.Error("Student does not exist!")
	}

	course, err := getCourse(stub, keyCourse)
	if err != nil {
		return shim.Error("Course does not exist!")
	}

	var i int
	for i = 0; i < len(student.Courses); i++ {
		if CourseID == student.Courses[i] {
			return shim.Error("You studied this course!")
		}
	}

	student.Courses = append(student.Courses, CourseID)
	course.Students = append(course.Students, Username)

	studentAsBytes, err := json.Marshal(student)
	if err != nil {
		return shim.Error("Can not convert data to bytes")
	}

	courseAsBytes, err := json.Marshal(course)
	if err != nil {
		return shim.Error("Can not convert data to bytes")
	}

	stub.PutState(keyStudent, studentAsBytes)
	stub.PutState(keyCourse, courseAsBytes)

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

func AddClassToTeacher(stub shim.ChaincodeStubInterface, args []string) sc.Response {

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

	ClassID := args[0]
	Username := args[1]

	keyUser := "Teacher-" + Username
	user, err := getTeacher(stub, keyUser)

	if err != nil {
		return shim.Error("Teacher does not exist!")
	}

	keyClass := "Class-" + ClassID
	class, err := getClass(stub, keyClass)

	if err != nil {
		return shim.Error("Class does not exist!")
	}

	for _, id := range user.Classes {
		if id == ClassID {
			return shim.Error("The class has been added!")
		}
	}

	user.Classes = append(user.Classes, ClassID)
	class.TeacherUsername = Username

	userAsBytes, errUser := json.Marshal(user)
	classAsBytes, errClass := json.Marshal(class)
	if errUser != nil || errClass != nil {
		return shim.Error("Cannot json encode add class to teacher")
	}
	stub.PutState(keyUser, userAsBytes)
	stub.PutState(keyClass, classAsBytes)

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

func DeleteClass(stub shim.ChaincodeStubInterface, args []string) sc.Response {
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

	ClassID := args[0]

	keyClass := "Class-" + ClassID

	class, err := getClass(stub, keyClass)
	if err != nil {
		return shim.Error("This class does not exist!")
	}

	if class.Status != Open {
		return shim.Error("Can not delete this class now!")
	}

	var i int
	for i = 0; i < len(class.Students); i++ {
		keyStudent := "Student-" + class.Students[i]
		student, err := getStudent(stub, keyStudent)
		var j int
		var lenClasses = len(student.Classes)
		for j = 0; j < lenClasses; j++ {
			if student.Classes[j] == ClassID {
				break
			}
		}
		copy(student.Classes[j:], student.Classes[j+1:])
		student.Classes[lenClasses-1] = ""
		student.Classes = student.Classes[:lenClasses-1]

		studentAsBytes, err := json.Marshal(student)
		if err != nil {
			return shim.Error("Can not conver data to bytes!")
		}
		stub.PutState(keyStudent, studentAsBytes)
	}

	keySubject := "Subject-" + class.SubjectID
	subject, err := getSubject(stub, keySubject)

	if err != nil {
		return shim.Error("This subject doesn't eixst!")
	}

	len := len(subject.Classes)
	for i = 0; i < len; i++ {
		if subject.Classes[i] == ClassID {
			break
		}
	}

	copy(subject.Classes[i:], subject.Classes[i+1:])
	subject.Classes[len-1] = ""
	subject.Classes = subject.Classes[:len-1]

	keyTeacher := "Teacher-" + class.TeacherUsername
	teacher, err := getTeacher(stub, keyTeacher)
	if err != nil {
		return shim.Error("Teacher does not eixst!")
	}

	len = len(teacher.Classes)
	for i = 0; i < len; i++ {
		if subject.Classes[i] == ClassID {
			break
		}
	}

	copy(teacher.Classes[i:], teacher.Classes[i+1:])
	teacher.Classes[len-1] = ""
	teacher.Classes = teacher.Classes[:len-1]

	subjectAsBytes, err := json.Marshal(subject)
	if err != nil {
		return shim.Error("Can not convert data to bytes!")
	}

	teacherAsBytes, err := json.Marshal(teacher)
	if err != nil {
		return shim.Error("Can not convert data to bytes!")
	}

	stub.PutState(keyTeacher, teacherAsBytes)
	stub.PutState(keySubject, subjectAsBytes)
	stub.DelState(keyClass)

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

func UpdateClassInfo(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 8 {
		return shim.Error("Incorrect number of arguments. Expecting 8")
	}

	ClassID := args[0]
	ClassCode := args[1]
	Room := args[2]
	Time := args[3]
	StartDate := args[4]
	EndDate := args[5]
	Repeat := args[6]
	Capacity := args[7]

	CapacityInt, err := strconv.ParseUint(Capacity, 10, 64)

	keyClass := "Class-" + ClassID
	class, err := getClass(stub, keyClass)

	if err != nil {

		return shim.Error("Class does not exist !")
	}

	class.ClassCode = ClassCode

	class.Room = Room

	class.Time = Time

	class.StartDate = StartDate

	class.EndDate = EndDate

	class.Repeat = Repeat

	class.Capacity = CapacityInt

	classAsBytes, _ := json.Marshal(class)

	stub.PutState(keyClass, classAsBytes)

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

	if len(args) != 8 {
		return shim.Error("Incorrect number of arguments. Expecting 8")
	}

	Username := args[0]
	Fullname := args[1]
	PhoneNumber := args[2]
	Email := args[3]
	Address := args[4]
	Sex := args[5]
	Birthday := args[6]
	Country := args[7]

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
		if Country != "" {
			user.Info.Country = Country
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
		if Country != "" {
			user.Info.Country = Country
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

	}

	stub.DelState(keyCourse)

	return shim.Success(nil)
}

func DeleteSubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()!")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1!")
	}

	SubjectID := args[0]

	keySubject := "Subject-" + SubjectID
	subject, err := getSubject(stub, keySubject)

	if err != nil {

		return shim.Error("Subject does not exist!")
	}

	if len(subject.Classes) > 0 {
		return shim.Error("Can not delete subject - " + SubjectID)
	}

	stub.DelState(keySubject)

	return shim.Success(nil)

}

func CloseRegisterClass(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()!")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("Permission Denied!")
	}

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1!")
	}

	ClassID := args[0]
	keyClass := "Class-" + ClassID

	class, err := getClass(stub, keyClass)
	if err != nil {
		return shim.Error("This class does not exist!")
	}

	if class.Status != Open {
		return shim.Error("Can not close register!")
	}

	class.Status = Closed

	classAsBytes, _ := json.Marshal(class)

	stub.PutState(keyClass, classAsBytes)

	return shim.Success(nil)
}

func GetSubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {

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

func GetClass(stub shim.ChaincodeStubInterface, args []string) sc.Response {

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

	ClassID := args[0]

	key := "Class-" + ClassID
	classAsBytes, err := stub.GetState(key)

	if err != nil {
		return shim.Error("Failed")
	}

	if classAsBytes == nil {
		return shim.Error("Class does not exist - " + args[0])
	}

	return shim.Success(classAsBytes)
}

func GetCourse(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	var CourseID string

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

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

func GetCertificate(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	CertificateID := args[0]

	key := "Certificate-" + CertificateID
	certificateAsBytes, err := stub.GetState(key)

	if err != nil {
		return shim.Error("Failed to get data in the ledger")
	}

	if certificateAsBytes == nil {
		return shim.Error("Certificate does not exist - " + args[0])
	}

	return shim.Success(certificateAsBytes)
}

func GetSubjectsOfCourse(stub shim.ChaincodeStubInterface, args []string) sc.Response {

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

func GetStudentsOfCourse(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		shim.Error("Permission Denied!")
	}

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	CourseID := args[0]

	course, err := getCourse(stub, "Course-"+CourseID)

	if err != nil {
		return shim.Error("Course dose not exist - " + CourseID)
	}

	var tlist []Student
	var i int

	for i = 0; i < len(course.Students); i++ {

		student, err := getStudent(stub, "Student-"+course.Students[i])
		if err != nil {
			return shim.Error("Student does not exist - " + course.Students[i])
		}
		tlist = append(tlist, student)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Can not convert data to bytes!")
	}

	return shim.Success(jsonRow)
}

func GetCertificatesOfStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	StudentUsername := args[0]

	student, err := getStudent(stub, "Student-"+StudentUsername)

	if err != nil {
		return shim.Error("Student dose not exist - " + StudentUsername)
	}

	var tlist []Certificate
	var i int

	for i = 0; i < len(student.Certificates); i++ {

		certificate, err := getCertificate(stub, "Certificate-"+student.Certificates[i])
		if err != nil {
			return shim.Error("Certificate does not exist - " + student.Certificates[i])
		}
		tlist = append(tlist, certificate)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Can not convert data to bytes!")
	}

	return shim.Success(jsonRow)
}

func GetStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {

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

func GetTeacher(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		shim.Error("Permission Denied!")
	}

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	Username := args[0]

	key := "Teacher-" + Username
	teacherAsBytes, err := stub.GetState(key)

	if err != nil {
		return shim.Error("Failed")
	}

	if teacherAsBytes == nil {
		return shim.Error("Teacher does not exits - " + args[0])
	}

	return shim.Success(teacherAsBytes)
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

func GetClassesOfSubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {

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

func GetStudentsOfClass(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID == "StudentMSP" {
		return shim.Error("Permission denied!")
	}

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	ClassID := args[0]

	class, err := getClass(stub, "Class-"+ClassID)

	if err != nil {
		return shim.Error("Class dose not exist - " + ClassID)
	}

	var tlist []Student
	var i int

	for i = 0; i < len(class.Students); i++ {

		student, err := getStudent(stub, "Student-"+class.Students[i])
		if err != nil {
			return shim.Error("Student does not exist - " + class.Students[i])
		}
		tlist = append(tlist, student)
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
		fmt.Println("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		shim.Error("Permission Denied!")
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
		tlist = append(tlist, score)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetAllCertificates(stub shim.ChaincodeStubInterface) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		fmt.Println("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		shim.Error("Permission Denied!")
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
		tlist = append(tlist, certificate)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetClassesOfStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	StudentUsername := args[0]

	student, err := getStudent(stub, "Student-"+StudentUsername)

	if err != nil {
		return shim.Error("Student dose not exist - " + StudentUsername)
	}

	var tlist []Class
	var i int

	for i = 0; i < len(student.Classes); i++ {

		class, err := getClass(stub, "Class-"+student.Classes[i])
		if err != nil {
			return shim.Error("Class does not exist - " + student.Classes[i])
		}
		tlist = append(tlist, class)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetCoursesOfStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	StudentUsername := args[0]

	student, err := getStudent(stub, "Student-"+StudentUsername)

	if err != nil {
		return shim.Error("Student dose not exist - " + StudentUsername)
	}

	var tlist []Course
	var i int

	for i = 0; i < len(student.Courses); i++ {

		course, err := getCourse(stub, "Course-"+student.Courses[i])
		if err != nil {
			return shim.Error("Course does not exist - " + student.Courses[i])
		}
		tlist = append(tlist, course)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Cannot json encode list courses of student")
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

func GetClassesByTeacher(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		fmt.Println("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		shim.Error("Permission Denied!")
	}

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	TeacherUsername := args[0]

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
		if class.TeacherUsername == TeacherUsername {
			tlist = append(tlist, class)
		}
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Cannot json encode list class")
	}

	return shim.Success(jsonRow)
}

func main() {

	err := shim.Start(new(SmartContract))

	if err != nil {
		fmt.Printf("Error createing new Smart Contract: %s", err)
	}
}
