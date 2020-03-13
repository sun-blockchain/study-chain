#!/bin/bash
export $(cat .envchaincode | xargs)
NEW_CHECK_SUM=$(find ../chaincode/academy/go/  -type f | sort -u | xargs cat | md5sum)
NEW_CHECK_SUM=${NEW_CHECK_SUM:0:32}
if [[ $CHECK_SUM != $NEW_CHECK_SUM ]];
then
    NEW_VERSION=$(($CHAINCODE_VERSION + 1))
    docker restart cli
    sleep 5
    docker exec cli bash scripts/script_upgrade_chaincode.sh $NEW_VERSION
    EXIT_STATUS=$?
    if [ $EXIT_STATUS -eq 0 ];
    then
        printf "CHAINCODE_VERSION=${NEW_VERSION}\nCHECK_SUM=${NEW_CHECK_SUM}\n" > .envchaincode
    fi
fi 
