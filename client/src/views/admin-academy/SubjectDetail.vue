<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <h1 class="bannerTitle_1wzmt7u">{{ listSubjects.SubjectName }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/academy"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item to="/academy/subjects">Subject</b-breadcrumb-item>
      <b-breadcrumb-item active>Subject Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">About this subject</h1>

          <p>{{ listSubjects.Description }}</p>
        </div>
      </div>
    </div>

    <table-admin
      :title="`Classes list`"
      :listAll="listClasses"
      :loadingData="loadingData"
      :nameFunctionDetail="`detailClass`"
      :btnEdit="true"
      :nameFunctionEdit="`modalEdit`"
      :nameFunctionDelete="`delClass`"
      :btnDelete="true"
      :statusCol="true"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class Code' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'Capacity', label: 'Capacity' }
      ]"
      @detailClass="detailClass($event)"
      @modalEdit="modalEdit($event)"
      @delClass="delClass($event)"
      @modalInfo="modalInfo($event)"
    >
      <template v-slot:btn-create>
        <el-button
          type="success"
          icon="fas fa-plus"
          size="medium"
          round
          @click="dialogForm.newClass = true"
        ></el-button>
        <!-- <div class="box-defaul-header"></div> -->
      </template>
    </table-admin>

    <el-dialog title="Update Class" :visible.sync="dialogForm.editClass" class="modal-with-create">
      <el-form :model="editClass" :rules="ruleClass" ref="editClass">
        <el-form-item prop="ClassCode">
          <el-input
            v-model="editClass.ClassCode"
            autocomplete="off"
            placeholder="Class Code"
          ></el-input>
        </el-form-item>
        <el-form-item prop="Room">
          <el-input v-model="editClass.Room" autocomplete="off" placeholder="Class room"></el-input>
        </el-form-item>
        <el-form-item prop="Time">
          <el-time-picker
            v-model="editClass.Time"
            placeholder="Time"
            format="HH:mm"
            value-format="HH:mm"
          >
          </el-time-picker>
        </el-form-item>
        <el-form-item prop="StartDate">
          <el-date-picker
            v-model="editClass.StartDate"
            :picker-options="pickerOptions"
            type="date"
            placeholder="Start Date"
            format="dd/MM/yyyy"
            value-format="timestamp"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="EndDate">
          <el-date-picker
            v-model="editClass.EndDate"
            :picker-options="pickerOptions"
            type="date"
            placeholder="End Date"
            format="dd/MM/yyyy"
            value-format="timestamp"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="Repeat">
          <el-select v-model="editClass.Repeat" placeholder="Repeat">
            <el-option v-for="item in repeatOptions" :key="item.value" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="Capacity">
          <el-select v-model="editClass.Capacity" placeholder="Capacity">
            <el-option v-for="item in capacityOptions" :key="item.value" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('editClass')">Cancel</el-button>
        <el-button type="primary" @click="handleUpdate('editClass')">Confirm</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Create Class" :visible.sync="dialogForm.newClass" class="modal-with-create">
      <el-form :model="newClass" :rules="ruleClass" ref="newClass">
        <el-form-item prop="ClassCode">
          <el-input
            v-model="newClass.ClassCode"
            autocomplete="off"
            placeholder="Class Code"
          ></el-input>
        </el-form-item>
        <el-form-item prop="Room">
          <el-input v-model="newClass.Room" autocomplete="off" placeholder="Class room"></el-input>
        </el-form-item>
        <el-form-item prop="Time">
          <el-time-picker
            v-model="newClass.Time"
            placeholder="Time"
            format="HH:mm"
            value-format="HH:mm"
          >
          </el-time-picker>
        </el-form-item>
        <el-form-item prop="StartDate">
          <el-date-picker
            v-model="newClass.StartDate"
            :picker-options="pickerOptions"
            type="date"
            placeholder="Start Date"
            format="dd/MM/yyyy"
            value-format="timestamp"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="EndDate">
          <el-date-picker
            v-model="newClass.EndDate"
            :picker-options="pickerOptions"
            type="date"
            placeholder="End Date"
            format="dd/MM/yyyy"
            value-format="timestamp"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="Repeat">
          <el-select v-model="newClass.Repeat" placeholder="Repeat">
            <el-option v-for="item in repeatOptions" :key="item.value" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="Capacity">
          <el-select v-model="newClass.Capacity" placeholder="Capacity">
            <el-option v-for="item in capacityOptions" :key="item.value" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('newClass')">Cancel</el-button>
        <el-button type="primary" @click="handleCreate('newClass')">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableAdmin from '@/components/admin-academy/TableAdmin';
import {
  Dialog,
  Form,
  FormItem,
  Input,
  Button,
  Message,
  MessageBox,
  Select,
  Option,
  DatePicker,
  TimePicker,
  RadioButton,
  RadioGroup
} from 'element-ui';

export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableAdmin,
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
    'el-select': Select,
    'el-option': Option,
    'el-date-picker': DatePicker,
    'el-time-picker': TimePicker,
    'el-radio-button': RadioButton,
    'el-radio-group': RadioGroup
  },
  data() {
    return {
      repeatOptions: [
        { value: 'Weekly' },
        { value: 'Monthly' },
        { value: 'Two times a week' },
        { value: 'Two times a month' }
      ],
      daysInWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      capacityOptions: [{ value: 10 }, { value: 20 }, { value: 50 }, { value: 100 }],
      editClass: {
        ClassID: '',
        ClassCode: '',
        Room: '',
        Time: '',
        StartDate: '',
        EndDate: '',
        Repeat: '',
        SubjectId: this.$route.params.id,
        Capacity: ''
      },
      newClass: {
        ClassCode: '',
        Room: '',
        Time: '',
        StartDate: '',
        EndDate: '',
        Repeat: '',
        SubjectId: this.$route.params.id,
        Capacity: ''
      },
      infoClass: {
        startDate: '',
        endDate: '',
        repeat: ''
      },
      fullscreenLoading: false,
      loadingData: false,
      dialogForm: {
        newClass: false,
        editClass: false
      },
      ruleClass: {
        ClassCode: [
          {
            required: true,
            message: 'Class code is required',
            trigger: 'blur'
          }
        ],
        Room: [
          {
            required: true,
            message: 'Class room is required',
            trigger: 'blur'
          }
        ],
        Time: [
          {
            required: true,
            message: 'Time is required',
            trigger: 'blur'
          }
        ],
        StartDate: [
          {
            required: true,
            message: 'Start Date is required',
            trigger: 'blur'
          }
        ],
        EndDate: [
          {
            required: true,
            message: 'End Date is required',
            trigger: 'blur'
          }
        ],
        Repeat: [
          {
            required: true,
            message: 'Class repeat is required',
            trigger: 'blur'
          }
        ],
        Capacity: [
          {
            required: true,
            message: 'Class capacity is required',
            trigger: 'blur'
          }
        ]
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now();
        }
      }
    };
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getSubject',
      'getClassesOfSubject',
      'createClass',
      'updateClass',
      'deleteClass'
    ]),
    detailClass(row) {
      this.$router.push({
        path: `/academy/subjects/${this.$route.params.id}/class/${row.ClassID}`
      });
    },
    modalEdit(row) {
      this.editClass.ClassID = row.ClassID;
      this.editClass.ClassCode = row.ClassCode;
      this.editClass.Room = row.Room;
      this.editClass.Time = row.Time;
      this.editClass.StartDate = row.StartDate;
      this.editClass.EndDate = row.EndDate;
      this.editClass.Repeat = row.Repeat;
      this.editClass.Capacity = row.Capacity;
      this.dialogForm.editClass = true;
    },

    async handleCreate(formName) {
      let self = this;
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          let data = await this.createClass(this.newClass);
          if (data) {
            if (data.success) {
              this.resetForm('newClass');
              Message.success('Class has been created!');
              this.dialogForm.newClass = false;
            } else {
              Message.error(data.msg);
            }
          }
          this.fullscreenLoading = false;

          await this.getClassesOfSubject(this.$route.params.id);
        }
      });
    },
    async handleUpdate(formName) {
      let self = this;
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          let data = await this.updateClass(this.editClass);
          if (data) {
            if (data.success) {
              this.dialogForm.editClass = false;
              await this.resetForm('editClass');
              Message.success('Update success!');
            } else {
              Message.error(data.msg);
            }
          }
          this.fullscreenLoading = false;
        }
      });
      await this.getClassesOfSubject(this.$route.params.id);
    },
    resetForm(formName) {
      this[formName].ClassCode = '';
      this[formName].Room = '';
      this[formName].Time = '';
      this[formName].StartDate = '';
      this[formName].EndDate = '';
      this[formName].Repeat = '';
      this[formName].Capacity = '';
      this.$refs[formName].resetFields();
      this.dialogForm[formName] = false;
    },
    async delClass(row) {
      MessageBox.confirm(`You won't be able to revert this!`, 'Delete', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
        center: true
      })
        .then(async () => {
          this.fullscreenLoading = true;
          let data = await this.deleteClass({
            subjectId: this.listSubjects.SubjectID,
            classId: row.ClassID
          });
          if (data) {
            if (data.success) {
              await this.getClassesOfSubject(this.$route.params.id);
              Message.success('Delete completed!');
            } else {
              Message.error(data.msg);
            }
          }
          this.fullscreenLoading = false;
        })
        .catch(() => {
          Message.info('Delete canceled');
        });
    },
    btnCreate(item, button) {
      this.$root.$emit('bv::show::modal', button);
    }
  },
  computed: {
    ...mapState('adminAcademy', ['listClasses', 'listSubjects'])
  },
  async created() {
    let classes = await this.getClassesOfSubject(this.$route.params.id);
    let subject = await this.getSubject(this.$route.params.id);
    if (classes && subject) {
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
.el-select,
.el-date-editor.el-input {
  width: 100%;
}
</style>
