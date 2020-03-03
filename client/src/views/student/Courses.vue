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
      :title="`List Not Register Courses`"
      :listAll="listNotRegisterCourses"
      :loadingData="loadingData"
      :btnRegister="true"
      :nameFunctionRegister="`enrollCourse`"
      :nameFunctionDetail="`detailCourses`"
      :btnInfo="true"
      :nameFunctionInfo="`modalInfo`"
      :listProperties="[
        { prop: 'CourseCode', label: 'CourseCode' },
        { prop: 'CourseName', label: 'CourseName' },
        { prop: 'ShortDescription', label: 'Description' }
      ]"
      @detailCourses="detailCourse($event)"
      @enrollCourse="enrollCourse($event)"
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
    ...mapActions('student', ['getNotRegisterCourses', 'getCourse', 'registerCourse']),
    detailCourse(row) {
      this.$router.push({ path: `courses/${row.CourseID}` });
    },
    modalInfo(row) {
      this.infoCourse.description = row.Description;
      this.$root.$emit('bv::show::modal', 'modal-info');
    },
    async enrollCourse(row) {
      this.$swal({
        text: 'Are you sure register this course ?',
        type: 'success',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Confirm',
        reverseButtons: true
      }).then(async (result) => {
        if (result.value) {
          this.fullscreenLoading = true;
          let response = await this.registerCourse(row.CourseID);
          if (response.status === 200) {
            this.fullscreenLoading = false;
            this.$swal('Registered!', 'Course has been registered.', 'success');
            this.$router.push({ path: `/myCourses` });
          } else {
            this.fullscreenLoading = false;
            this.$swal('Failed!', 'Fail to register course.', 'danger');
          }
        }
      });
    }
  },
  computed: {
    ...mapState('student', ['listNotRegisterCourses'])
  },
  async created() {
    let response = await this.getNotRegisterCourses();
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
