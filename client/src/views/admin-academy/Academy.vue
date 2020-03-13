<template>
  <div>
    <div class="container-fluid mb-5">
      <h1 class="h3 mb-2 text-gray-800 mt-3">Dashboard</h1>
    </div>
    <el-row :gutter="30" class="mb-5">
      <router-link to="/academy/courses">
        <el-col :sm="8" :xs="24" class="mb-3 cursor-pointer">
          <el-card shadow="always">
            <div class="row">
              <div class="col-3 d-inline-flex p-2">
                <img src="@/assets/img/course.png" />
              </div>
              <div class="col-9 align-self-center">
                <h1>{{ summaryInfo.courseCount }}</h1>
                Courses
              </div>
            </div>
          </el-card>
        </el-col>
      </router-link>

      <router-link to="/academy/subjects">
        <el-col :sm="8" :xs="24" class="mb-3 cursor-pointer">
          <el-card shadow="always">
            <div class="row">
              <div class="col-3 d-inline-flex p-2">
                <img src="@/assets/img/subject.png" />
              </div>
              <div class="col-9 align-self-center">
                <h1>{{ summaryInfo.subjectCount }}</h1>
                Subjects
              </div>
            </div>
          </el-card>
        </el-col>
      </router-link>

      <el-col :sm="8" :xs="24" class="mb-3 cursor-pointer">
        <el-card shadow="always">
          <div class="row">
            <div class="col-3 d-inline-flex p-2">
              <img src="@/assets/img/class.png" class="width-100 " />
            </div>
            <div class="col-9 align-self-center">
              <h1>{{ summaryInfo.classCount }}</h1>
              Classes
            </div>
          </div>
        </el-card>
      </el-col>

      <router-link to="/academy/teachers">
        <el-col :sm="8" :xs="24" class="mb-3 cursor-pointer">
          <el-card shadow="always">
            <div class="row">
              <div class="col-3 d-inline-flex p-2">
                <img src="@/assets/img/teacher.png" />
              </div>
              <div class="col-9 align-self-center">
                <h1>{{ summaryInfo.teacherCount }}</h1>
                Teachers
              </div>
            </div>
          </el-card>
        </el-col>
      </router-link>

      <router-link to="/academy/students">
        <el-col :sm="8" :xs="24" class="mb-3 cursor-pointer">
          <el-card shadow="always">
            <div class="row">
              <div class="col-3 d-inline-flex p-2">
                <img src="@/assets/img/student.png" />
              </div>
              <div class="col-9 align-self-center">
                <h1>{{ summaryInfo.studentCount }}</h1>
                Students
              </div>
            </div>
          </el-card>
        </el-col>
      </router-link>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Vue from 'vue';
import { Tag, Row, Col, Card } from 'element-ui';
Vue.use(Tag);
Vue.use(Row);
Vue.use(Col);
Vue.use(Card);

export default {
  data() {
    return {
      fullscreenLoading: false,
      loadingData: false,
      value: new Date()
    };
  },
  computed: {
    ...mapState('adminAcademy', ['summaryInfo']),
    ...mapState({
      user: (state) => state.account
    })
  },
  methods: {
    ...mapActions('adminAcademy', ['getSummaryInfo'])
  },
  async created() {
    let response = await this.getSummaryInfo();

    if (response) {
      this.loadingData = false;
    }
  }
};
</script>

<style scoped>
span {
  display: block;
  font-size: 14px;
  width: 25%;
}
</style>
