<template>
  <div>
    <b-modal
      id="modal-info"
      ref="modal-info"
      title="My Certificates"
      v-loading.fullscreen.lock="fullscreenLoading"
      ok-only
    >
    </b-modal>
    <table-student
      :title="`My Certificates`"
      :listAll="listMyCourses"
      :loadingData="loadingData"
      :listProperties="[
        { prop: 'CourseName', label: 'CourseName' },
        { prop: 'IssueDate', label: 'IssueDate' }
      ]"
      @detailCourses="detailCourse($event)"
      @modalInfo="modalInfo($event)"
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
    ...mapActions('student', ['getMyCertificates'])
  },
  computed: {
    ...mapState('student', ['listCertificate'])
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
