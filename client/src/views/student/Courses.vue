<template>
  <div>
    <table-admin
      :title="`List Courses`"
      :listAll="listCourses"
      :loadingData="loadingData"
      :btnDetail="true"
      :nameFunctionDetail="`detailCourses`"
      :listProperties="[
        { prop: 'CourseCode', label: 'CourseCode' },
        { prop: 'CourseName', label: 'CourseName' },
        { prop: 'ShortDescription', label: 'Description' }
      ]"
      @detailCourses="detailCourse($event)"
    ></table-admin>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import TableAdmin from "@/components/admin-academy/TableAdmin";
export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableAdmin
  },
  data() {
    return {
      editCourse: {
        CourseID: "",
        CourseCode: "",
        CourseName: "",
        ShortDescription: "",
        Description: ""
      },
      newCourse: {
        CourseCode: "",
        CourseName: "",
        ShortDescription: "",
        Description: ""
      },
      fullscreenLoading: false,
      loadingData: false
    };
  },
  methods: {
    ...mapActions("student", ["getAllCourses", "getCourse"]),
    detailCourse(row) {
      this.$router.push({ path: `courses/${row.CourseID}/course-detail` });
    }
  },
  computed: {
    ...mapState("student", ["listCourses"])
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



