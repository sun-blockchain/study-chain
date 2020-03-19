<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <h1 class="bannerTitle_1wzmt7u">{{ listStudents.Fullname }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item to="/academy/students">Student</b-breadcrumb-item>
      <b-breadcrumb-item active>Student Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body row">
          <div class="col">
            <h1 class="h3 mb-2 text-gray-800">Personal information</h1>
            <p>Date of birth: {{ listStudents.Info.Birthday }}</p>
            <p>Gender: {{ listStudents.Info.Sex == 0 ? 'Male' : 'Female' }}</p>
            <p>Address: {{ listStudents.Info.Address }}</p>
            <p>Date of birth: {{ listStudents.Info.Email }}</p>
            <p>Country: {{ listStudents.Info.Country }}</p>
          </div>
          <div class="col">
            <img
              v-if="listStudents.Info.Avatar"
              :src="listStudents.Info.Avatar"
              :alt="Avatar"
              class="avatar"
            />
            <img v-else src="@/assets/img/avatar-default.png" class="avatar" />
          </div>
        </div>
      </div>
    </div>
    <el-tabs type="border-card">
      <el-tab-pane label="Classes">
        <table-admin
          :title="`Class List`"
          :listAll="classesOfStudent ? classesOfStudent : []"
          :loadingData="loadingData"
          :nameFunctionDetail="`detailClass`"
          :listProperties="[
            { prop: 'ClassCode', label: 'Class' },
            { prop: 'Time', label: 'Time' },
            { prop: 'Repeat', label: 'Repeat' },
            { prop: 'Capacity', label: 'Capacity' }
          ]"
          :date="true"
          :statusCol="true"
          @detailClass="detailClass($event)"
        >
        </table-admin>
      </el-tab-pane>
      <el-tab-pane label="Courses">
        <table-admin
          :title="`Courses`"
          :listAll="coursesOfStudent ? coursesOfStudent : []"
          :loadingData="loadingData"
          :nameFunctionDetail="`detailCourses`"
          :listProperties="[
            { prop: 'CourseCode', label: 'CourseCode' },
            { prop: 'CourseName', label: 'CourseName' },
            { prop: 'ShortDescription', label: 'Description' }
          ]"
          @detailCourses="detailCourse($event)"
        >
        </table-admin>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableAdmin from '@/components/admin-academy/TableAdmin';
import {
  Button,
  Select,
  Option,
  Dialog,
  Form,
  FormItem,
  Message,
  MessageBox,
  TabPane,
  Tabs
} from 'element-ui';
export default {
  components: {
    'el-button': Button,
    'el-select': Select,
    'el-option': Option,
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-tab-pane': TabPane,
    'el-tabs': Tabs,
    'table-admin': TableAdmin
  },
  data() {
    return {
      fullscreenLoading: false,
      loadingData: true
    };
  },
  methods: {
    ...mapActions('adminAcademy', ['getStudent', 'getCoursesOfStudent', 'getClassesOfStudent']),
    detailClass(row) {
      this.$router.push({
        path: `/academy/subjects/${row.SubjectID}/class/${row.ClassID}`
      });
    },
    detailCourse(row) {
      this.$router.push({ path: `/academy/courses/${row.CourseID}/course-detail` });
    }
  },
  computed: {
    ...mapState('adminAcademy', ['listStudents', 'classesOfStudent', 'coursesOfStudent'])
  },
  async created() {
    let student = await this.getStudent(this.$route.params.id);
    let courses = await this.getCoursesOfStudent(student.Username);
    let classes = await this.getClassesOfStudent(student.Username);

    if (courses && classes) {
      this.loadingData = false;
    }
  }
};
</script>
<style scoped>
.el-select {
  width: 100%;
}
.bannerTitle_1wzmt7u {
  font-family: 'OpenSans-Bold', Arial, sans-serif;
  font-size: 34px;
  line-height: 46px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 24px;
  color: blue;
}
.avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  align-self: center;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
