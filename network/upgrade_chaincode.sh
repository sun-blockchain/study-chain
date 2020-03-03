#!/bin/bash
export $(cat .env | xargs)
docker restart cli
sleep 5
docker exec cli bash scripts/script_upgrade_chaincode.sh $CHAINCODE_NEW_VERSION
