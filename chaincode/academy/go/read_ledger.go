package main

import (
	"encoding/json"
	"errors"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func getStudent(stub shim.ChaincodeStubInterface, compoundKey string) (Student, error) {

	var student Student

	studentAsBytes, err := stub.GetState(compoundKey)

	if err != nil {
		return student, errors.New("Failed to get student - " + compoundKey)
	}

	if studentAsBytes == nil {
		return student, errors.New("Student does not exist - " + compoundKey)
	}

	json.Unmarshal(studentAsBytes, &student)

	return student, nil
}

func getTeacher(stub shim.ChaincodeStubInterface, compoundKey string) (Teacher, error) {

	var teacher Teacher

	teacherAsBytes, err := stub.GetState(compoundKey)

	if err != nil {
		return teacher, errors.New("Failed to get teacher - " + compoundKey)
	}

	if teacherAsBytes == nil {
		return teacher, errors.New("Teacher does not exist - " + compoundKey)
	}

	json.Unmarshal(teacherAsBytes, &teacher)

	return teacher, nil
}

func getSubject(stub shim.ChaincodeStubInterface, compoundKey string) (Subject, error) {

	var subject Subject

	subjectAsBytes, err := stub.GetState(compoundKey)

	if err != nil {
		return subject, errors.New("Failed to get subject - " + compoundKey)
	}

	if subjectAsBytes == nil {
		return subject, errors.New("Subject does not exist - " + compoundKey)
	}

	json.Unmarshal(subjectAsBytes, &subject)

	return subject, nil
}

func getScore(stub shim.ChaincodeStubInterface, compoundKey string) (Score, error) {

	var score Score

	scoreAsBytes, err := stub.GetState(compoundKey)

	if err != nil {
		return score, errors.New("Failed to get score - " + compoundKey)
	}

	if scoreAsBytes == nil {
		return score, errors.New("Score does not exist - " + compoundKey)
	}

	json.Unmarshal(scoreAsBytes, &score)

	return score, nil
}

func getCertificate(stub shim.ChaincodeStubInterface, compoundKey string) (Certificate, error) {

	var certificate Certificate

	certificateAsBytes, err := stub.GetState(compoundKey)

	if err != nil {
		return certificate, errors.New("Failed to get certificate - " + compoundKey)
	}

	if certificateAsBytes == nil {
		return certificate, errors.New("Certificate does not exist - " + compoundKey)
	}

	json.Unmarshal(certificateAsBytes, &certificate)

	return certificate, nil
}

func getListSubjects(stub shim.ChaincodeStubInterface) (shim.StateQueryIteratorInterface, error) {

	startKey := "Subject-"
	endKey := "Subject-zzzzzzzz"

	resultIter, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return nil, err
	}

	return resultIter, nil
}

func getListStudents(stub shim.ChaincodeStubInterface) (shim.StateQueryIteratorInterface, error) {

	startKey := "Student-"
	endKey := "Student-zzzzzzzz"

	resultIter, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return nil, err
	}

	return resultIter, nil
}

func getListTeachers(stub shim.ChaincodeStubInterface) (shim.StateQueryIteratorInterface, error) {

	startKey := "Teacher-"
	endKey := "Teacher-zzzzzzzz"

	resultIter, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return nil, err
	}

	return resultIter, nil
}

func getListScores(stub shim.ChaincodeStubInterface) (shim.StateQueryIteratorInterface, error) {

	startKey := "Score-"
	endKey := "Score-zzzzzzzz"

	resultIter, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return nil, err
	}

	return resultIter, nil
}

func getListCertificates(stub shim.ChaincodeStubInterface) (shim.StateQueryIteratorInterface, error) {

	startKey := "Certificate-"
	endKey := "Certificate-zzzzzzzz"

	resultIter, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return nil, err
	}

	return resultIter, nil
}
