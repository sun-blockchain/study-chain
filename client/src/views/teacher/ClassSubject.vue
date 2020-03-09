<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <div class="container-fluid">
      <h1 class="bannerTitle_1wzmt7u">ClassRoom: {{ listClasses.Room }}</h1>
      <b-breadcrumb>
        <b-breadcrumb-item to="/"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
        <b-breadcrumb-item active>Class Detail</b-breadcrumb-item>
      </b-breadcrumb>
      <div class="mb-5">
        <div>
          <div class="card-body">
            <h2 class="h4 mb-2 text-gray-800">About this classs</h2>
            <p>Time: {{ listClasses.Time }}</p>
            <p>Capacity: {{ listClasses.Capacity }}</p>
            <p>
              Status:
              <b-badge :variant="listClasses.Status === 'Open' ? 'success' : 'primary'">{{
                listClasses.Status
              }}</b-badge>
            </p>
            <p>{{ listClasses.Description }}</p>
          </div>
        </div>
      </div>
      <table-teacher
        :title="`Student List`"
        :listAll="listStudents ? listStudents : []"
        :loadingData="loadingData"
        :btnInfo="true"
        :btnEdit="true"
        :nameFunctionInfo="`showInfoStudent`"
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
        @showInfoStudent="showInfoStudent($event)"
        @updateScore="editScoreModal($event)"
      >
      </table-teacher>
      <el-dialog title="Edit Score" :visible.sync="showEditScore" class="modal-with-create">
        <el-form ref="updateScore">
          <template>
            <el-input-number
              v-model="Score.scoreValue"
              :step="0.1"
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

      <el-dialog title="Information Student" :visible.sync="showInfo" class="modal-with-create">
        <el-form :model="infoStudent" ref="infoStudent">
          <div>
            <img v-if="infoStudent.Avatar" :src="infoStudent.Avatar" :alt="Avatar" class="avatar" />
            <img v-else src="@/assets/img/avatar-default.png" class="avatar" />
          </div>

          <div class="form-group">
            <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
              >Phone Number</label
            >
            <div class="col-sm-12">
              <h4 class="pl-3">{{ infoStudent.PhoneNumber }}</h4>
            </div>
          </div>

          <div class="form-group">
            <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
              >Email</label
            >
            <div class="col-sm-12">
              <h4 class="pl-3">{{ infoStudent.Email }}</h4>
            </div>
          </div>
          <div class="form-group">
            <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
              >Address</label
            >
            <div class="col-sm-12">
              <h4 class="pl-3">{{ infoStudent.Address }}</h4>
            </div>
          </div>
          <div class="form-group">
            <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
              >Gender</label
            >
            <div class="col-sm-12">
              <h4 class="pl-3">{{ infoStudent.Sex }}</h4>
            </div>
          </div>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetForm()">Cancel</el-button>
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
      Score: {
        scoreValue: '',
        classId: '',
        studentUsername: ''
      },
      loadingData: false,
      fullscreenLoading: false,
      showInfo: false,
      showEditScore: false,
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
    ...mapActions('adminAcademy', ['getClass', 'getStudentsOfClass']),
    ...mapActions('teacher', ['updateScore']),

    editScoreModal(row) {
      this.showEditScore = true;
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
      if (score.success) {
        Message.success('Success!');
      } else {
        Message.error('Error!');
      }
      this.fullscreenLoading = false;
      this.showEditScore = false;
    },
    cancelEdit() {
      this.showEditScore = false;
    },
    showInfoStudent(row) {
      this.showInfo = true;
      this.infoStudent.PhoneNumber = row.Info.PhoneNumber;
      this.infoStudent.Email = row.Info.Email;
      this.infoStudent.Address = row.Info.Address;
      this.infoStudent.Sex = row.Info.Sex;
      this.infoStudent.Birthday = row.Info.Birthday;
      this.infoStudent.Avatar = row.Info.Avatar;
      this.infoStudent.Country = row.Info.Country;
    },
    resetForm() {
      this.showInfo = false;
    }
  },
  computed: {
    ...mapState('adminAcademy', ['listClasses', 'listStudents']),
    ...mapState('teacher', ['scores'])
  },
  async created() {
    let _class = await this.getClass(this.$route.params.classId);
    let student = await this.getStudentsOfClass(this.$route.params.classId);
    if (_class.success && student) {
      this.listClasses = _class.class;
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
