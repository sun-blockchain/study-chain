<template>
  <div>
    <table-student
      :title="`List Courses`"
      :listAll="listCourses"
      :loadingData="loadingData"
      :btnRegister="true"
      :nameFunctionRegister="`enrollCourse`"
      :btnDetail="true"
      :nameFunctionDetail="`detailCourses`"
      :listProperties="[
        { prop: 'CourseCode', label: 'CourseCode' },
        { prop: 'CourseName', label: 'CourseName' },
        { prop: 'ShortDescription', label: 'Description' }
      ]"
      @detailCourses="detailCourse($event)"
      @enrollCourse="enrollCourse($event)"
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
      editCourse: {
        CourseID: '',
        CourseCode: '',
        CourseName: '',
        ShortDescription: '',
        Description: ''
      },
      newCourse: {
        CourseCode: '',
        CourseName: '',
        ShortDescription: '',
        Description: ''
      },
      fullscreenLoading: false,
      loadingData: false
    };
  },
  methods: {
    ...mapActions('student', ['getAllCourses', 'getCourse', 'registerCourse']),
    detailCourse(row) {
      this.$router.push({ path: `courses/${row.CourseID}` });
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
          } else {
            this.fullscreenLoading = false;
            this.$swal('Failed!', 'Fail to register course.', 'danger');
          }
        }
      });
    }
  },
  computed: {
    ...mapState('student', ['listCourses'])
  },
  async created() {
    let response = await this.getAllCourses();
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
