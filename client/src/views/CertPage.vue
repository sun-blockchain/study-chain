<template>
  <div class="container">
    <div v-if="success" class="container pm-certificate-container">
      <div class="outer-border"></div>
      <div class="inner-border"></div>

      <div class="pm-certificate-border col-xs-12">
        <div class="row pm-certificate-header">
          <div class="pm-certificate-title col-xs-12 margin-0 text-center">
            <h1 class="issuer">Sun* Academy</h1>
            <h2 class="sans mt-2">CERTIFICATE OF EXCELLENCE</h2>
          </div>
        </div>
        <div class="row pm-certificate-body">
          <div class="pm-certificate-block">
            <div class="col-xs-12">
              <div class="row">
                <div class="col-xs-2">
                  <!-- LEAVE EMPTY -->
                </div>
                <div class="pm-certificate-name margin-0 col-xs-8 text-center">
                  <span class="pm-name-text">This certificate is presented to</span>
                </div>
              </div>
            </div>

            <div class="col-xs-12">
              <div class="pm-certificate-name underline margin-0 col-xs-8 text-center">
                <span class="nameOfUser bold Rochester">{{ cert.fullname }}</span>
              </div>
              <div class="col-xs-2">
                <!-- LEAVE EMPTY -->
              </div>
            </div>

            <div class="col-xs-12">
              <div class="pm-certificate-name margin-0 col-xs-8 text-center">
                <p class="bold">Has been recognized for outstanding achievement</p>
                <p class="bold">at {{ cert.courseName }} course</p>
              </div>
              <div class="col-xs-2">
                <!-- LEAVE EMPTY -->
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="row pm-certificate-footer">
          <div class="col-md-12">
            <div class="row">
              <div class="col-md-6 text-center">
                <div class="pm-certificate-name underline margin-0 text-center">
                  <p>{{ cert.issueDate }}</p>
                </div>
                <p>
                  <strong>ISSUE DATE</strong>
                </p>
              </div>
              <div class="col-md-6 text-center" @click="dialogDetails = true">
                <div class="pm-certificate-name underline margin-0 text-center">
                  <p class="Rochester">{{ cert.certificateId }}</p>
                </div>
                <p>
                  <strong>Certificate ID</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      title="Transaction Details"
      :visible.sync="dialogDetails"
      custom-class="style-transaction-details modal-with-certificate"
    >
      <div class="body-modal">
        <div class="box-gray">
          <div class="row">
            <div class="col-3">
              <h5>Transaction ID:</h5>
            </div>
            <div
              class="col-9"
            >{{ infoTransaction && infoTransaction.row ? infoTransaction.row.txhash : '' }}</div>
          </div>
        </div>
        <div class="box-white">
          <div class="row">
            <div class="col-3">
              <h5>Validation Code:</h5>
            </div>
            <div class="col-9">
              {{
              infoTransaction && infoTransaction.row ? infoTransaction.row.validation_code : ''
              }}
            </div>
          </div>
        </div>
        <div class="box-gray">
          <div class="row">
            <div class="col-3">
              <h5>Payload Proposal Hash:</h5>
            </div>
            <div class="col-9">
              {{
              infoTransaction && infoTransaction.row
              ? infoTransaction.row.payload_proposal_hash
              : ''
              }}
            </div>
          </div>
        </div>
        <div class="box-white">
          <div class="row">
            <div class="col-3">
              <h5>Creator MSP:</h5>
            </div>
            <div
              class="col-9"
            >{{ infoTransaction && infoTransaction.row ? infoTransaction.row.creator_msp_id : '' }}</div>
          </div>
        </div>
        <div class="box-gray">
          <div class="row">
            <div class="col-3">
              <h5>Endoser:</h5>
            </div>
            <div class="col-9">
              {{
              infoTransaction && infoTransaction.row ? infoTransaction.row.endorser_msp_id : ''
              }}
            </div>
          </div>
        </div>
        <div class="box-white">
          <div class="row">
            <div class="col-3">
              <h5>Chaincode Name:</h5>
            </div>
            <div
              class="col-9"
            >{{ infoTransaction && infoTransaction.row ? infoTransaction.row.chaincodename : '' }}</div>
          </div>
        </div>
        <div class="box-gray">
          <div class="row">
            <div class="col-3">
              <h5>Type:</h5>
            </div>
            <div
              class="col-9"
            >{{ infoTransaction && infoTransaction.row ? infoTransaction.row.type : '' }}</div>
          </div>
        </div>
        <div class="box-white">
          <div class="row">
            <div class="col-3">
              <h5>Time:</h5>
            </div>
            <div
              class="col-9"
            >{{ infoTransaction && infoTransaction.row ? infoTransaction.row.createdt : '' }}</div>
          </div>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogDetails = false" size="small">Cancel</el-button>
        <a :href="`${domainExplorer}/#/transactions`" target="_blank" class="ml-2">
          <el-button type="primary" size="small">
            <i class="el-icon-link"></i> Scan Explorer
          </el-button>
        </a>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Vue from "vue";
import { mapState, mapActions } from "vuex";
import { Dialog, Button } from "element-ui";
Vue.use(Dialog);
Vue.use(Button);
export default {
  data() {
    return {
      success: Boolean,
      cert: {
        certificateId: "",
        courseId: "",
        username: "",
        issueDate: "",
        courseName: "",
        fullname: ""
      },
      msg: String,
      dialogDetails: false,
      infoTransaction: null,
      defaultProps: {
        label: "key",
        children: "value"
      },
      domainExplorer: process.env.VUE_APP_API_EXPLORER
    };
  },
  methods: {
    ...mapActions("student", ["getCertificate", "verifyCertificate"])
  },
  computed: {
    ...mapState("student", ["myCertificates"])
  },
  created: async function() {
    let cert = await this.getCertificate(this.$route.params.certId);
    let data = await this.verifyCertificate(this.$route.params.certId);

    if (data) {
      this.infoTransaction = data.transactionInfo;
    }

    if (cert) {
      this.cert.certificateId = cert.CertificateID;
      this.cert.courseId = cert.CourseID;
      this.cert.username = cert.StudentUsername;
      this.cert.issueDate = cert.IssueDate;
      this.cert.courseName = cert.CourseName;
      this.cert.fullname = cert.Fullname;
    }
    this.loadingData = false;
  }
};
</script>

<style scoped>
@import "../assets/styleCertificate.css";
</style>
