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
              <div class="col-md-6 text-center">
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
  </div>
</template>

<script>
import axios from 'axios';
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      success: Boolean,
      cert: {
        certificateId: '',
        courseId: '',
        username: '',
        issueDate: '',
        courseName: '',
        fullname: ''
      },
      msg: String
    };
  },
  methods: {
    ...mapActions('student', ['getCertificate'])
  },
  computed: {
    ...mapState('student', ['myCertificates'])
  },
  created: async function() {
    let cert = await this.getCertificate(this.$route.params.certId);

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
@import '../assets/styleCertificate.css';
</style>
