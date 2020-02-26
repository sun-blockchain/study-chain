<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <table-admin
      :title="`List Of Teachers Subjects`"
      :listAll="classessOfTeacher"
      :loadingData="loadingData"
      :btnDelete="true"
      :nameFunctionDelete="`delSubject`"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class Code' },
        { prop: 'Time', label: 'Time' },
        { prop: 'StartDate', label: 'Start Date' },
        { prop: 'EndDate', label: 'End Date' },
        { prop: 'Capacity', label: 'Capacity' },
        { prop: 'ShortDescription', label: 'Short Description' }
      ]"
      @delSubject="delSubject($event)"
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
    ...mapState('adminAcademy', ['classessOfTeacher', 'subjectsNoTeacher'])
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getClassesOfTeacher',
      'deleteSubjectOfTeacher',
      'addClassToTeacher',
      'getClassesNoTeacher'
    ]),
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
    await this.getClassesOfTeacher(this.$route.params.id);
    let data = await this.getClassesNoTeacher();
    if (data.success) {
      this.classesNoTeacher = data.classesNoTeacher;
    }
    this.loadingData = false;
  }
};
</script>
