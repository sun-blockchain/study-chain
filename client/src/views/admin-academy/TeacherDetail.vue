<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <h1 class="bannerTitle_1wzmt7u">{{ listTeachers.Fullname }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/academy"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item to="/academy/teachers">Teacher</b-breadcrumb-item>
      <b-breadcrumb-item active>Teacher Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body row">
          <div class="col">
            <h1 class="h3 mb-2 text-gray-800">Personal information</h1>
            <p>
              Date of birth:
              {{
                listTeachers.Info
                  ? listTeachers.Info.Birthday
                    ? listTeachers.Info.Birthday
                    : ''
                  : ''
              }}
            </p>
            <p>
              Gender:
              {{
                listTeachers.Info
                  ? listTeachers.Info.Sex
                    ? listTeachers.Info.Sex == 0
                      ? 'Male'
                      : 'Female'
                    : ''
                  : ''
              }}
            </p>
            <p>
              Address:
              {{
                listTeachers.Info
                  ? listTeachers.Info.Address
                    ? listTeachers.Info.Address
                    : ''
                  : ''
              }}
            </p>
            <p>
              Date of birth:
              {{
                listTeachers.Info ? (listTeachers.Info.Email ? listTeachers.Info.Email : '') : ''
              }}
            </p>
            <p>
              Country:
              {{
                listTeachers.Info
                  ? listTeachers.Info.Country
                    ? listTeachers.Info.Country
                    : ''
                  : ''
              }}
            </p>
          </div>
          <div class="col">
            <img
              v-if="listTeachers.Info && listTeachers.Info.Avatar"
              :src="listTeachers.Info.Avatar"
              :alt="Avatar"
              class="avatar"
            />
            <img v-else src="@/assets/img/avatar-default.png" class="avatar" />
          </div>
        </div>
      </div>
    </div>
    <table-admin
      :title="`List Classes Of Teacher`"
      :listAll="classessOfTeacher"
      :loadingData="loadingData"
      :btnDelete="true"
      :nameFunctionDelete="`delSubject`"
      :nameFunctionDetail="`detailClass`"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class Code' },
        { prop: 'Time', label: 'Time' },
        { prop: 'StartDate', label: 'Start Date' },
        { prop: 'EndDate', label: 'End Date' },
        { prop: 'Capacity', label: 'Capacity' }
      ]"
      @delSubject="delSubject($event)"
      @detailClass="detailClass($event)"
    >
      <template v-slot:btn-create>
        <el-button
          type="success"
          icon="fas fa-plus"
          size="medium"
          round
          @click="dialogForm.addClass = true"
        ></el-button>
        <!-- <div class="box-defaul-header"></div> -->
      </template>
    </table-admin>

    <el-dialog
      title="Add Class To Teacher"
      :visible.sync="dialogForm.addClass"
      class="modal-md-25-sm-90"
    >
      <el-form :model="formAdd" :rules="ruleAdd" ref="formAdd" class="demo-ruleForm">
        <el-form-item prop="classId">
          <el-select v-model="formAdd.classId" placeholder="Class" class="width-100">
            <el-option
              :label="Class.ClassCode"
              :value="Class.ClassID"
              v-for="(Class, index) in classesNoTeacher"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('formAdd')">Cancel</el-button>
        <el-button type="primary" @click="handleAddClass('formAdd')">Add</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import TableAdmin from '@/components/admin-academy/TableAdmin';
import { Button, Select, Option, Dialog, Form, FormItem, Message, MessageBox } from 'element-ui';
export default {
  components: {
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
      newSubjectId: null,
      dialogForm: {
        addClass: false
      },
      formAdd: {
        classId: ''
      },
      ruleAdd: {
        classId: [{ required: true, message: 'Class is required', trigger: 'blur' }]
      },
      classesNoTeacher: [],
      loadingData: true,
      fullscreenLoading: false
    };
  },
  computed: {
    ...mapState('adminAcademy', ['classessOfTeacher', 'subjectsNoTeacher', 'listTeachers'])
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getClassesOfTeacher',
      'deleteSubjectOfTeacher',
      'addClassToTeacher',
      'getClassesNoTeacher',
      'getTeacher'
    ]),
    detailClass(row) {
      this.$router.push({
        path: `/academy/subjects/${row.SubjectID}/class/${row.ClassID}`
      });
    },
    handleAddClass(formName) {
      let self = this;
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          self.fullscreenLoading = true;
          let data = await self.addClassToTeacher({
            username: self.$route.params.id,
            classId: self.formAdd.classId
          });
          if (data.success) {
            await self.getClassesOfTeacher(self.$route.params.id);
            let data = await self.getClassesNoTeacher();
            if (data.success) {
              self.classesNoTeacher = data.classesNoTeacher;
            }
            self.resetForm('formAdd');
            Message.success('Add class to teacher success!');
          } else {
            if (data.errors) {
              data.errors.forEach(async (message) => {
                setTimeout(() => {
                  Message.error(`${message.param}: ${message.msg}`);
                }, 1);
              });
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
    async resetForm(formName) {
      this.$refs[formName].resetFields();
      this.dialogForm.addClass = false;
    },
    delSubject(subject) {
      this.$swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Yes, delete it!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          const Username = this.$route.params.id;
          this.deleteSubjectOfTeacher({
            Username: Username,
            subjectId: subject.SubjectID
          });
          this.$swal('Deleted!', 'Your file has been deleted.', 'success');
        }
      });
    },
    addSubject(item, button) {
      this.$root.$emit('bv::show::modal', button);
    }
  },
  async created() {
    let teacher = await this.getTeacher(this.$route.params.id);
    let classOfTeacher = await this.getClassesOfTeacher(this.$route.params.id);
    let data = await this.getClassesNoTeacher();

    if (classOfTeacher && data && teacher) {
      this.classesNoTeacher = data.classesNoTeacher;
      this.loadingData = false;
    }
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
</style>
