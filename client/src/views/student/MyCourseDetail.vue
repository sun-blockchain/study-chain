<template>
  <div class="container-fluid">
    <h1 class="bannerTitle_1wzmt7u">{{ courseInfo.course ? courseInfo.course.CourseName : '' }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/student"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item to="/myCourses">My Courses</b-breadcrumb-item>
      <b-breadcrumb-item active>{{ courseInfo.course.CourseName }}</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">About this course</h1>
          <p>{{ courseInfo.course ? courseInfo.course.Description : '' }}</p>
        </div>
      </div>
    </div>

    <table-student
      :title="`List Subjects`"
      :listAll="listSubjects"
      :loadingData="loadingData"
      :nameFunctionDetail="`detailSubjects`"
      :btnDetail="true"
      :listProperties="[
        { prop: 'SubjectCode', label: 'Subject Code' },
        { prop: 'SubjectName', label: 'Subject Name' },
        { prop: 'ShortDescription', label: 'Short Description' },
        { prop: 'score', label: 'Score' }
      ]"
      @detailSubjects="detailSubject($event)"
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
      items: [
        {
          text: 'Course',
          href: `${process.env.VUE_APP_API_BACKEND}/common/courses`
        },
        {
          text: 'Course Detail',
          active: true
        }
      ],
      course: {
        courseCode: '',
        courseName: '',
        description: ''
      },
      infoSubject: {
        description: ''
      },
      fullscreenLoading: false,
      loadingData: false
    };
  },
  methods: {
    ...mapActions('student', ['getCourse', 'getSubjectsOfCourse']),
    detailSubject(row) {
      this.$router.push({
        path: `/myCourses/${this.$route.params.id}/subject/${row.SubjectID}`
      });
    }
  },
  computed: {
    ...mapState('student', ['listSubjects', 'courseInfo'])
  },
  async created() {
    await this.getCourse(this.$route.params.id);
    await this.getSubjectsOfCourse(this.$route.params.id);
    this.loadingData = false;
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
</style>
