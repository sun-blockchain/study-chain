<template>
  <div class="container">
    <div v-if="success" class="container pm-certificate-container">
      <div class="outer-border"></div>
      <div class="inner-border"></div>

      <div class="pm-certificate-border col-xs-12">
        <div class="row pm-certificate-header">
          <div class="pm-certificate-title col-xs-12 margin-0 text-center">
            <h2 class="sans">CERTIFICATE OF EXCELLENCE</h2>
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
                <span class="nameOfUser bold Rochester">{{this.cert.username}}</span>
              </div>
              <div class="col-xs-2">
                <!-- LEAVE EMPTY -->
              </div>
            </div>

            <div class="col-xs-12">
              <div class="pm-certificate-name margin-0 col-xs-8 text-center">
                <p class="bold">Has been recognized for outstanding achievement</p>
                <p class="bold">at {{this.cert.subjectID}} course</p>
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
                  <p>{{this.cert.issueDate}}</p>
                </div>
                <p>
                  <strong>DATE</strong>
                </p>
              </div>
              <div class="col-md-6 text-center">
                <div class="pm-certificate-name underline margin-0 text-center">
                  <p class="Rochester">{{this.cert.certificateID}}</p>
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
    <div v-else class="container">
      <h1 class="msg-text">{{this.msg}}</h1>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      success: Boolean,
      cert: {
        username: String,
        issueDate: String,
        certificateID: String,
        subjectID: String
      },
      msg: String
    };
  },
  created: async function() {
    let response = await axios.get(
      `${process.env.VUE_APP_API_BACKEND}/certificate/${this.$route.params.id}`
    );

    this.success = response.data.success;

    if (response.data.success) {
      // Convert Date to dd/mm/yy
      var today = new Date(response.data.msg.issueDate);
      var dd = today.getDate();
      var mm = today.getMonth() + 1; //January is 0!

      var yyyy = today.getFullYear();
      if (dd < 10) {
        dd = "0" + dd;
      }
      if (mm < 10) {
        mm = "0" + mm;
      }
      response.data.msg.issueDate = dd + "/" + mm + "/" + yyyy;

      this.cert = response.data.msg;
      console.log();
    } else {
      this.msg = response.data.msg;
    }
  }
};
</script>

<style scoped>
@import "../assets/styleCertificate.css";
</style>
