<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <table-student
      :title="`My Courses`"
      :listAll="listMyCourses"
      :loadingData="loadingData"
      :btnGetCert="true"
      :nameFunctionDetail="`detailCourses`"
      :nameFunctionGetCert="`getCert`"
      :listProperties="[
        { prop: 'CourseCode', label: 'CourseCode' },
        { prop: 'CourseName', label: 'CourseName' },
        { prop: 'ShortDescription', label: 'Description' }
      ]"
      @detailCourses="detailCourse($event)"
      @getCert="getCertificate($event)"
    ></table-student>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableStudent from '@/components/student/TableStudent';
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
    ...mapActions('student', ['getMyCourses', 'claimCertificate']),
    detailCourse(row) {
      this.$router.push({ path: `myCourses/${row.CourseID}` });
    },
    async getCertificate(row) {
      this.fullscreenLoading = true;
      let data = await this.claimCertificate(row.CourseID);
      if (data.success) {
        Message.success('Get certificate successfully!');
        this.$router.push({ path: `student/mycertificates` });
      } else {
        Message.success('fail to get certificate!');
      }
      this.fullscreenLoading = false;
    }
  },
  computed: {
    ...mapState('student', ['listMyCourses'])
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
