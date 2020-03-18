<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <table-student
      :title="`List Not Register Courses`"
      :listAll="listNotRegisterCourses"
      :loadingData="loadingData"
      :statusCol="true"
      :btnRegister="true"
      :nameFunctionRegister="`enrollCourse`"
      :nameFunctionDetail="`detailCourses`"
      :btnDetail="true"
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
import { MessageBox, Message } from 'element-ui';
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
    enrollCourse(row) {
      MessageBox.confirm(`Are you sure enroll this course ?`, 'Enroll', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'success',
        center: true
      })
        .then(async () => {
          this.fullscreenLoading = true;
          let data = await this.registerCourse(row.CourseID);
          if (data) {
            if (data.success) {
              Message.success('Successfully enrolled this course!');
              this.$router.push({ path: `/myCourses` });
            } else {
              Message.error('Failed to enroll this course!');
            }
          }
          this.fullscreenLoading = false;
        })
        .catch(() => {});
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
