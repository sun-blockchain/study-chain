package main

import (
	"fmt"
	"strings"
	"testing"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func TestInstancesCreation(test *testing.T) {
	stub := InitChaincode(test)

	Invoke(test, stub, "CreateStudent", "20156425", "Hoang Ngoc Phuc")
	Invoke(test, stub, "CreateStudent", "20156426", "Hoang Ngoc Phuc")
	Invoke(test, stub, "CreateStudent", "20156427", "Hoang Ngoc Phuc")
	// Invoke(test, stub, "CreateSubject", "IT00", "Blockchain")
	// Invoke(test, stub, "QuerySubject", "IT00")
	// Invoke(test, stub, "StudentRegisterSubject", "IT00", "20156425")
	// Invoke(test, stub, "QuerySubject", "IT00")
	Invoke(test, stub, "QueryStudent", "20156425")
	// Invoke(test, stub, "CreateTeacher", "GV01", "Hoang Ngoc Phuc")
	// Invoke(test, stub, "StudentRegisterSubject", "IT00", "20156426")
	// Invoke(test, stub, "TeacherRegisterSubject", "IT00", "GV01")
	// Invoke(test, stub, "QuerySubject", "IT00")
	// Invoke(test, stub, "QueryStudent", "20156425")
	// Invoke(test, stub, "QueryTeacher", "GV01")
	// Invoke(test, stub, "CreateScore", "IT00", "20156425", "10", "GV01")
	// Invoke(test, stub, "QueryScore", "IT00", "20156425")
	// Invoke(test, stub, "CreateCertificate", "hahaha", "IT00", "20156425", "hihi")
	// Invoke(test, stub, "QueryCertificate", "hahaha")
	// Invoke(test, stub, "VerifyCertificate", "hahaha", "IT00", "20156425")
	// Invoke(test, stub, "GetAllStudents")
	// Invoke(test, stub, "GetAllSubjects")
	// Invoke(test, stub, "GetAllTeachers")
	// Invoke(test, stub, "GetAllScores")
	// Invoke(test, stub, "GetAllCertificates")
}

func InitChaincode(test *testing.T) *shim.MockStub {
	stub := shim.NewMockStub("testingStub", new(SmartContract))
	result := stub.MockInit("000", nil)

	if result.Status != shim.OK {
		test.FailNow()
	}
	return stub
}

func Invoke(test *testing.T, stub *shim.MockStub, function string, args ...string) {
	cc_args := make([][]byte, 1+len(args))
	cc_args[0] = []byte(function)

	for i, arg := range args {
		cc_args[i+1] = []byte(arg)
	}
	result := stub.MockInvoke("000", cc_args)
	fmt.Println("Call:	", function, "(", strings.Join(args, ", "), ")")
	fmt.Println("RetCode:	", result.Status)
	fmt.Println("RetMsg:	", result.Message)
	fmt.Println("Payload:	", string(result.Payload))

	if result.Status != shim.OK {
		test.FailNow()
	}
}
