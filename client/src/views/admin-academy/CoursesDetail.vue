<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <h1 class="bannerTitle_1wzmt7u">{{ listCourses.CourseName }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item href="/academy"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item href="/academy/courses">Course</b-breadcrumb-item>
      <b-breadcrumb-item active>Course Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">About this course</h1>

          <p>{{ listCourses.Description }}</p>
        </div>
      </div>
    </div>
    <table-admin
      :title="`Subjects List`"
      :listAll="subjectsOfCourse ? subjectsOfCourse : []"
      :loadingData="loadingData"
      :btnInfo="true"
      :nameFunctionInfo="`showInfoSubject`"
      :btnDetail="true"
      :nameFunctionDetail="`detailStudents`"
      :nameFunctionDelete="`delStudent`"
      :btnDelete="true"
      :listProperties="[
        { prop: 'SubjectName', label: 'Subject Name' },
        { prop: 'SubjectCode', label: 'Subject Code' },
        { prop: 'ShortDescription', label: 'Short Description' }
      ]"
      @detailStudents="detailStudent($event)"
      @delStudent="delStudent($event)"
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

    <el-dialog
      title="Information Subject"
      :visible.sync="dialogForm.infoSubject"
      class="modal-with-create"
    >
      <el-form :model="infoSubject" ref="infoSubject">
        <div class="form-group">
          <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
            >Subject Name</label
          >
          <div class="col-sm-12">
            <h4 class="pl-3">{{ infoSubject.subjectName }}</h4>
          </div>
        </div>

        <div class="form-group">
          <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
            >Subject Code</label
          >
          <div class="col-sm-12">
            <h4 class="pl-3">{{ infoSubject.subjectCode }}</h4>
          </div>
        </div>
        <div class="form-group">
          <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
            >Short Description</label
          >
          <div class="col-sm-12">
            <h4 class="pl-3">{{ infoSubject.shortDescription }}</h4>
          </div>
        </div>

        <div class="form-group">
          <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
            >Description</label
          >
          <div class="col-sm-12">
            <h4 class="pl-3">{{ infoSubject.description }}</h4>
          </div>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('infoSubject')">Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableAdmin from '@/components/admin-academy/TableAdmin';
import { Button, Select, Option, Dialog, Form, FormItem, Message, MessageBox } from 'element-ui';
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
    'el-form-item': FormItem
  },
  data() {
    return {
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
      infoSubject: {
        subjectName: '',
        subjectCode: '',
        shortDescription: '',
        description: ''
      },
      dialogForm: {
        infoSubject: false,
        addSubject: false
      }
    };
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getCourse',
      'getSubjectsNoCourse',
      'addSubjectToCourse',
      'deleteSubjectFromCourse'
    ]),
    detailStudent(row) {
      this.$router.push({ path: `subjects/${row.StudentID}/students` });
    },
    async delStudent(row) {
      MessageBox.confirm(`You won't be able to revert this!`, 'Delete', {
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
            Message.success('Delete completed!');
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
          Message.info('Delete canceled');
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
          if (data.success) {
            await self.getCourse(this.$route.params.id);
            let subjectsNoCourse = await self.getSubjectsNoCourse(self.$route.params.id);
            if (subjectsNoCourse.success) {
              self.subjectsNoCourse = subjectsNoCourse.subjects;
            }
            self.resetAddSubject('formAdd');
            Message.success('Add subject to course success!');
          } else {
            Message.error(data.msg);
          }
          self.fullscreenLoading = false;
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    async resetAddSubject(formName) {
      this.$refs[formName].resetFields();
      this.dialogForm.addSubject = false;
    },
    showInfoSubject(row) {
      this.infoSubject.subjectName = row.SubjectName;
      this.infoSubject.subjectCode = row.SubjectCode;
      this.infoSubject.shortDescription = row.ShortDescription;
      this.infoSubject.description = row.Description;
      this.dialogForm.infoSubject = true;
    },
    resetForm(formName) {
      this[formName].subjectId = '';
      this[formName].subjectName = '';
      this[formName].subjectCode = '';
      this[formName].shortDescription = '';
      this[formName].description = '';
      this.$refs[formName].resetFields();
      this.dialogForm[formName] = false;
    }
  },
  computed: {
    ...mapState('adminAcademy', ['subjectsOfCourse', 'listCourses'])
  },
  async created() {
    await this.getCourse(this.$route.params.id);
    let subjectsNoCourse = await this.getSubjectsNoCourse(this.$route.params.id);
    if (subjectsNoCourse.success) {
      this.subjectsNoCourse = subjectsNoCourse.subjects;
    }
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
