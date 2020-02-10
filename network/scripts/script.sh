#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Build your first network (CERTIFICATE) end-to-end test"
echo
CHANNEL_NAME="$1"
DELAY="$2"
CC_SRC_LANGUAGE="$3"
TIMEOUT="$4"
VERBOSE="$5"
NO_CHAINCODE="$6"
: ${CHANNEL_NAME:="mychannel"}
: ${DELAY:="3"}
: ${CC_SRC_LANGUAGE:="go"}
: ${TIMEOUT:="10"}
: ${VERBOSE:="false"}
: ${NO_CHAINCODE:="false"}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`
COUNTER=1
MAX_RETRY=20
PACKAGE_ID=""

if [ "$CC_SRC_LANGUAGE" = "go" -o "$CC_SRC_LANGUAGE" = "golang" ]; then
	CC_RUNTIME_LANGUAGE=golang
	CC_SRC_PATH="github.com/hyperledger/fabric-samples/chaincode/academy/go/"
elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
	CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
	CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode/academy/javascript/"
elif [ "$CC_SRC_LANGUAGE" = "java" ]; then
	CC_RUNTIME_LANGUAGE=java
	CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode/academy/java/"
else
	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
	echo Supported chaincode languages are: go, javascript, java
	exit 1
fi


echo "Channel name : "$CHANNEL_NAME

# import utils
. scripts/utils.sh

createChannel() {
	setGlobals 0 1

	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
                set -x
		peer channel create -o orderer.certificate.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx >&log.txt
		res=$?
                set +x
	else
				set -x
		peer channel create -o orderer.certificate.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
		res=$?
				set +x
	fi
	cat log.txt
	verifyResult $res "Channel creation failed"
	echo "===================== Channel '$CHANNEL_NAME' created ===================== "
	echo
}

joinChannel () {
	for org in 1 2; do
	    for peer in 0 1; do
		joinChannelWithRetry $peer $org
		echo "===================== ${MESS_FOR_PEER} joined channel '$CHANNEL_NAME' ===================== "
		sleep $DELAY
		echo
	    done
	done
}

## Create channel
echo "Creating channel..."
createChannel

## Join all the peers to the channel
echo "Having all peers join the channel..."
joinChannel

## Set the anchor peers for each org in the channel
echo "Updating anchor peers for academy..."
updateAnchorPeers 0 1
echo "Updating anchor peers for student..."
updateAnchorPeers 0 2

if [ "${NO_CHAINCODE}" != "true" ]; then

	## at first we package the chaincode
	packageChaincode 1 0 1

	## Install chaincode on peer0.academy and peer0.student
	echo "Installing chaincode on peer0.academy..."
	installChaincode 0 1
	echo "Install chaincode on peer0.student..."
	installChaincode 0 2

	## query whether the chaincode is installed
	queryInstalled 0 1

	## approve the definition for academy
	approveForMyOrg 1 0 1

	## check whether the chaincode definition is ready to be committed
  ## expect academy to have approved and student not to
	checkCommitReadiness 1 0 1 "\"AcademyMSP\": true" "\"StudentMSP\": false"
	checkCommitReadiness 1 0 2 "\"AcademyMSP\": true" "\"StudentMSP\": false"

	## now approve also for student
	approveForMyOrg 1 0 2

	## check whether the chaincode definition is ready to be committed
	## expect them both to have approved
	checkCommitReadiness 1 0 1 "\"AcademyMSP\": true" "\"StudentMSP\": true"
	checkCommitReadiness 1 0 2 "\"AcademyMSP\": true" "\"StudentMSP\": true"

	## now that we know for sure both orgs have approved, commit the definition
	commitChaincodeDefinition 1 0 1 0 2

	## query on both orgs to see that the definition committed successfully
	queryCommitted 1 0 1
	queryCommitted 1 0 2

	# invoke init
	chaincodeInvoke 1 0 1 0 2

	# Query chaincode on peer0.academy
	echo "Querying chaincode on peer0.academy..."
	chaincodeQuery 0 1 100

	# Invoke chaincode on peer0.academy and peer0.student
	echo "Sending invoke transaction on peer0.academy peer0.student..."
	chaincodeInvoke 0 0 1 0 2

	# Query chaincode on peer0.academy
	echo "Querying chaincode on peer0.academy..."
	chaincodeQuery 0 1 90

	## Install chaincode on peer1.student
	echo "Installing chaincode on peer1.student..."
	installChaincode 1 2

	# Query on chaincode on peer1.student, check if the result is 90
	echo "Querying chaincode on peer1.student..."
	chaincodeQuery 1 2 90

fi

echo
echo "========= All GOOD, CERTIFICATE execution completed =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
