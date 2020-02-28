<template>
  <div class="container-fluid">
    <h1 class="bannerTitle_1wzmt7u">ClassRoom: {{ listClasses.Room }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/academy"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item to="/academy/subjects"> Subject</b-breadcrumb-item>
      <b-breadcrumb-item :to="`/academy/subjects/${this.$route.params.id}`"
        >Subject Detail</b-breadcrumb-item
      >
      <b-breadcrumb-item active>Class Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h2 class="h4 mb-2 text-gray-800">About this classs</h2>
          <p>Time: {{ listClasses.Time }}</p>
          <p>Capacity: {{ listClasses.Capacity }}</p>
          <p>
            Status:
            <b-badge :variant="listClasses.Status === 'Open' ? 'success' : 'danger'">{{
              listClasses.Status
            }}</b-badge>
          </p>
          <p>{{ listClasses.Description }}</p>
          <el-button
            v-if="listClasses.Status === 'Open'"
            type="danger"
            round
            size="mini"
            @click="close()"
            >Close</el-button
          >
        </div>
      </div>
    </div>
    <table-admin
      :title="`Student List`"
      :listAll="listStudents ? listStudents : []"
      :loadingData="loadingData"
      :btnInfo="true"
      :nameFunctionInfo="`showInfoStudent`"
      :btnDetail="true"
      :nameFunctionDetail="`detailStudent`"
      :nameFunctionDelete="`delStudent`"
      :btnDelete="true"
      :listProperties="[
        { prop: 'Fullname', label: 'FullName' },
        { prop: 'Info.Birthday', label: 'Birthday' },
        { prop: 'Info.Address', label: 'Address' }
      ]"
      @detailStudent="detailStudent($event)"
      @delStudent="delStudent($event)"
      @showInfoStudent="showInfoStudent($event)"
    >
    </table-admin>
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
        <el-button @click="resetForm()">Cancel</el-button>
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
  data() {
    return {
      loadingData: false,
      showInfo: false,
      infoStudent: {
        PhoneNumber: '',
        Email: '',
        Address: '',
        Sex: '',
        Birthday: '',
        Avatar: '',
        Country: ''
      }
    };
  },
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
  methods: {
    ...mapActions('adminAcademy', ['getClass', 'closeClass', 'getStudentsOfClass']),
    close() {
      this.$swal({
        title: 'Are you sure to close this class?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Yes, close it!',
        reverseButtons: true
      }).then(async (result) => {
        if (result.value) {
          this.fullscreenLoading = true;
          await this.closeClass({
            classId: this.$route.params.classId
          });

          await this.getClass(this.$route.params.classId);
          this.fullscreenLoading = false;
          this.status = false;

          this.$swal('Closed!', 'This class has been closed.', 'success');
        }
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
    resetForm() {
      this.showInfo = false;
    },
    detailStudent(row) {
      this.$router.push({
        path: `/academy/student/${row.Username}`
      });
    }
  },
  computed: {
    ...mapState('adminAcademy', ['listClasses', 'listStudents'])
  },
  async created() {
    let _class = await this.getClass(this.$route.params.classId);
    let student = await this.getStudentsOfClass(this.$route.params.classId);
    if (_class.success && student) {
      this.listClasses = _class.class;
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
