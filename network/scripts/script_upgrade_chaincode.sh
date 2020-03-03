echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo
CHANNEL_NAME="certificatechannel"
DELAY="3"
CC_SRC_LANGUAGE="go"
TIMEOUT="10"
VERBOSE="false"
COUNTER=1
MAX_RETRY=20
PACKAGE_ID=""
CC_SRC_PATH="github.com/hyperledger/fabric-samples/chaincode/academy/go/"
CC_RUNTIME_LANGUAGE=golang
VERSION="$1"
. scripts/utils.sh

## at first we package the chaincode
packageChaincode $VERSION 0 1

## Install chaincode on peer0.academy
echo "Installing chaincode on peer0.academy..."
installChaincode 0 1

## Install chaincode on peer1.academy
echo "Installing chaincode on peer1.academy..."
installChaincode 1 1

## Install chaincode on peer0.student
echo "Install chaincode on peer0.student..."
installChaincode 0 2

## query whether the chaincode is installed
queryInstalled 0 1

## approve the definition for academy
approveForMyOrg $VERSION 0 1

## check whether the chaincode definition is ready to be committed
## expect academy to have approved and student not to
checkCommitReadiness $VERSION 0 1 "\"AcademyMSP\": true" "\"StudentMSP\": false"
checkCommitReadiness $VERSION 0 2 "\"AcademyMSP\": true" "\"StudentMSP\": false"

## now approve also for student
approveForMyOrg $VERSION 0 2

## check whether the chaincode definition is ready to be committed
## expect them both to have approved
checkCommitReadiness $VERSION 0 1 "\"AcademyMSP\": true" "\"StudentMSP\": true"
checkCommitReadiness $VERSION 0 2 "\"AcademyMSP\": true" "\"StudentMSP\": true"

## now that we know for sure both orgs have approved, commit the definition
commitChaincodeDefinition $VERSION 0 1 0 2

## query on both orgs to see that the definition committed successfully
queryCommitted $VERSION 0 1
queryCommitted $VERSION 0 2\

## initchaincode
chaincodeInvoke 1 0 1 0 2


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
