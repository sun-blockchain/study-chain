<template>
  <div class="container-fluid">
    <h1 class="bannerTitle_1wzmt7u mt-4">{{ subject.SubjectName }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item href="/student"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item :href="`/student/courses/${this.$route.params.id}`"
        >Course Detail</b-breadcrumb-item
      >
      <b-breadcrumb-item active>Subject Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">About this subject</h1>
          <p>{{ subject.Description }}</p>
        </div>
      </div>
    </div>
    <b-modal
      id="modal-info"
      ref="modal-info"
      title="More Information About Class"
      v-loading.fullscreen.lock="fullscreenLoading"
      ok-only
    >
      <p>
        <b>Start Date:</b>
        {{ infoClass.startDate }}
      </p>
      <p>
        <b>End Date:</b>
        {{ infoClass.endDate }}
      </p>
      <p>
        <b>Repeat:</b>
        {{ infoClass.repeat }}
      </p>
      <p>
        <b>Description:</b>
        {{ infoClass.description }}
      </p>
    </b-modal>
    <table-student
      :title="`Classes list`"
      :listAll="listClasses"
      :loadingData="loadingData"
      :btnRegister="true"
      :nameFunctionRegister="`enrollClass`"
      :btnInfo="true"
      :nameFunctionInfo="`modalInfo`"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class Code' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'ShortDescription', label: 'Short Description' },
        { prop: 'Status', label: 'Status' },
        { prop: 'Capacity', label: 'Capacity' }
      ]"
      @modalInfo="modalInfo($event)"
      @enrollClass="enrollClass($event)"
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
      fullscreenLoading: false,
      loadingData: false,
      infoClass: {
        startDate: '',
        endDate: '',
        repeat: '',
        description: ''
      }
    };
  },
  methods: {
    ...mapActions('student', ['getClassesOfSubject', 'getSubject', 'registerClass']),
    modalInfo(row) {
      this.infoClass.description = row.Description;
      this.infoClass.startDate = row.StartDate;
      this.infoClass.endDate = row.EndDate;
      this.infoClass.repeat = row.Repeat;
      this.$root.$emit('bv::show::modal', 'modal-info');
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
    ...mapState('student', ['listClasses', 'subject'])
  },
  async created() {
    let subject = await this.getSubject(this.$route.params.subjectId);
    let classes = await this.getClassesOfSubject(this.$route.params.subjectId);

    if (classes && subject) {
      this.loadingData = false;
    }
  }
};
</script>
