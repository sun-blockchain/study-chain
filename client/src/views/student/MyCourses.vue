<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <table-student
      :title="`My Courses`"
      :listAll="listMyCourses"
      :loadingData="loadingData"
      :statusCol="true"
      :inProgress="true"
      :btnGetCert="true"
      :linkCert="true"
      :nameFunctionDetail="`detailCourses`"
      :btnDetail="true"
      :nameFunctionGetCert="`getCert`"
      :nameFunctionLinkCert="`linkToCert`"
      :attrGetCert="`getCert`"
      :listProperties="[
        { prop: 'CourseCode', label: 'CourseCode' },
        { prop: 'CourseName', label: 'CourseName' },
        { prop: 'ShortDescription', label: 'Description' }
      ]"
      @detailCourses="detailCourse($event)"
      @getCert="getCertificate($event)"
      @linkToCert="linkToCert($event)"
    ></table-student>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableStudent from '@/components/student/TableStudent';
import { Message, MessageBox } from 'element-ui';

export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableStudent
  },
  data() {
    return {
      fullscreenLoading: false,
      loadingData: false
    };
  },
  methods: {
    ...mapActions('student', ['getMyCourses', 'claimCertificate', 'getCertificateByCourseId']),
    detailCourse(row) {
      this.$router.push({ path: `myCourses/${row.CourseID}` });
    },
    async getCertificate(row) {
      this.fullscreenLoading = true;
      let data = await this.claimCertificate(row.CourseID);
      if (!data) {
        Message.error('You have not completed this course!');
      } else if (data) {
        let certId = await this.getCertificateByCourseId(row.CourseID);
        let redirectCert = this.$router.resolve({
          name: 'certificate',
          path: `cert/${certId}`
        });

        window.open(redirectCert.href, '_blank');
        Message.success('Get certificate successfully!');
        let response = await this.getMyCourses();
      }
      this.fullscreenLoading = false;
    },
    async linkToCert(row) {
      let certId = await this.getCertificateByCourseId(row.CourseID);

      let redirectCert = this.$router.resolve({
        name: 'certificate',
        path: `cert/${certId}`
      });

      window.open(redirectCert.href, '_blank');
    }
  },
  computed: {
    ...mapState('student', ['listMyCourses', 'myCertificates'])
  },
  async created() {
    let response = await this.getMyCourses();

    if (response) {
      this.loadingData = false;
    }
  }
};
</script>

<style scoped>
.cell {
  text-align: center;
}
</style>
