<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <h1 class="bannerTitle_1wzmt7u">{{ teacherCurent ? teacherCurent.Fullname : '' }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/academy"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item to="/academy/teachers">Teachers</b-breadcrumb-item>
      <b-breadcrumb-item active>{{
        teacherCurent ? teacherCurent.Fullname : ''
      }}</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body row">
          <div class="col">
            <h1 class="h3 mb-2 text-gray-800">Personal information</h1>
            <p>
              Date of birth:
              {{
                teacherCurent && teacherCurent.Info && teacherCurent.Info.Birthday
                  ? teacherCurent.Info.Birthday
                  : ''
              }}
            </p>
            <p>
              Gender:
              {{
                teacherCurent && teacherCurent.Info && teacherCurent.Info.Sex
                  ? teacherCurent.Info.Sex == 0
                    ? 'Male'
                    : 'Female'
                  : ''
              }}
            </p>
            <p>
              Address:
              {{
                teacherCurent && teacherCurent.Info && teacherCurent.Info.Address
                  ? teacherCurent.Info.Address
                  : ''
              }}
            </p>
            <p>
              Date of birth:
              {{
                teacherCurent && teacherCurent.Info && teacherCurent.Info.Email
                  ? teacherCurent.Info.Email
                  : ''
              }}
            </p>
            <p>
              Country:
              {{
                teacherCurent && teacherCurent.Info && teacherCurent.Info.Country
                  ? teacherCurent.Info.Country
                  : ' '
              }}
            </p>
          </div>
          <div class="col">
            <img
              v-if="teacherCurent && teacherCurent.Info && teacherCurent.Info.Avatar"
              :src="teacherCurent.Info.Avatar"
              alt="Avatar"
              class="avatar"
            />
            <img v-else src="@/assets/img/avatar-default.png" class="avatar" />
          </div>
        </div>
      </div>
    </div>
    <table-admin
      :title="`List Classes Of Teacher`"
      :listAll="classesOfTeacher ? classesOfTeacher : []"
      :loadingData="loadingData"
      :btnRemove="true"
      :nameFunctionRemove="`removeClass`"
      :nameFunctionDetail="`detailClass`"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class' },
        { prop: 'SubjectName', label: 'Subject' },
        { prop: 'Time', label: 'Time' },
        { prop: 'Repeat', label: 'Repeat' },
        { prop: 'Capacity', label: 'Capacity' }
      ]"
      :date="true"
      :statusCol="true"
      @removeClass="removeClass($event)"
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
    ...mapState('adminAcademy', ['classesOfTeacher', 'subjectsNoTeacher', 'teacherCurent'])
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getClassesOfTeacher',
      'unassignTeacherFromClass',
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
    removeClass(row) {
      let self = this;
      MessageBox.confirm(`You won't be able to revert this!`, 'Unassign', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
        center: true
      })
        .then(async () => {
          this.fullscreenLoading = true;
          //sua chaincode sau
          let data = await this.unassignTeacherFromClass(row.ClassID);
          if (data.success) {
            await this.getClassesOfTeacher(this.$route.params.id);
            let data = await self.getClassesNoTeacher();
            if (data.success) {
              self.classesNoTeacher = data.classesNoTeacher;
            }
            Message.success('Unassign completed!');
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
          Message.info('Unassign canceled');
        });
    },
    addSubject(item, button) {
      this.$root.$emit('bv::show::modal', button);
    }
  },
  async created() {
    await this.getTeacher(this.$route.params.id);
    await this.getClassesOfTeacher(this.$route.params.id);
    let res = await this.getClassesNoTeacher();
    if (res) {
      this.classesNoTeacher = res.classesNoTeacher;
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
</style>
