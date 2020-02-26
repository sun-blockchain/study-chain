<template>
  <div class="container-fluid">
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">My Classes</h1>
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
      :listAll="listMyClasses"
      :loadingData="loadingData"
      :btnInfo="true"
      :btnCancel="true"
      :nameFunctionInfo="`modalInfo`"
      :nameFunctionCancelRegistered="`cancelClass`"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class Code' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'ShortDescription', label: 'Short Description' },
        { prop: 'Status', label: 'Status' },
        { prop: 'Capacity', label: 'Capacity' }
      ]"
      @modalInfo="modalInfo($event)"
      @cancelClass="cancelClass($event)"
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
    ...mapActions('student', ['getMyClasses', 'cancelRegisteredClass']),
    modalInfo(row) {
      this.infoClass.description = row.Description;
      this.infoClass.startDate = row.StartDate;
      this.infoClass.endDate = row.EndDate;
      this.infoClass.repeat = row.Repeat;
      this.$root.$emit('bv::show::modal', 'modal-info');
    },
    async cancelClass(row) {
      this.$swal({
        text: 'Are you sure to cancel this class ?',
        type: 'success',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Confirm',
        reverseButtons: true
      }).then(async (result) => {
        if (result.value) {
          this.fullscreenLoading = true;
          let response = await this.cancelRegisteredClass(row.ClassID);
          if (response.status === 200) {
            this.fullscreenLoading = false;
            this.$swal('Registered!', 'Successfully canceled.', 'success');
          } else {
            this.fullscreenLoading = false;
            this.$swal('Failed!', 'Failed to cancel this class.', 'danger');
          }
        }
      });
    }
  },
  computed: {
    ...mapState('student', ['listMyClasses'])
  },
  async created() {
    let classes = await this.getMyClasses();

    if (classes) {
      this.loadingData = false;
    }
  }
};
</script>
