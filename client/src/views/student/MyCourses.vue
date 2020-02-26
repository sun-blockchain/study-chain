<template>
  <div>
    <b-modal
      id="modal-info"
      ref="modal-info"
      title="Description Course"
      v-loading.fullscreen.lock="fullscreenLoading"
      ok-only
    >
      <p>{{ infoCourse.description }}</p>
    </b-modal>
    <table-student
      :title="`My Courses`"
      :listAll="listMyCourses"
      :loadingData="loadingData"
      :btnDetail="true"
      :nameFunctionDetail="`detailCourses`"
      :btnInfo="true"
      :nameFunctionInfo="`modalInfo`"
      :listProperties="[
        { prop: 'CourseCode', label: 'CourseCode' },
        { prop: 'CourseName', label: 'CourseName' },
        { prop: 'ShortDescription', label: 'Description' }
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
      loadingData: false,
      infoCourse: {
        description: ''
      }
    };
  },
  methods: {
    ...mapActions('student', ['getMyCourses']),
    detailCourse(row) {
      this.$router.push({ path: `myCourses/${row.CourseID}` });
    },
    modalInfo(row) {
      this.infoCourse.description = row.Description;
      this.$root.$emit('bv::show::modal', 'modal-info');
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
