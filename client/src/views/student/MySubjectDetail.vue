<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <h1 class="bannerTitle_1wzmt7u mt-4">{{ subject.SubjectName }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item @click="handleBack">Course Detail</b-breadcrumb-item>
      <b-breadcrumb-item active>Subject Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">{{ subject.SubjectName }}</h1>
          <p>{{ subject.Description }}</p>
        </div>
      </div>
    </div>

    <table-student
      :title="`Classes list`"
      :listAll="listClasses"
      :loadingData="loadingData"
      :statusCol="true"
      :btnRegister="true"
      :nameFunctionRegister="`enrollClass`"
      :nameFunctionDetail="`detailClass`"
      :btnCancel="true"
      :nameFunctionCancelRegistered="`cancelClass`"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'Repeat', label: 'Repeat' }
      ]"
      :date="true"
      :registeredId="subject && subject.classRegistered ? subject.classRegistered : ''"
      :attrId="`ClassID`"
      @enrollClass="enrollClass($event)"
      @detailClass="detailClass($event)"
      @cancelClass="cancelClass($event)"
    ></table-student>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableStudent from '@/components/student/TableStudent';
import { Button, MessageBox, Message } from 'element-ui';
export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableStudent,
    'el-button': Button
  },
  data() {
    return {
      fullscreenLoading: false,
      loadingData: false
    };
  },
  methods: {
    ...mapActions('student', [
      'getClassesOfSubject',
      'getSubject',
      'registerClass',
      'cancelRegisteredClass'
    ]),
    detailClass(row) {
      this.$router.push({
        path: `/student/subjects/${this.$route.params.subjectId}/class/${row.ClassID}`
      });
    },
    enrollClass(row) {
      MessageBox.confirm(`Are you sure to enroll this class ?`, 'Enroll', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'success',
        center: true
      })
        .then(async () => {
          this.fullscreenLoading = true;
          let data = await this.registerClass(row.ClassID);
          if (data) {
            if (data.success) {
              Message.success('Successfully enrolled this class!');
              await this.getSubject(this.$route.params.subjectId);
            } else {
              Message.error('Failed to enroll this class!');
            }
          }
          this.fullscreenLoading = false;
        })
        .catch(() => {});
    },
    cancelClass(row) {
      MessageBox.confirm(`Are you sure to cancel enrollment this class ?`, 'Cancel', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
        center: true
      })
        .then(async () => {
          this.fullscreenLoading = true;
          let data = await this.cancelRegisteredClass(row.ClassID);
          if (data) {
            if (data.success) {
              Message.success('Successfully canceled enrollment!');
              await this.getSubject(this.$route.params.subjectId);
            } else {
              Message.error('Failed to cancel this class!');
            }
          }
          this.fullscreenLoading = false;
        })
        .catch(() => {});
    },
    handleBack() {
      this.$router.push({ path: `/myCourses/${this.$route.params.id}` });
    }
  },
  computed: {
    ...mapState('student', ['listClasses', 'subjects', 'subject'])
  },
  async created() {
    await this.getSubject(this.$route.params.subjectId);
    await this.getClassesOfSubject(this.$route.params.subjectId);
    this.loadingData = false;
  }
};
</script>
