<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <table-admin
      :title="`Subjects Manager`"
      :listAll="listSubjects"
      :loadingData="loadingData"
      :btnInfo="true"
      :nameFunctionInfo="`showInfoSubject`"
      :btnDetail="true"
      :nameFunctionDetail="`detailSubject`"
      :btnEdit="true"
      :nameFunctionEdit="`modalEdit`"
      :btnDelete="true"
      :nameFunctionDelete="`delSubject`"
      :listProperties="[
        { prop: 'SubjectName', label: 'Name Subject' },
        { prop: 'SubjectCode', label: 'Code Subject' },
        { prop: 'ShortDescription', label: 'Short Description' }
      ]"
      @delSubject="delSubject($event)"
      @modalEdit="modalEdit($event)"
      @detailSubject="detailSubject($event)"
      @showInfoSubject="showInfoSubject($event)"
    >
      <template v-slot:btn-create>
        <el-button
          type="success"
          icon="fas fa-plus"
          size="medium"
          round
          @click="dialogForm.newSubject = true"
        ></el-button>
        <!-- <div class="box-defaul-header"></div> -->
      </template>
    </table-admin>

    <el-dialog
      title="Edit Subject"
      :visible.sync="dialogForm.editSubject"
      class="modal-with-create"
      v-loading.fullscreen.lock="fullscreenLoading"
    >
      <el-form :model="editSubject" :rules="ruleSubject" ref="editSubject">
        <el-form-item prop="subjectName">
          <el-input
            v-model="editSubject.subjectName"
            autocomplete="off"
            placeholder="Subject Name"
          ></el-input>
        </el-form-item>
        <el-form-item prop="subjectCode">
          <el-input
            v-model="editSubject.subjectCode"
            autocomplete="off"
            placeholder="Subject Code"
          ></el-input>
        </el-form-item>
        <el-form-item prop="shortDescription">
          <el-input
            v-model="editSubject.shortDescription"
            autocomplete="off"
            placeholder="Subject Short Description"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
        <el-form-item prop="description">
          <el-input
            v-model="editSubject.description"
            autocomplete="off"
            placeholder="Subject Description"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('editSubject')">Cancel</el-button>
        <el-button type="primary" @click="handleUpdate('editSubject')">Confirm</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Create Subject"
      :visible.sync="dialogForm.newSubject"
      class="modal-with-create"
      v-loading.fullscreen.lock="fullscreenLoading"
    >
      <el-form :model="newSubject" :rules="ruleSubject" ref="newSubject">
        <el-form-item prop="subjectName">
          <el-input
            v-model="newSubject.subjectName"
            autocomplete="off"
            placeholder="Subject Name"
          ></el-input>
        </el-form-item>
        <el-form-item prop="subjectCode">
          <el-input
            v-model="newSubject.subjectCode"
            autocomplete="off"
            placeholder="Subject Code"
          ></el-input>
        </el-form-item>
        <el-form-item prop="shortDescription">
          <el-input
            v-model="newSubject.shortDescription"
            autocomplete="off"
            placeholder="Subject Short Description"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
        <el-form-item prop="description">
          <el-input
            v-model="newSubject.description"
            autocomplete="off"
            placeholder="Subject Description"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('newSubject')">Cancel</el-button>
        <el-button type="primary" @click="handleCreate('newSubject')">Confirm</el-button>
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
            <h4  class="pl-3">{{ infoSubject.subjectCode }}</h4>
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
      editSubject: {
        Name: ''
      },
      newSubject: {
        subjectName: '',
        subjectCode: '',
        shortDescription: '',
        description: ''
      },
      editSubject: {
        subjectId: '',
        subjectName: '',
        subjectCode: '',
        shortDescription: '',
        description: ''
      },
      infoSubject: {
        subjectName: '',
        subjectCode: '',
        shortDescription: '',
        description: ''
      },
      ruleSubject: {
        subjectName: [
          {
            required: true,
            message: 'subject name is required',
            trigger: 'blur'
          }
        ],
        subjectCode: [
          {
            required: true,
            message: 'subject code is required',
            trigger: 'blur'
          }
        ],
        shortDescription: [
          {
            required: true,
            message: 'short description is required',
            trigger: 'blur'
          }
        ],
        description: [
          {
            required: true,
            message: 'description is required',
            trigger: 'blur'
          }
        ]
      },
      fullscreenLoading: false,
      loadingData: true,
      dialogForm: {
        newSubject: false,
        editSubject: false,
        infoSubject: false
      }
    };
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getAllSubjects',
      'createSubject',
      'updateSubject',
      'deleteSubject'
    ]),
    detailSubject(row) {
      this.$router.push({ path: `subjects/${row.SubjectID}/classes` });
    },
    modalEdit(row) {
      this.editSubject.subjectId = row.SubjectID;
      this.editSubject.subjectName = row.SubjectName;
      this.editSubject.subjectCode = row.SubjectCode;
      this.editSubject.shortDescription = row.ShortDescription;
      this.editSubject.description = row.Description;
      this.dialogForm.editSubject = true;
    },
    async handleCreate(formName) {
      let self = this;
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          let data = await this.createSubject(this.newSubject);
          if (data.success) {
            this.dialogForm.newSubject = false;
            await this.resetForm('newSubject');
            Message.success('create success!');
          } else {
            Message.error(data.msg);
          }
          this.fullscreenLoading = false;
        }
      });
    },
    async handleUpdate(formName) {
      let self = this;
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          let data = await this.updateSubject(this.editSubject);
          console.log(data);
          if (data.success) {
            this.dialogForm.editSubject = false;
            await this.resetForm('editSubject');
            Message.success('update success!');
          } else {
            Message.error(data.msg);
          }
          this.fullscreenLoading = false;
        }
      });
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
    delSubject(subject) {
      MessageBox.confirm(`You won't be able to revert this!`, 'Delete', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
        center: true
      })
        .then(async () => {
          this.fullscreenLoading = true;
          let data = await this.deleteSubject(subject.SubjectID);
          if (data.success) {
            await this.getAllSubjects();
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
    showInfoSubject(row) {
      this.infoSubject.subjectName = row.SubjectName;
      this.infoSubject.subjectCode = row.SubjectCode;
      this.infoSubject.shortDescription = row.ShortDescription;
      this.infoSubject.description = row.Description;
      this.dialogForm.infoSubject = true;
    }
  },
  computed: {
    ...mapState('adminAcademy', ['listSubjects'])
  },
  async created() {
    await this.getAllSubjects();
    this.loadingData = false;
  }
};
</script>
