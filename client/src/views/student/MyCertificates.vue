<template>
  <div>
    <table-student
      :title="`My Certificates`"
      :listAll="myCertificates"
      :loadingData="loadingData"
      :nameFunctionDetail="`detailCertificate`"
      :listProperties="[
        { prop: 'CourseName', label: 'CourseName' },
        { prop: 'Description', label: 'Description' },
        { prop: 'IssueDate', label: 'IssueDate' }
      ]"
      @detailCertificate="detailCertificate($event)"
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
      loadingData: false,
      infoCert: {
        courseName: ''
      }
    };
  },
  methods: {
    ...mapActions('student', ['getMyCertificates']),
    detailCertificate(row) {
      this.$router.push({ path: `cert/${row.CertificateID}` });
    }
  },
  computed: {
    ...mapState('student', ['myCertificates'])
  },
  async created() {
    let response = await this.getMyCertificates();

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
