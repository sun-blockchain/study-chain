#!/bin/bash

node enrollAdmin.js --orgMSP=academy
node enrollAdmin.js

sleep 3

node invoke.js --username=adminacademy --func=CreateCourse --courseCode=BC01 --courseName=Blockchain --description="Blockchain Basic, you will learn about architech of blockchain, consensus,..." --shortDescription=Blockchain
node invoke.js --username=adminacademy --func=CreateSubject --subjectCode=ET01 --subjectName=Ethereum --shortDescription=Ethereum --description="Ethereum basic: you will be learnt about solidity, EVM and architech of Ethereum Blockchain"

sleep 1

node query.js --username=adminacademy --func=GetAllCourses
node query.js --username=adminacademy --func=GetAllSubjects

# node invoke.js --username=adminacademy --func=AddSubjectToCourse --courseId=xxxx --subjectId=xxx
# node invoke.js --username=adminacademy --func=CreateClass --classCode=ETH101 --room=F13 --time="11:00" --startDate="20/02/2020" --endDate="20/05/2020" --repeat="Weekly" --subjectId= --capacity=75
# node invoke.js --username=adminacademy --func=CreateClass --classCode=Fabric101 --room=F13 --time="13:00" --startDate="20/02/2020" --endDate="20/05/2020" --repeat="Weekly" --subjectId= --capacity=71
