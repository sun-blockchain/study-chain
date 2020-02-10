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

type Subject struct {
	SubjectID       string
	Name            string
	TeacherUsername string
	Students        []string
}

type Teacher struct {
	Username string
	Fullname string
	Subjects []string
}

type Student struct {
	Username string
	Fullname string
	Subjects []string
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
	key := "Student-20156425"

	var student = Student{Username: "St01", Fullname: "Trinh Van Tan", Subjects: nil}

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
	} else if function == "CreateScore" {
		return CreateScore(stub, args)
	} else if function == "CreateCertificate" {
		return CreateCertificate(stub, args)
	} else if function == "CreateTeacher" {
		return CreateTeacher(stub, args)
	} else if function == "QuerySubject" {
		return QuerySubject(stub, args)
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
	}

	return shim.Error("Invalid Smart Contract function name!")
}

func TeacherRegisterSubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	var TeacherUsername string

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("WHO ARE YOU ?")
	}

	TeacherUsername, ok, err := cid.GetAttributeValue(stub, "username")

	if err != nil {
		return shim.Error("Error - cid.GetAttributeValue()")
	}

	if !ok {
		TeacherUsername = args[1]
	}

	SubjectID := args[0]

	keySubject := "Subject-" + SubjectID
	keyTeacher := "Teacher-" + TeacherUsername

	subject, err := getSubject(stub, keySubject)

	if err != nil {

		return shim.Error("Subject does not exist !")

	} else {

		teacher, err := getTeacher(stub, keyTeacher)

		if err != nil {

			return shim.Error("Student does not exist !")

		} else {

			teacher.Subjects = append(teacher.Subjects, SubjectID)

			subject.TeacherUsername = TeacherUsername

			subjectAsBytes, _ := json.Marshal(subject)

			teacherAsBytes, _ := json.Marshal(teacher)

			stub.PutState(keyTeacher, teacherAsBytes)

			stub.PutState(keySubject, subjectAsBytes)

			return shim.Success(nil)
		}
	}

}

func StudentRegisterSubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	var StudentUsername string

	StudentUsername, ok, err := cid.GetAttributeValue(stub, "username")

	if err != nil {
		return shim.Error("Error - cid.GetAttributeValue()")
	}

	if ok == false {
		return shim.Error("WHO ARE YOU")
	}

	SubjectID := args[0]

	keySubject := "Subject-" + SubjectID
	keyStudent := "Student-" + StudentUsername

	subject, err := getSubject(stub, keySubject)

	if err != nil {

		return shim.Error("Subject does not exist !")

	} else {

		student, err := getStudent(stub, keyStudent)

		if err != nil {

			return shim.Error("Student does not exist !")

		} else {

			student.Subjects = append(student.Subjects, SubjectID)

			subject.Students = append(subject.Students, StudentUsername)

			subjectAsBytes, _ := json.Marshal(subject)

			studentAsBytes, _ := json.Marshal(student)

			stub.PutState(keyStudent, studentAsBytes)

			stub.PutState(keySubject, subjectAsBytes)

			return shim.Success(nil)
		}
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
	// 	shim.Error("WHO ARE YOU ?")
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

func QueryStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	shim.Error("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
	// 	shim.Error("WHO ARE YOU ?")
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
	// 	shim.Error("WHO ARE YOU ?")
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
		shim.Error("WHO ARE YOU ?")
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
	// 	shim.Error("WHO ARE YOU ?")
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
		shim.Error("WHO ARE YOU ?")
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
	// 	shim.Error("WHO ARE YOU ?")
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

func GetAllStudents(stub shim.ChaincodeStubInterface) sc.Response {

	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	shim.Error("Error - cide.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	return shim.Error("WHO ARE YOU ?")
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
	// 	shim.Error("Error - cide.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	return shim.Error("WHO ARE YOU ?")
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
		shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		shim.Error("WHO ARE YOU ?")
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
		return shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID != "StudentMSP" {
		return shim.Error("WHO ARE YOU ?")
	}

	StudentUsername, ok, err := cid.GetAttributeValue(stub, "username")

	if err != nil {
		return shim.Error("Error - Can not Get StudentUsername")
	}

	if !ok {
		return shim.Error("WHO ARE YOU ?")
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

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID != "StudentMSP" {
		return shim.Error("WHO ARE YOU ?")
	}

	StudentUsername, ok, err := cid.GetAttributeValue(stub, "username")

	if err != nil {
		return shim.Error("Error - Can not Get StudentUsername")
	}

	if !ok {
		return shim.Error("WHO ARE YOU ?")
	}

	student, err := getStudent(stub, "Student-"+StudentUsername)

	if err != nil {
		return shim.Error("Student dose not exist - " + StudentUsername)
	}

	var tlist []Subject
	var i int

	for i = 0; i < len(student.Subjects); i++ {

		subject, err := getSubject(stub, "Subject-"+student.Subjects[i])
		if err != nil {
			return shim.Error("Subject does not exist - " + student.Subjects[i])
		}
		subject.Students = nil
		tlist = append(tlist, subject)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetMyScores(stub shim.ChaincodeStubInterface) sc.Response {

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		return shim.Error("Error - cide.GetMSPID()")
	}

	if MSPID != "StudentMSP" {
		return shim.Error("WHO ARE YOU ?")
	}

	StudentUsername, ok, err := cid.GetAttributeValue(stub, "username")

	if err != nil {
		return shim.Error("Error - Can not Get StudentUsername")
	}

	if !ok {
		return shim.Error("WHO ARE YOU ?")
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
	// 	shim.Error("WHO ARE YOU ?")
	// }

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	StudentUsername := args[0]

	student, err := getStudent(stub, "Student-"+StudentUsername)

	if err != nil {
		return shim.Error("Student dose not exist - " + StudentUsername)
	}

	var tlist []Subject
	var i int

	for i = 0; i < len(student.Subjects); i++ {

		subject, err := getSubject(stub, "Subject-"+student.Subjects[i])
		if err != nil {
			return shim.Error("Subject does not exist - " + student.Subjects[i])
		}
		subject.Students = nil
		tlist = append(tlist, subject)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetCertificatesByStudent(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	shim.Error("WHO ARE YOU ?")
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
	// 	shim.Error("WHO ARE YOU ?")
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
	// 	shim.Error("WHO ARE YOU ?")
	// }

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	TeacherUsername := args[0]

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
		if subject.TeacherUsername == TeacherUsername {
			tlist = append(tlist, subject)
		}
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetScoresBySubjectOfTeacher(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	MSPID, err := cid.GetMSPID(stub)

	if err != nil {
		fmt.Println("Error - cid.GetMSPID()")
	}

	if MSPID != "AcademyMSP" {
		return shim.Error("WHO ARE YOU ?")
	}

	TeacherUsername, ok, err := cid.GetAttributeValue(stub, "username")

	if err != nil {
		return shim.Error("Error - Can not Get TeacherUsername")
	}

	if !ok {
		return shim.Error("WHO ARE YOU ?")
	}

	_, err = getTeacher(stub, "Teacher-"+TeacherUsername)

	if err != nil {
		return shim.Error("Error - Teacher Does not exist !")
	}

	SubjectID := args[0]

	subject, err := getSubject(stub, "Subject-"+SubjectID)

	if err != nil {
		return shim.Error("Subject dose not exist - " + SubjectID)
	}

	if subject.TeacherUsername != TeacherUsername {
		return shim.Error("WHO ARE YOU ?")
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

func GetStudentsBySubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "StudentMSP" && MSPID != "AcademyMSP" {
	// 	shim.Error("WHO ARE YOU ?")
	// }

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	SubjectID := args[0]

	subject, err := getSubject(stub, "Subject-"+SubjectID)

	if err != nil {
		return shim.Error("Subject dose not exist - " + SubjectID)
	}

	var tlist []Student
	var i int

	for i = 0; i < len(subject.Students); i++ {

		student, err := getStudent(stub, "Student-"+subject.Students[i])
		if err != nil {
			return shim.Error("Student dose not exist - " + subject.Students[i])
		}
		student.Subjects = nil
		tlist = append(tlist, student)
	}

	jsonRow, err := json.Marshal(tlist)

	if err != nil {
		return shim.Error("Failed")
	}

	return shim.Success(jsonRow)
}

func GetCertificatesBySubject(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	// MSPID, err := cid.GetMSPID(stub)

	// if err != nil {
	// 	fmt.Println("Error - cid.GetMSPID()")
	// }

	// if MSPID != "AcademyMSP" {
	// 	shim.Error("WHO ARE YOU ?")
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
	// 	shim.Error("WHO ARE YOU ?")
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
