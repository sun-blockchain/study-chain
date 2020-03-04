<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <h1 class="bannerTitle_1wzmt7u mt-4">{{ subjects.SubjectName }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item :to="`/student/courses/${this.$route.params.id}`"
        >Course Detail</b-breadcrumb-item
      >
      <b-breadcrumb-item active>Subject Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">About this subject</h1>
          <p>{{ subjects.Description }}</p>
        </div>
      </div>
    </div>

    <table-student
      :title="`Classes list`"
      :listAll="listClasses"
      :loadingData="loadingData"
      :btnRegister="true"
      :nameFunctionRegister="`enrollClass`"
      :nameFunctionDetail="`detailClass`"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class Code' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'ShortDescription', label: 'Short Description' },
        { prop: 'Status', label: 'Status' },
        { prop: 'Capacity', label: 'Capacity' }
      ]"
      @enrollClass="enrollClass($event)"
      @detailClass="detailClass($event)"
    ></table-student>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableStudent from '@/components/student/TableStudent';
import { Button } from 'element-ui';
export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableStudent,
    'el-button': Button
  },
  data() {
    return {
      fullscreenLoading: true,
      loadingData: false
    };
  },
  methods: {
    ...mapActions('student', ['getClassesOfSubject', 'getSubject', 'registerClass']),
    detailClass(row) {
      this.$router.push({
        path: `/student/subjects/${this.$route.subjectId}/class/${row.ClassID}`
      });
    },
    async enrollClass(row) {
      this.$swal({
        text: 'Are you sure register this class ?',
        type: 'success',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Confirm',
        reverseButtons: true
      }).then(async (result) => {
        if (result.value) {
          this.fullscreenLoading = true;
          let response = await this.registerClass(row.ClassID);
          if (!response) {
            this.fullscreenLoading = false;
            this.$swal('Failed!', 'Failed to enroll this class.', 'error');
          } else if (response.status === 200) {
            this.fullscreenLoading = false;
            this.$swal('Enrolled!', 'Successfully enrolled this class.', 'success');
          }
        }
      });
    }
  },
  computed: {
    ...mapState('student', ['listClasses', 'subjects'])
  },
  async created() {
    let subjects = await this.getSubject(this.$route.params.subjectId);
    let classes = await this.getClassesOfSubject(this.$route.params.subjectId);

    if (classes && subjects) {
      this.fullscreenLoading = false;
      this.loadingData = false;
    }
  }
};
</script>
