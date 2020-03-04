<template>
  <div class="container-fluid">
    <h1 class="bannerTitle_1wzmt7u">ClassRoom: {{ listClasses.Room }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item to="/myCourses"> Courses</b-breadcrumb-item>

      <b-breadcrumb-item active>Class Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h2 class="h4 mb-2 text-gray-800">About this classs</h2>
          <div class="row">
            <div class="col">
              <p>Time: {{ listClasses.Time }}</p>
              <p>Start Date: {{ listClasses.StartDate }}</p>
              <p>End Date: {{ listClasses.EndDate }}</p>
            </div>
            <div class="col">
              <p>Capacity: {{ listClasses.Capacity }}</p>
              <p>
                Status:
                <b-badge :variant="listClasses.Status === 'Open' ? 'success' : 'danger'">{{
                  listClasses.Status
                }}</b-badge>
              </p>
              <p>
                Teacher:
                {{ listClasses.TeacherUsername }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
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
    'el-button': Button,
    'el-select': Select,
    'el-option': Option,
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem
  },
  methods: {
    ...mapActions('adminAcademy', ['getClass'])
  },
  computed: {
    ...mapState('adminAcademy', ['listClasses'])
  },
  async created() {
    let _class = await this.getClass(this.$route.params.classId);
    if (_class.success) {
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
</style>
