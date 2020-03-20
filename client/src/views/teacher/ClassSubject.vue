<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <div class="container-fluid">
      <h1 class="bannerTitle_1wzmt7u">{{ classInfo.ClassCode }}</h1>
      <b-breadcrumb>
        <b-breadcrumb-item to="/"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
        <b-breadcrumb-item active>{{ subjectName }}</b-breadcrumb-item>
      </b-breadcrumb>
      <div class="mb-5">
        <div>
          <div class="card-body">
            <h2 class="h4 mb-2 text-gray-800">About this class</h2>
            <p>
              Time: <b>{{ classInfo.Time }}</b>
            </p>
            <p>
              Start:
              <b>{{ convertDate(classInfo.StartDate) }} </b>
            </p>
            <p>
              End:
              <b> {{ convertDate(classInfo.EndDate) }}</b>
            </p>
            <p>
              Repeat:
              <b
                >{{
                  classInfo.Repeat +
                    (classInfo.StartDate ? ' on ' + getDay(classInfo.StartDate) : '')
                }}
              </b>
            </p>
          </div>
          <div class="col">
            <p>
              Room:
              <b> {{ classInfo.Room }}</b>
            </p>
            <p>
              Capacity:
              <b> {{ classInfo.Capacity }}</b>
            </p>
            <p>
              Status:
              <b-badge :variant="classInfo.Status === 'Open' ? 'success' : 'primary'">{{
                classInfo.Status
              }}</b-badge>
            </p>
          </div>
        </div>
      </div>
      <table-teacher
        :title="`Student List`"
        :listAll="listStudents ? listStudents : []"
        :loadingData="loadingData"
        :btnEdit="true"
        :nameFunctionEdit="`updateScore`"
        :nameFunctionDelete="`delStudent`"
        :btnDelete="false"
        :listProperties="[
          { prop: 'Fullname', label: 'FullName' },
          { prop: 'Info.Birthday', label: 'Birthday' },
          { prop: 'Info.Address', label: 'Address' },
          { prop: 'Score', label: 'Score' }
        ]"
        @delStudent="delStudent($event)"
        @updateScore="editScoreModal($event)"
      >
      </table-teacher>
      <el-dialog title="Edit Score" :visible.sync="showEditScore" class="modal-with-create">
        <el-form ref="updateScore">
          <template>
            <el-input-number
              v-model="Score.scoreValue"
              :step="1.0"
              :min="0"
              :max="10"
              controls-position="right"
            ></el-input-number>
          </template>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="danger" @click="cancelEdit()">Cancel</el-button>
          <el-button type="primary" @click="handleEditScore()">Confirm</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableTeacher from '@/components/teacher/TableTeacher';
import {
  Button,
  Select,
  Option,
  Dialog,
  Form,
  FormItem,
  Message,
  MessageBox,
  InputNumber
} from 'element-ui';

export default {
  data() {
    return {
      daysInWeek: [
        { item: 'Sun', value: 'Sunday' },
        { item: 'Mon', value: 'Monday' },
        { item: 'Tue', value: 'Tuesday' },
        { item: 'Wed', value: 'Wednesday' },
        { item: 'Thu', value: 'Thursday' },
        { item: 'Fri', value: 'Friday' },
        { item: 'Sat', value: 'Saturday' }
      ],
      Score: {
        scoreValue: '',
        classId: '',
        studentUsername: ''
      },
      loadingData: false,
      fullscreenLoading: false,
      showInfo: false,
      showEditScore: false,
      subjectName: '',
      infoStudent: {
        PhoneNumber: '',
        Email: '',
        Address: '',
        Sex: '',
        Birthday: '',
        Avatar: '',
        Country: ''
      }
    };
  },
  components: {
    ValidationObserver,
    ValidationProvider,
    TableTeacher,
    'el-button': Button,
    'el-select': Select,
    'el-option': Option,
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input-number': InputNumber
  },
  methods: {
    ...mapActions('adminAcademy', ['getClass', 'getStudentsOfClass', 'getSubject']),
    ...mapActions('teacher', ['updateScore']),

    editScoreModal(row) {
      this.showEditScore = true;
      this.Score.scoreValue = row.Score;
      this.Score.studentUsername = row.Username;
      this.Score.classId = this.$route.params.classId;
    },
    async handleEditScore() {
      this.fullscreenLoading = true;

      let score = await this.updateScore({
        classId: this.Score.classId,
        score: this.Score.scoreValue,
        studentUsername: this.Score.studentUsername
      });

      let students = await this.getStudentsOfClass(this.$route.params.classId);

      if (score && students) {
        Message.success('Pick score succesfully!');
      } else if (!students) {
        Message.error('Loading list student error!');
      } else {
        Message.error('Pick score has failed!');
      }
      this.fullscreenLoading = false;
      this.showEditScore = false;
    },
    cancelEdit() {
      this.showEditScore = false;
    },
    resetForm() {
      this.showInfo = false;
    },
    convertDate(timestamp) {
      let date = new Date(parseInt(timestamp));
      return date.toDateString();
    },
    getDay(timestamp) {
      let date = new Date(parseInt(timestamp));
      let day = this.daysInWeek[date.getDay()].value;

      return day.toString();
    }
  },
  computed: {
    ...mapState('adminAcademy', ['classInfo', 'listStudents']),
    ...mapState('teacher', ['scores'])
  },
  async created() {
    let classInfo = await this.getClass(this.$route.params.classId);
    let student = await this.getStudentsOfClass(this.$route.params.classId);
    let subjectInfo = await this.getSubject(classInfo.SubjectID);

    if (classInfo && student.success && subjectInfo) {
      this.subjectName = subjectInfo.subject.SubjectName;
    }
    this.loadingData = false;
  }
};
</script>
<style scoped>
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
.el-input-number {
  display: block;
  margin: auto;
  width: 50%;
}
</style>
