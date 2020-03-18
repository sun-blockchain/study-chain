<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <table-admin
      :title="`Teachers Manager`"
      :listAll="listTeachers ? listTeachers : []"
      :loadingData="loadingData"
      :nameFunctionDetail="`detailTeacher`"
      :listProperties="[
        { prop: 'Fullname', label: 'Fullname' },
        { prop: 'Username', label: 'Username' }
      ]"
      @delTeacher="delTeacher($event)"
      @detailTeacher="detailTeacher($event)"
    >
      <template v-slot:btn-create>
        <el-button
          type="success"
          icon="fas fa-plus"
          size="medium"
          round
          @click="dialogForm.newTeacher = true"
        ></el-button>
        <!-- <div class="box-defaul-header"></div> -->
      </template>
    </table-admin>

    <el-dialog
      title="Information Teacher"
      :visible.sync="dialogForm.inforTeacher"
      class="modal-with-create"
    >
      <el-form ref="inforTeacher">
        <div class="form-group">
          <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
            >Username</label
          >
          <div class="col-sm-12">
            <h4 class="pl-3">{{ inforTeacher.username }}</h4>
          </div>
        </div>
        <div class="form-group">
          <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
            >Full Name</label
          >
          <div class="col-sm-12">
            <h4 class="pl-3">{{ inforTeacher.fullName }}</h4>
          </div>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('inforTeacher')">Cancel</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Create Teacher"
      :visible.sync="dialogForm.newTeacher"
      class="modal-with-create"
    >
      <el-form :model="newTeacher" :rules="ruleTeacher" ref="newTeacher">
        <el-form-item prop="username">
          <el-input
            v-model="newTeacher.username"
            autocomplete="off"
            placeholder="Username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="fullName">
          <el-input
            v-model="newTeacher.fullName"
            autocomplete="off"
            placeholder="Full Name"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('newTeacher')">Cancel</el-button>
        <el-button type="primary" @click="handleCreate('newTeacher')">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableAdmin from '@/components/admin-academy/TableAdmin';
import { Dialog, Form, FormItem, Input, Button, Message, MessageBox } from 'element-ui';
export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableAdmin,
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button
  },
  data() {
    return {
      inforTeacher: {
        fullName: '',
        username: ''
      },
      newTeacher: {
        fullName: '',
        username: ''
      },
      infoModal: {
        id: 'info-modal',
        total: ''
      },
      dialogForm: {
        newTeacher: false,
        inforTeacher: false
      },
      ruleTeacher: {
        username: [
          {
            required: true,
            message: 'username is required',
            trigger: 'blur'
          }
        ],
        fullName: [
          {
            required: true,
            message: 'fullname is required',
            trigger: 'blur'
          },
          {
            min: 6,
            message: 'fullname must be at least 6 characters',
            trigger: 'blur'
          }
        ]
      },
      fullscreenLoading: false,
      loadingData: true
    };
  },
  computed: {
    ...mapState('adminAcademy', ['listTeachers']),
    ...mapState({
      alert: (state) => state.alert
    })
  },
  methods: {
    ...mapActions('adminAcademy', ['getAllTeachers', 'deleteTeacher', 'createTeacher']),
    detailTeacher(row) {
      this.$router.push({ path: `teachers/${row.Username}` });
    },
    handleCreate(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          let data = await this.createTeacher(this.newTeacher);
          if (!data) {
            this.dialogForm.newTeacher = false;
            await this.resetForm('newTeacher');
            Message.error(data.msg);
          } else if (data) {
            await this.resetForm('newTeacher');
            Message.success('Create success!');
          }
          await this.getAllTeachers();
          this.fullscreenLoading = false;
        }
      });
    },
    resetForm(formName) {
      this[formName].username = '';
      this[formName].fullName = '';
      this.$refs[formName].resetFields();
      this.dialogForm[formName] = false;
    }
  },
  async created() {
    await this.getAllTeachers();
    this.loadingData = false;
  }
};
</script>
