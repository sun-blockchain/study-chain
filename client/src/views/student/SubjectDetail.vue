<template>
  <div class="container-fluid">
    <h1 class="bannerTitle_1wzmt7u mt-4">{{ subject ? subject.SubjectName : '' }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/student"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item :to="`/student/courses/${this.$route.params.id}`"
        >Course Detail</b-breadcrumb-item
      >
      <b-breadcrumb-item active>Subject Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">About this subject</h1>
          <p>{{ subject ? subject.Description : '' }}</p>
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
      :btnInfo="true"
      :nameFunctionInfo="`modalInfo`"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class Code' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'Capacity', label: 'Capacity' }
      ]"
      :date="true"
      :statusCol="true"
      @modalInfo="modalInfo($event)"
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
    ...mapActions('student', ['getClassesOfSubject', 'getSubject']),
    modalInfo(row) {
      this.infoClass.description = row.Description;
      this.infoClass.startDate = row.StartDate;
      this.infoClass.endDate = row.EndDate;
      this.infoClass.repeat = row.Repeat;
      this.$root.$emit('bv::show::modal', 'modal-info');
    }
  },
  computed: {
    ...mapState('student', ['listClasses', 'subject'])
  },
  async created() {
    await this.getSubject(this.$route.params.subjectId);
    await this.getClassesOfSubject(this.$route.params.subjectId);
    this.loadingData = false;
  }
};
</script>
