<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <h1 class="bannerTitle_1wzmt7u">{{ listCourses.CourseName }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/academy"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item to="/academy/courses">Course</b-breadcrumb-item>
      <b-breadcrumb-item active>Course Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <div>
            <h1 class="h3 mb-2 text-gray-800">About this course</h1>

            <p>{{ listCourses.Description }}</p>
            <p>
              Status :
              <b-badge :variant="listCourses.Status === 'Open' ? 'success' : 'danger'">{{
                listCourses.Status
              }}</b-badge>
            </p>
          </div>

          <div class="mt-3">
            <el-button
              :type="listCourses.Status === 'Open' ? 'danger' : 'success'"
              round
              size="mini"
              @click="changeStatus()"
              >{{ listCourses.Status === 'Open' ? 'Close' : 'Open' }}</el-button
            >
          </div>
        </div>
      </div>
    </div>
    <el-tabs type="border-card">
      <el-tab-pane label="Subject">
        <table-admin
          :title="`Subjects List`"
          :listAll="subjectsOfCourse ? subjectsOfCourse : []"
          :loadingData="loadingData"
          :nameFunctionDetail="`detailSubject`"
          :nameFunctionDelete="`delSubject`"
          :btnDelete="true"
          :listProperties="[
            { prop: 'SubjectName', label: 'Subject Name' },
            { prop: 'SubjectCode', label: 'Subject Code' },
            { prop: 'ShortDescription', label: 'Short Description' }
          ]"
          @detailSubject="detailSubject($event)"
          @delSubject="delSubject($event)"
          @showInfoSubject="showInfoSubject($event)"
        >
          <template v-slot:btn-create>
            <el-button
              type="success"
              icon="fas fa-plus"
              size="medium"
              round
              @click="dialogForm.addSubject = true"
            ></el-button>
            <!-- <div class="box-defaul-header"></div> -->
          </template>
        </table-admin>
      </el-tab-pane>
      <el-tab-pane label="Student"
        ><table-admin
          :title="`Student List`"
          :listAll="listStudents ? listStudents : []"
          :loadingData="loadingData"
          :btnInfo="true"
          :nameFunctionInfo="`showInfoStudent`"
          :nameFunctionDetail="`detailStudent`"
          :listProperties="[
            { prop: 'Fullname', label: 'Student Name' },
            { prop: 'Info.Birthday', label: 'Date Of Birth' },
            { prop: 'Info.Address', label: 'Address' }
          ]"
          @detailStudent="detailStudent($event)"
          @showInfoStudent="showInfoStudent($event)"
        >
        </table-admin
      ></el-tab-pane>
    </el-tabs>

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
        <el-button @click="resetFormStudent()">Cancel</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Add Subject To Course"
      :visible.sync="dialogForm.addSubject"
      class="modal-md-25-sm-90"
    >
      <el-form :model="formAdd" :rules="ruleAdd" ref="formAdd" class="demo-ruleForm">
        <el-form-item prop="subjectId">
          <el-select v-model="formAdd.subjectId" placeholder="Subject">
            <el-option
              :label="subject.SubjectName"
              :value="subject.SubjectID"
              v-for="(subject, index) in subjectsNoCourse"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetAddSubject('formAdd')">Cancel</el-button>
        <el-button type="primary" @click="handleAddSubject('formAdd')">Add</el-button>
      </span>
    </el-dialog>
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
    ValidationObserver,
    ValidationProvider,
    TableAdmin,
    'el-button': Button,
    'el-select': Select,
    'el-option': Option,
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-tab-pane': TabPane,
    'el-tabs': Tabs
  },
  data() {
    return {
      infoStudent: {
        PhoneNumber: '',
        Email: '',
        Address: '',
        Sex: '',
        Birthday: '',
        Avatar: '',
        Country: ''
      },
      items: [
        {
          text: 'Course',
          href: `${process.env.VUE_APP_API_BACKEND}/academy/courses`
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
      subjectsNoCourse: [],
      editStudent: {
        StudentID: '',
        StudentCode: '',
        StudentName: '',
        Class: ''
      },
      newStudent: {
        StudentCode: '',
        StudentName: '',
        Class: ''
      },
      fullscreenLoading: false,
      loadingData: false,
      formAdd: {
        subjectId: null
      },
      ruleAdd: {
        subjectId: [{ required: true, message: 'Subject is required', trigger: 'blur' }]
      },
      dialogForm: {
        addSubject: false
      },
      showInfo: false
    };
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getCourse',
      'changeCourseStatus',
      'getSubjectsNoCourse',
      'addSubjectToCourse',
      'deleteSubjectFromCourse',
      'getStudentsOfCourse'
    ]),
    changeStatus() {
      var warning;
      var responseMessage;
      var status;

      if (this.listCourses.Status === 'Open') {
        warning = 'close this course';
        status = 'closeCourse';
        responseMessage = 'closed';
      } else {
        warning = 'open this course';
        status = 'openCourse';
        responseMessage = 'opened ';
      }
      MessageBox.confirm(`Are you sure to ${warning}?`, {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
        center: true
      })
        .then(async () => {
          this.fullscreenLoading = true;

          let data = await this.changeCourseStatus({
            courseId: this.$route.params.id,
            status: status
          });

          if (data) {
            if (data.success) {
              this.status = false;
              Message.success(`This class has been ${responseMessage}!`);
            } else {
              Message.error(data.msg);
            }
          }
          await this.getCourse(this.$route.params.id);
          this.fullscreenLoading = false;
        })
        .catch(() => {
          Message.info('Canceled');
        });
    },
    detailSubject(row) {
      this.$router.push({ path: `/academy/subjects/${row.SubjectID}` });
    },
    async delSubject(row) {
      MessageBox.confirm(`You won't be able to revert this!`, 'Remove', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
        center: true
      })
        .then(async () => {
          this.fullscreenLoading = true;
          let data = await this.deleteSubjectFromCourse({
            courseId: this.$route.params.id,
            subjectId: row.SubjectID
          });
          if (data.success) {
            await this.getCourse(this.$route.params.id);
            let subjectsNoCourse = await this.getSubjectsNoCourse(this.$route.params.id);
            if (subjectsNoCourse.success) {
              this.subjectsNoCourse = subjectsNoCourse.subjects;
            }
            Message.success('Remove completed!');
          } else {
            if (data.data.msg) {
              Message.error(data.data.msg);
            } else {
              Message.error(data.statusText);
            }
          }
          this.fullscreenLoading = false;
        })
        .catch(() => {
          Message.info('Remove canceled');
        });
    },
    async handleAddSubject(formName) {
      let self = this;
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          self.fullscreenLoading = true;
          let data = await self.addSubjectToCourse({
            courseId: self.$route.params.id,
            subjectId: self.formAdd.subjectId
          });
          if (data) {
            if (data.success) {
              await self.getCourse(this.$route.params.id);
              let subjectsNoCourse = await self.getSubjectsNoCourse(self.$route.params.id);
              if (subjectsNoCourse.success) {
                self.subjectsNoCourse = subjectsNoCourse.subjects;
              }
              self.resetAddSubject('formAdd');
              Message.success('Add subject to course successfully!');
            } else {
              Message.error(data.msg);
            }
          }
          self.fullscreenLoading = false;
        } else {
          return false;
        }
      });
    },
    async resetAddSubject(formName) {
      this.$refs[formName].resetFields();
      this.dialogForm.addSubject = false;
    },
    resetForm(formName) {
      this[formName].subjectId = '';
      this[formName].subjectName = '';
      this[formName].subjectCode = '';
      this[formName].shortDescription = '';
      this[formName].description = '';
      this.$refs[formName].resetFields();
      this.dialogForm[formName] = false;
    },
    detailStudent(row) {
      this.$router.push({
        path: `/academy/student/${row.Username}`
      });
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
    resetFormStudent() {
      this.showInfo = false;
    }
  },
  computed: {
    ...mapState('adminAcademy', ['subjectsOfCourse', 'listCourses', 'listStudents'])
  },
  async created() {
    let course = await this.getCourse(this.$route.params.id);
    let subjectsNoCourse = await this.getSubjectsNoCourse(this.$route.params.id);
    let subjectList = subjectsNoCourse.subjects;
    let studentList = await this.getStudentsOfCourse(this.$route.params.id);
    if (course && subjectList && studentList) {
      this.subjectsNoCourse = subjectList;
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
