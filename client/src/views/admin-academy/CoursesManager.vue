<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <table-admin
      :title="`Courses Manager`"
      :listAll="listCourses ? listCourses : []"
      :loadingData="loadingData"
      :nameFunctionDetail="`detailCourses`"
      :btnEdit="true"
      :nameFunctionEdit="`modalEdit`"
      :statusCol="true"
      :btnChangeStatus="true"
      :nameFunctionChangeStatus="`changeStatus`"
      :filter="[
        { text: 'Open', value: 'Open' },
        { text: 'Closed', value: 'Closed' }
      ]"
      :listProperties="[
        { prop: 'CourseCode', label: 'CourseCode' },
        { prop: 'CourseName', label: 'CourseName' },
        { prop: 'ShortDescription', label: 'Description' }
      ]"
      @detailCourses="detailCourse($event)"
      @modalEdit="modalEdit($event)"
      @changeStatus="changeStatus($event)"
    >
      <template v-slot:btn-create>
        <el-button
          type="success"
          icon="fas fa-plus"
          size="medium"
          round
          @click="dialogForm.newCourse = true"
        ></el-button>
        <!-- <div class="box-defaul-header"></div> -->
      </template>
    </table-admin>

    <el-dialog
      title="Edit Course"
      :visible.sync="dialogForm.editCourse"
      class="modal-with-create"
      v-loading.fullscreen.lock="fullscreenLoading"
    >
      <el-form :model="editCourse" :rules="ruleCourse" ref="editCourse">
        <el-form-item prop="CourseName">
          <el-input
            v-model="editCourse.CourseName"
            autocomplete="off"
            placeholder="Course Name"
          ></el-input>
        </el-form-item>
        <el-form-item prop="CourseCode">
          <el-input
            v-model="editCourse.CourseCode"
            autocomplete="off"
            placeholder="Course Code"
          ></el-input>
        </el-form-item>
        <el-form-item prop="ShortDescription">
          <el-input
            v-model="editCourse.ShortDescription"
            autocomplete="off"
            placeholder="Course Short Description"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
        <el-form-item prop="Description">
          <el-input
            v-model="editCourse.Description"
            autocomplete="off"
            placeholder="Course Description"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('editCourse')">Cancel</el-button>
        <el-button type="primary" @click="handleUpdate('editCourse')">Confirm</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Create Course"
      :visible.sync="dialogForm.newCourse"
      class="modal-with-create"
      v-loading.fullscreen.lock="fullscreenLoading"
    >
      <el-form :model="newCourse" :rules="ruleCourse" ref="newCourse">
        <el-form-item prop="CourseName">
          <el-input
            v-model="newCourse.CourseName"
            autocomplete="off"
            placeholder="Course Name"
          ></el-input>
        </el-form-item>
        <el-form-item prop="CourseCode">
          <el-input
            v-model="newCourse.CourseCode"
            autocomplete="off"
            placeholder="Course Code"
          ></el-input>
        </el-form-item>
        <el-form-item prop="ShortDescription">
          <el-input
            v-model="newCourse.ShortDescription"
            autocomplete="off"
            placeholder="Course Short Description"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
        <el-form-item prop="Description">
          <el-input
            v-model="newCourse.Description"
            autocomplete="off"
            placeholder="Course Description"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('newCourse')">Cancel</el-button>
        <el-button type="primary" @click="handleCreate('newCourse')">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import TableAdmin from '@/components/admin-academy/TableAdmin';
import { Dialog, Form, FormItem, Input, Button, Message, MessageBox } from 'element-ui';
export default {
  components: {
    TableAdmin,
    'el-button': Button,
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button
  },
  data() {
    return {
      newCourse: {
        CourseName: '',
        CourseCode: '',
        ShortDescription: '',
        Description: ''
      },
      editCourse: {
        CourseID: '',
        CourseName: '',
        CourseCode: '',
        ShortDescription: '',
        Description: ''
      },
      ruleCourse: {
        CourseName: [
          {
            required: true,
            message: 'Course name is required',
            trigger: 'blur'
          }
        ],
        CourseCode: [
          {
            required: true,
            message: 'Course code is required',
            trigger: 'blur'
          }
        ],
        ShortDescription: [
          {
            required: true,
            message: 'short Description is required',
            trigger: 'blur'
          }
        ],
        Description: [
          {
            required: true,
            message: 'Description is required',
            trigger: 'blur'
          }
        ]
      },
      dialogForm: {
        newCourse: false,
        editCourse: false
      },
      fullscreenLoading: false,
      loadingData: false
    };
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getAllCourses',
      'createCourse',
      'updateCourse',
      'changeCourseStatus'
    ]),
    changeStatus(row) {
      var warning;
      var responseMessage;
      var status;

      if (row.Status === 'Open') {
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
            courseId: row.CourseID,
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
          await this.getAllCourses();
          this.fullscreenLoading = false;
        })
        .catch(() => {
          Message.info('Canceled');
        });
    },
    detailCourse(row) {
      this.$router.push({ path: `Courses/${row.CourseID}/Course-detail` });
    },
    modalEdit(row) {
      this.editCourse.CourseID = row.CourseID;
      this.editCourse.CourseCode = row.CourseCode;
      this.editCourse.CourseName = row.CourseName;
      this.editCourse.ShortDescription = row.ShortDescription;
      this.editCourse.Description = row.Description;

      this.dialogForm.editCourse = true;
    },
    async handleCreate(formName) {
      let self = this;
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          let data = await this.createCourse(this.newCourse);
          if (data) {
            if (data.success) {
              await this.resetForm('newCourse');
              Message.success('create success!');
            } else {
              Message.error(data.msg);
            }
          }
          this.dialogForm.newCourse = false;
          await this.getAllCourses();

          this.fullscreenLoading = false;
        }
      });
    },
    async handleUpdate(formName) {
      let self = this;
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          let data = await this.updateCourse(this.editCourse);
          if (data) {
            if (data.success) {
              await this.resetForm('editCourse');
              Message.success('update success!');
            } else {
              Message.error(data.msg);
            }
          }
          this.dialogForm.editCourse = false;
          await this.getAllCourses();
          this.fullscreenLoading = false;
        }
      });
    },
    resetForm(formName) {
      this[formName].CourseID = '';
      this[formName].CourseName = '';
      this[formName].CourseCode = '';
      this[formName].ShortDescription = '';
      this[formName].Description = '';
      this.$refs[formName].resetFields();
      this.dialogForm[formName] = false;
    }
  },
  computed: {
    ...mapState('adminAcademy', ['listCourses'])
  },
  async created() {
    let response = await this.getAllCourses();
    if (response) {
      this.loadingData = false;
    }
  }
};
</script>
