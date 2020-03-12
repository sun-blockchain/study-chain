<template>
  <div>
    <table-teacher
      :title="`List Classes Of Teacher`"
      :listAll="listClasses ? listClasses : []"
      :nameFunctionDetail="`detailClass`"
      :loadingData="loadingData"
      :statusCol="true"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class Code' },
        { prop: 'SubjectName', label: 'Subject' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'Repeat', label: 'Repeat' },
        { prop: 'Capacity', label: 'Capacity' }
      ]"
      @detailClass="detailClass($event)"
    >
    </table-teacher>

    <el-dialog
      title="Information Subject"
      :visible.sync="dialogForm.infoClass"
      class="modal-with-create"
    >
      <el-form :model="infoClass" ref="infoClass">
        <div class="form-group">
          <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
            >Start Date</label
          >
          <div class="col-sm-12">
            <h4 class="pl-3">{{ infoClass.StartDate }}</h4>
          </div>
        </div>

        <div class="form-group">
          <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
            >End Date</label
          >
          <div class="col-sm-12">
            <h4 class="pl-3">{{ infoClass.EndDate }}</h4>
          </div>
        </div>
        <div class="form-group">
          <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
            >Repeat</label
          >
          <div class="col-sm-12">
            <h4 class="pl-3">{{ infoClass.Repeat }}</h4>
          </div>
        </div>

        <div class="form-group">
          <label for="colFormLabelLg" class="col-sm-12 col-form-label col-form-label-md"
            >Description</label
          >
          <div class="col-sm-12">
            <h4 class="pl-3">{{ infoClass.Description }}</h4>
          </div>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm()">Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import TableTeacher from '@/components/teacher/TableTeacher.vue';
import { Button, Select, Option, Dialog, Form, FormItem, Message, MessageBox } from 'element-ui';
export default {
  components: {
    TableTeacher,
    'el-button': Button,
    'el-select': Select,
    'el-option': Option,
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem
  },
  data() {
    return {
      dialogForm: {
        infoClass: false
      },
      infoClass: {
        ClassID: '',
        SubjectID: '',
        ClassCode: '',
        Room: '',
        Time: '',
        Status: '',
        StartDate: '',
        EndDate: '',
        Repeat: '',
        Students: [],
        Capacity: 0,
        TeacherUsername: ''
      },
      loadingData: false
    };
  },
  computed: {
    ...mapState('teacher', ['listClasses'])
  },
  methods: {
    ...mapActions('teacher', ['getClassesOfTeacher']),
    detailClass(row) {
      this.$router.push({
        name: 'teacher-detail-class',
        params: { subjectId: row.SubjectID, classId: row.ClassID }
      });
    },
    resetForm() {
      this.infoClass.ClassID = '';
      this.infoClass.SubjectID = '';
      this.infoClass.ClassCode = '';
      this.infoClass.Room = '';
      this.infoClass.Time = '';
      this.infoClass.Status = '';
      this.infoClass.StartDate = '';
      this.infoClass.EndDate = '';
      this.infoClass.Repeat = '';
      this.infoClass.Students = [];
      this.infoClass.Capacity = 0;
      this.infoClass.TeacherUsername = '';
      this.dialogForm.infoClass = false;
    }
  },
  async created() {
    await this.getClassesOfTeacher();
  }
};
</script>
