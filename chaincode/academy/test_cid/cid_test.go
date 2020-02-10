/*
Copyright IBM Corp. 2017 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

                 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package cid_test

import (
	"fmt"
	"testing"

	"github.com/golang/protobuf/proto"
	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/protos/msp"
	//"github.com/stretchr/testify/assert"
)

const certWithOutAttrs = `-----BEGIN CERTIFICATE-----
MIICXTCCAgSgAwIBAgIUeLy6uQnq8wwyElU/jCKRYz3tJiQwCgYIKoZIzj0EAwIw
eTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh
biBGcmFuY2lzY28xGTAXBgNVBAoTEEludGVybmV0IFdpZGdldHMxDDAKBgNVBAsT
A1dXVzEUMBIGA1UEAxMLZXhhbXBsZS5jb20wHhcNMTcwOTA4MDAxNTAwWhcNMTgw
OTA4MDAxNTAwWjBdMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xp
bmExFDASBgNVBAoTC0h5cGVybGVkZ2VyMQ8wDQYDVQQLEwZGYWJyaWMxDjAMBgNV
BAMTBWFkbWluMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEFq/90YMuH4tWugHa
oyZtt4Mbwgv6CkBSDfYulVO1CVInw1i/k16DocQ/KSDTeTfgJxrX1Ree1tjpaodG
1wWyM6OBhTCBgjAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAdBgNVHQ4E
FgQUhKs/VJ9IWJd+wer6sgsgtZmxZNwwHwYDVR0jBBgwFoAUIUd4i/sLTwYWvpVr
TApzcT8zv/kwIgYDVR0RBBswGYIXQW5pbHMtTWFjQm9vay1Qcm8ubG9jYWwwCgYI
KoZIzj0EAwIDRwAwRAIgCoXaCdU8ZiRKkai0QiXJM/GL5fysLnmG2oZ6XOIdwtsC
IEmCsI8Mhrvx1doTbEOm7kmIrhQwUVDBNXCWX1t3kJVN
-----END CERTIFICATE-----
`
const academy_user = `-----BEGIN CERTIFICATE-----
MIICfTCCAiSgAwIBAgIUCJVfRB6ZJ7nNs3O4SWlv1yZZqrgwCgYIKoZIzj0EAwIw
gYExCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T
YW4gRnJhbmNpc2NvMSAwHgYDVQQKExdhY2FkZW15LmNlcnRpZmljYXRlLmNvbTEj
MCEGA1UEAxMaY2EuYWNhZGVteS5jZXJ0aWZpY2F0ZS5jb20wHhcNMTkwODI5MDMz
OTAwWhcNMjAwODI4MDM0NDAwWjAgMQ8wDQYDVQQLEwZjbGllbnQxDTALBgNVBAMT
BEdWMDAwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQ4P+XKUBE8+OMWX8SLXBfK
QtL5PnbDQLPh1ytBLoXZ4qmwRmSJrNZ+SC5LMrLDRqKyLr8lQ5chaamEuuiD0TDm
o4HZMIHWMA4GA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBRg
XVi8Rq5V7A3L/XVt1bxX5l2tFDArBgNVHSMEJDAigCAeF36bcZP4KWZMYflbi7sD
9y+ET51YrZBBXpmBOxPDtTBqBggqAwQFBgcIAQReeyJhdHRycyI6eyJUZWFjaGVy
SUQiOiJHVjAwIiwiaGYuQWZmaWxpYXRpb24iOiIiLCJoZi5FbnJvbGxtZW50SUQi
OiJHVjAwIiwiaGYuVHlwZSI6ImNsaWVudCJ9fTAKBggqhkjOPQQDAgNHADBEAiBy
x6pGNqoBt0JrRJY3ep6kDZQZAAqHs8/lw6HRFWGzMwIgIf7oQNPKimaYge0BDZmv
Rna9z3TxQTrYORKjA5/A7dI=
-----END CERTIFICATE-----
`
const student_user = `-----BEGIN CERTIFICATE-----
MIICijCCAjCgAwIBAgIUNawUXHfp2I7a9H9PZ1dUzpFpLEgwCgYIKoZIzj0EAwIw
gYExCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T
YW4gRnJhbmNpc2NvMSAwHgYDVQQKExdzdHVkZW50LmNlcnRpZmljYXRlLmNvbTEj
MCEGA1UEAxMaY2Euc3R1ZGVudC5jZXJ0aWZpY2F0ZS5jb20wHhcNMTkwODI5MDIw
MzAwWhcNMjAwODI4MDIwODAwWjAkMQ8wDQYDVQQLEwZjbGllbnQxETAPBgNVBAMT
CDIwMTU2NDI2MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEpGB1VFRqu3c5qxWP
aQyVMAsZWZM1Cmi2DC5OSTnyJg9OjZEfWaUtiCy55KmWCrIOmi8ILWP6sqcspa9s
AMj3mKOB4TCB3jAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAdBgNVHQ4E
FgQU/OV7TXMWU67n45k/NyvWn++Qu4YwKwYDVR0jBCQwIoAg3Nu/eW8+5Ixvi92M
CoSmegFNA2A3brJLcJY/TyO5hfgwcgYIKgMEBQYHCAEEZnsiYXR0cnMiOnsiU3R1
ZGVudElEIjoiMjAxNTY0MjYiLCJoZi5BZmZpbGlhdGlvbiI6IiIsImhmLkVucm9s
bG1lbnRJRCI6IjIwMTU2NDI2IiwiaGYuVHlwZSI6ImNsaWVudCJ9fTAKBggqhkjO
PQQDAgNIADBFAiEA5OrhX9ohZyoWIpf9YXPn5jEjMN3+5HPdLvxTpGK14RICIEwT
J4hIOyS7WJ01v+jBBaie8NJx3/GkWfTqCTldPy+7
-----END CERTIFICATE-----
`

func TestClient(t *testing.T) {

	// Academy user
	stub, err := getMockStubWithAttrsForAcademy()
	//assert.NoError(t, err, "Failed to get mock submitter")
	sinfo, err := cid.New(stub)
	//assert.NoError(t, err, "Failed to new client")
	TeacherID, _, err := sinfo.GetAttributeValue("TeacherID")
	//assert.NoError(t, err, "Error getting Unique ID of the submitter of the transaction")
	//assert.True(t, found, "Attribute 'TeacherID' should be found in the submitter cert")
	//assert.Equal(t, TeacherID, "GV00", "Value of attribute 'TeacherID' should be 'GV00'")
	TeacherID, _, err = cid.GetAttributeValue(stub, "TeacherID")
	//assert.NoError(t, err, "Error getting Unique ID of the submitter of the transaction")
	//assert.True(t, found, "Attribute 'TeacherID' should be found in the submitter cert")
	//assert.Equal(t, TeacherID, "GV00", "Value of attribute 'TeacherID' should be 'GV00'")
	err = cid.AssertAttributeValue(stub, "TeacherID", "GV00")
	//assert.NoError(t, err, "Error in AssertAttributeValue")

	mspid, err := cid.GetMSPID(stub)
	if err != nil {
		fmt.Println("Error - cide.GetMSPID()")
	}

	cert, err := cid.GetX509Certificate(stub)
	if err != nil {
		fmt.Println("Error - cide.GetX509Certificate()")
	}

	publicKey := fmt.Sprintf("%v", cert.PublicKey)
	issuer := cert.Issuer
	issuringCertificateURL := cert.IssuingCertificateURL
	dns := cert.DNSNames

	/*
		ipAddresses := cert.IPAddresses
		for i := 0; i < len(ipAddresses); i++ {

			segments := strings.SplitAfter(ipAddresses[i].String(), " ") //<--- here!

			t.Logf("IP address #%d : %s \n", i, segments)
		}
		ip := ipAddresses[0].String()
		t.Logf("IP Address: %s", ip)
	*/
	t.Logf("\n\n\n")
	t.Logf("The Teacher ID is: %s", TeacherID)
	t.Logf("MSP is: %s", mspid)
	t.Logf("PublicKey: %s", publicKey)
	t.Logf("Issuer: %s", issuer)
	t.Logf("IssuringCertificateURL: %s", issuringCertificateURL)
	t.Logf("DNS: %s", dns)

	//Student user
	stub, err = getMockStubWithAttrsForStudent()
	//assert.NoError(t, err, "Failed to get mock submitter")
	sinfo, err = cid.New(stub)
	//assert.NoError(t, err, "Failed to new client")
	StudentID, _, err := sinfo.GetAttributeValue("StudentID")
	//assert.NoError(t, err, "Error getting Unique ID of the submitter of the transaction")
	//assert.True(t, found, "Attribute 'StudentID' should be found in the submitter cert")
	//assert.Equal(t, StudentID, "20156426", "Value of attribute 'StudentID' should be '20156426'")
	StudentID, _, err = cid.GetAttributeValue(stub, "StudentID")
	//assert.NoError(t, err, "Error getting Unique ID of the submitter of the transaction")
	//assert.True(t, found, "Attribute 'StudentID' should be found in the submitter cert")
	//assert.Equal(t, StudentID, "20156426", "Value of attribute 'StudentID' should be '20156426'")
	err = cid.AssertAttributeValue(stub, "StudentID", "20156426")
	//assert.NoError(t, err, "Error in AssertAttributeValue")

	mspid, err = cid.GetMSPID(stub)
	if err != nil {
		fmt.Println("Error - cide.GetMSPID()")
	}

	cert, err = cid.GetX509Certificate(stub)
	if err != nil {
		fmt.Println("Error - cide.GetX509Certificate()")
	}

	publicKey = fmt.Sprintf("%v", cert.PublicKey)
	issuer = cert.Issuer
	issuringCertificateURL = cert.IssuingCertificateURL
	dns = cert.DNSNames

	t.Logf("\n\n\n")
	t.Logf("The Student ID is: %s", StudentID)
	t.Logf("MSP is: %s", mspid)
	t.Logf("PublicKey: %s", publicKey)
	t.Logf("Issuer: %s", issuer)
	t.Logf("IssuringCertificateURL: %s", issuringCertificateURL)
	t.Logf("DNS: %s", dns)

	t.Logf("\n\n\n")
	// Error case1
	stub, err = getMockStubWithNilCreator()
	//assert.NoError(t, err, "Failed to get mock submitter")
	sinfo, err = cid.New(stub)
	//assert.Error(t, err, "NewSubmitterInfo should have returned an error when submitter with nil creator is passed")

	// Error case2
	stub, err = getMockStubWithFakeCreator()
	//assert.NoError(t, err, "Failed to get mock submitter")
	sinfo, err = cid.New(stub)
	//assert.Error(t, err, "NewSubmitterInfo should have returned an error when submitter with fake creator is passed")
}

func getMockStubWithAttrsForAcademy() (cid.ChaincodeStubInterface, error) {
	stub := &mockStub{}
	sid := &msp.SerializedIdentity{Mspid: "AcademyMSP",
		IdBytes: []byte(academy_user)}
	b, err := proto.Marshal(sid)
	if err != nil {
		return nil, err
	}
	stub.creator = b
	return stub, nil
}

func getMockStubWithAttrsForStudent() (cid.ChaincodeStubInterface, error) {
	stub := &mockStub{}
	sid := &msp.SerializedIdentity{Mspid: "StudentMSP",
		IdBytes: []byte(student_user)}
	b, err := proto.Marshal(sid)
	if err != nil {
		return nil, err
	}
	stub.creator = b
	return stub, nil
}

func getMockStubWithNilCreator() (cid.ChaincodeStubInterface, error) {
	c := &mockStub{}
	c.creator = nil
	return c, nil
}

func getMockStubWithFakeCreator() (cid.ChaincodeStubInterface, error) {
	c := &mockStub{}
	c.creator = []byte("foo")
	return c, nil
}

type mockStub struct {
	creator []byte
}

func (s *mockStub) GetCreator() ([]byte, error) {
	return s.creator, nil
}
