#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts

ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/certificate.com/orderers/orderer.certificate.com/msp/tlscacerts/tlsca.certificate.com-cert.pem
PEER0_ACADEMY_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/peers/peer0.academy.certificate.com/tls/ca.crt
PEER0_STUDENT_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.certificate.com/peers/peer0.student.certificate.com/tls/ca.crt
PEER0_ORG3_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.certificate.com/peers/peer0.org3.certificate.com/tls/ca.crt

# verify the result of the end-to-end test
verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo "========= ERROR !!! FAILED to execute End-2-End Scenario ==========="
    echo
    exit 1
  fi
}

# Set OrdererOrg.Admin globals
setOrdererGlobals() {
  CORE_PEER_LOCALMSPID="OrdererMSP"
  CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/certificate.com/orderers/orderer.certificate.com/msp/tlscacerts/tlsca.certificate.com-cert.pem
  CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/certificate.com/users/Admin@certificate.com/msp
}

setGlobals() {
  PEER=$1
  ORG=$2
  if [ $ORG -eq 1 ]; then
    CORE_PEER_LOCALMSPID="AcademyMSP"
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ACADEMY_CA
    CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp
    if [ $PEER -eq 0 ]; then
      CORE_PEER_ADDRESS=peer0.academy.certificate.com:7051
      MESS_FOR_PEER="peer0.academy.certificate.com"
    else
      CORE_PEER_ADDRESS=peer1.academy.certificate.com:8051
      MESS_FOR_PEER="peer1.academy.certificate.com"
    fi
  elif [ $ORG -eq 2 ]; then
    CORE_PEER_LOCALMSPID="StudentMSP"
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_STUDENT_CA
    CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.certificate.com/users/Admin@student.certificate.com/msp
    if [ $PEER -eq 0 ]; then
      CORE_PEER_ADDRESS=peer0.student.certificate.com:9051
      MESS_FOR_PEER="peer0.student.certificate.com"
    else
      CORE_PEER_ADDRESS=peer1.student.certificate.com:10051
      MESS_FOR_PEER="peer1.student.certificate.com"
    fi

  elif [ $ORG -eq 3 ]; then
    CORE_PEER_LOCALMSPID="Org3MSP"
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.certificate.com/users/Admin@org3.certificate.com/msp
    if [ $PEER -eq 0 ]; then
      CORE_PEER_ADDRESS=peer0.org3.certificate.com:11051
      MESS_FOR_PEER="peer0.org3.certificate.com"
    else
      CORE_PEER_ADDRESS=peer1.org3.certificate.com:12051
      MESS_FOR_PEER="peer1.org3.certificate.com"
    fi
  else
    echo "================== ERROR !!! ORG Unknown =================="
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

updateAnchorPeers() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG

  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer channel update -o orderer.certificate.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx >&log.txt
    res=$?
    set +x
  else
    set -x
    peer channel update -o orderer.certificate.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
    res=$?
    set +x
  fi
  cat log.txt
  verifyResult $res "Anchor peer update failed"
  echo "===================== Anchor peers updated for org '$CORE_PEER_LOCALMSPID' on channel '$CHANNEL_NAME' ===================== "
  sleep $DELAY
  echo
}

## Sometimes Join takes time hence RETRY at least 5 times
joinChannelWithRetry() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG

  set -x
  peer channel join -b $CHANNEL_NAME.block >&log.txt
  res=$?
  set +x
  cat log.txt
  if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
    COUNTER=$(expr $COUNTER + 1)
    echo "peer${PEER}.org${ORG} failed to join the channel, Retry after $DELAY seconds"
    sleep $DELAY
    joinChannelWithRetry $PEER $ORG
  else
    COUNTER=1
  fi
  verifyResult $res "After $MAX_RETRY attempts, ${MESS_FOR_PEER} has failed to join channel '$CHANNEL_NAME' "
}

# packageChaincode VERSION PEER ORG
packageChaincode() {
  VERSION=$1
  PEER=$2
  ORG=$3
  setGlobals $PEER $ORG
  set -x
  peer lifecycle chaincode package academy.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label academy_${VERSION} >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Chaincode packaging on ${MESS_FOR_PEER} has failed"
  echo "===================== Chaincode is packaged on ${MESS_FOR_PEER} ===================== "
  echo
}

# installChaincode PEER ORG
installChaincode() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
  set -x
  peer lifecycle chaincode install academy.tar.gz >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Chaincode installation on ${MESS_FOR_PEER} has failed"
  echo "===================== Chaincode is installed on ${MESS_FOR_PEER} ===================== "
  echo
}

# queryInstalled PEER ORG
queryInstalled() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
  set -x
  peer lifecycle chaincode queryinstalled >&log.txt
  res=$?
  set +x
  cat log.txt
  PACKAGE_ID=`sed -n '/Package/{s/^Package ID: //; s/, Label:.*$//; p;}' log.txt`
  verifyResult $res "Query installed on ${MESS_FOR_PEER} has failed"
  echo PackageID is ${PACKAGE_ID}
  echo "===================== Query installed successful on ${MESS_FOR_PEER} on channel ===================== "
  echo
}

# approveForMyOrg VERSION PEER ORG
approveForMyOrg() {
  VERSION=$1
  PEER=$2
  ORG=$3
  setGlobals $PEER $ORG

  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer lifecycle chaincode approveformyorg --channelID $CHANNEL_NAME --name academy --version ${VERSION} --init-required --package-id ${PACKAGE_ID} --sequence ${VERSION} --waitForEvent >&log.txt
    set +x
  else
    set -x
    peer lifecycle chaincode approveformyorg --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name academy --version ${VERSION} --init-required --package-id ${PACKAGE_ID} --sequence ${VERSION} --waitForEvent >&log.txt
    set +x
  fi
  cat log.txt
  verifyResult $res "Chaincode definition approved on ${MESS_FOR_PEER} on channel '$CHANNEL_NAME' failed"
  echo "===================== Chaincode definition approved on ${MESS_FOR_PEER} on channel '$CHANNEL_NAME' ===================== "
  echo
}

# commitChaincodeDefinition VERSION PEER ORG (PEER ORG)...
commitChaincodeDefinition() {
  VERSION=$1
  shift
  parsePeerConnectionParameters $@
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  # while 'peer chaincode' command can get the orderer endpoint from the
  # peer (if join was successful), let's supply it directly as we know
  # it using the "-o" option
  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer lifecycle chaincode commit -o orderer.certificate.com:7050 --channelID $CHANNEL_NAME --name academy $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --init-required >&log.txt
    res=$?
    set +x
  else
    set -x
    peer lifecycle chaincode commit -o orderer.certificate.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name academy $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --init-required >&log.txt
    res=$?
    set +x
  fi
  cat log.txt
  verifyResult $res "Chaincode definition commit failed on ${MESS_FOR_PEER} on channel '$CHANNEL_NAME' failed"
  echo "===================== Chaincode definition committed on channel '$CHANNEL_NAME' ===================== "
  echo
}

# checkCommitReadiness VERSION PEER ORG
checkCommitReadiness() {
  VERSION=$1
  PEER=$2
  ORG=$3
  shift 3
  setGlobals $PEER $ORG
  echo "===================== Checking the commit readiness of the chaincode definition on ${MESS_FOR_PEER} on channel '$CHANNEL_NAME'... ===================== "
  local rc=1
  local starttime=$(date +%s)

  # continue to poll
  # we either get a successful response, or reach TIMEOUT
  while
    test "$(($(date +%s) - starttime))" -lt "$TIMEOUT" -a $rc -ne 0
  do
    sleep $DELAY
    echo "Attempting to check the commit readiness of the chaincode definition on ${MESS_FOR_PEER} ...$(($(date +%s) - starttime)) secs"
    set -x
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name academy $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --output json --init-required >&log.txt
    res=$?
    set +x
    test $res -eq 0 || continue
    let rc=0
    for var in "$@"
    do
        grep "$var" log.txt &>/dev/null || let rc=1
    done
  done
  echo
  cat log.txt
  if test $rc -eq 0; then
    echo "===================== Checking the commit readiness of the chaincode definition successful on ${MESS_FOR_PEER} on channel '$CHANNEL_NAME' ===================== "
  else
    echo "!!!!!!!!!!!!!!! Check commit readiness result on ${MESS_FOR_PEER} is INVALID !!!!!!!!!!!!!!!!"
    echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
    echo
    exit 1
  fi
}

# queryCommitted VERSION PEER ORG
queryCommitted() {
  VERSION=$1
  PEER=$2
  ORG=$3
  setGlobals $PEER $ORG
  EXPECTED_RESULT="Version: ${VERSION}, Sequence: ${VERSION}, Endorsement Plugin: escc, Validation Plugin: vscc"
  echo "===================== Querying chaincode definition on ${MESS_FOR_PEER} on channel '$CHANNEL_NAME'... ===================== "
  local rc=1
  local starttime=$(date +%s)

  # continue to poll
  # we either get a successful response, or reach TIMEOUT
  while
    test "$(($(date +%s) - starttime))" -lt "$TIMEOUT" -a $rc -ne 0
  do
    sleep $DELAY
    echo "Attempting to Query committed status on ${MESS_FOR_PEER} ...$(($(date +%s) - starttime)) secs"
    set -x
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name academy >&log.txt
    res=$?
    set +x
    test $res -eq 0 && VALUE=$(cat log.txt | grep -o '^Version: [0-9], Sequence: [0-9], Endorsement Plugin: escc, Validation Plugin: vscc')
    test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
  done
  echo
  cat log.txt
  if test $rc -eq 0; then
    echo "===================== Query chaincode definition successful on ${MESS_FOR_PEER} on channel '$CHANNEL_NAME' ===================== "
  else
    echo "!!!!!!!!!!!!!!! Query chaincode definition result on ${MESS_FOR_PEER} is INVALID !!!!!!!!!!!!!!!!"
    echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
    echo
    exit 1
  fi
}

chaincodeQuery() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
  EXPECTED_RESULT=$3
  echo "===================== Querying on ${MESS_FOR_PEER} on channel '$CHANNEL_NAME'... ===================== "
  local rc=1
  local starttime=$(date +%s)

  # continue to poll
  # we either get a successful response, or reach TIMEOUT
  while
    test "$(($(date +%s) - starttime))" -lt "$TIMEOUT" -a $rc -ne 0
  do
    sleep $DELAY
    echo "Attempting to Query ${MESS_FOR_PEER} ...$(($(date +%s) - starttime)) secs"
    set -x
    peer chaincode query -C $CHANNEL_NAME -n academy -c '{"Args":["QueryStudent","20156425"]}' >&log.txt
    res=$?
    set +x
    test $res -eq 0 && VALUE=$(cat log.txt | awk '/Query Result/ {print $NF}')
    test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
    # removed the string "Query Result" from peer chaincode query command
    # result. as a result, have to support both options until the change
    # is merged.
    test $rc -ne 0 && VALUE=$(cat log.txt | egrep '^[0-9]+$')
    test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
  done
  echo
  cat log.txt
  # if test $rc -eq 0; then
  #   echo "===================== Query successful on ${MESS_FOR_PEER} on channel '$CHANNEL_NAME' ===================== "
  # else
  #   echo "!!!!!!!!!!!!!!! Query result on ${MESS_FOR_PEER} is INVALID !!!!!!!!!!!!!!!!"
  #   echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
  #   echo
  #   exit 1
  # fi
}

# fetchChannelConfig <channel_id> <output_json>
# Writes the current channel config for a given channel to a JSON file
fetchChannelConfig() {
  CHANNEL=$1
  OUTPUT=$2

  setOrdererGlobals

  echo "Fetching the most recent configuration block for the channel"
  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer channel fetch config config_block.pb -o orderer.certificate.com:7050 -c $CHANNEL --cafile $ORDERER_CA
    set +x
  else
    set -x
    peer channel fetch config config_block.pb -o orderer.certificate.com:7050 -c $CHANNEL --tls --cafile $ORDERER_CA
    set +x
  fi

  echo "Decoding config block to JSON and isolating config to ${OUTPUT}"
  set -x
  configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config >"${OUTPUT}"
  set +x
}

# signConfigtxAsPeerOrg <org> <configtx.pb>
# Set the peerOrg admin of an org and signing the config update
signConfigtxAsPeerOrg() {
  PEERORG=$1
  TX=$2
  setGlobals 0 $PEERORG
  set -x
  peer channel signconfigtx -f "${TX}"
  set +x
}

# createConfigUpdate <channel_id> <original_config.json> <modified_config.json> <output.pb>
# Takes an original and modified config, and produces the config update tx
# which transitions between the two
createConfigUpdate() {
  CHANNEL=$1
  ORIGINAL=$2
  MODIFIED=$3
  OUTPUT=$4

  set -x
  configtxlator proto_encode --input "${ORIGINAL}" --type common.Config >original_config.pb
  configtxlator proto_encode --input "${MODIFIED}" --type common.Config >modified_config.pb
  configtxlator compute_update --channel_id "${CHANNEL}" --original original_config.pb --updated modified_config.pb >config_update.pb
  configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate >config_update.json
  echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . >config_update_in_envelope.json
  configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope >"${OUTPUT}"
  set +x
}

# parsePeerConnectionParameters $@
# Helper function that takes the parameters from a chaincode operation
# (e.g. invoke, query, instantiate) and checks for an even number of
# peers and associated org, then sets $PEER_CONN_PARMS and $PEERS
parsePeerConnectionParameters() {
  # check for uneven number of peer and org parameters
  if [ $(($# % 2)) -ne 0 ]; then
    exit 1
  fi

  PEER_CONN_PARMS=""
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1 $2
    if [ $2 -eq 1 ]; then
      if [ $1 -eq 0 ]; then
        PEER="peer0.academy"
      else
        PEER="peer1.academy"
      fi
    elif [ $2 -eq 2 ]; then
      if [ $1 -eq 0 ]; then
        PEER="peer0.student"
      else
        PEER="peer1.student"
      fi
    else
      echo "================== ERROR !!! ORG Unknown =================="
    fi
    PEERS="$PEERS $PEER"
    PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses $CORE_PEER_ADDRESS"
    if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "true" ]; then
      if [ $2 -eq 1 ]; then
        if [ $1 -eq 0 ]; then
          TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_ACADEMY_CA")
        else
          TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER1_ACADEMY_CA")
        fi
      elif [ $2 -eq 2 ]; then
        if [ $1 -eq 0 ]; then
          TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_STUDENT_CA")
        else
          TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER1_STUDENT_CA")
        fi
      else
        echo "================== ERROR !!! ORG Unknown =================="
      fi
      PEER_CONN_PARMS="$PEER_CONN_PARMS $TLSINFO"
    fi
    # shift by two to get the next pair of peer/org parameters
    shift
    shift
  done
  # remove leading space for output
  PEERS="$(echo -e "$PEERS" | sed -e 's/^[[:space:]]*//')"
}

# chaincodeInvoke IS_INIT PEER ORG (PEER ORG) ...
# Accepts as many peer/org pairs as desired and requests endorsement from each
chaincodeInvoke() {
  IS_INIT=$1
  shift
  parsePeerConnectionParameters $@
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  if [ "${IS_INIT}" -eq "1" ]; then
    CCARGS='{"Args":[]}'
    INIT_ARG="--isInit"
  else
    CCARGS='{"Args":["CreateStudent","20156426","TrinhVanTan"]}'
    INIT_ARG=""
  fi

  # while 'peer chaincode' command can get the orderer endpoint from the
  # peer (if join was successful), let's supply it directly as we know
  # it using the "-o" option
  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer chaincode invoke -o orderer.certificate.com:7050 -C $CHANNEL_NAME -n academy $PEER_CONN_PARMS ${INIT_ARG} -c ${CCARGS} >&log.txt
    res=$?
    set +x
  else
    set -x
    peer chaincode invoke -o orderer.certificate.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n academy $PEER_CONN_PARMS ${INIT_ARG} -c ${CCARGS} >&log.txt
    res=$?
    set +x
  fi
  cat log.txt
  verifyResult $res "Invoke execution on $PEERS failed "
  echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
  echo
}
