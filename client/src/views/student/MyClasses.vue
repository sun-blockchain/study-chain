<template>
  <div class="container-fluid">
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">My Classes</h1>
        </div>
      </div>
    </div>

    <table-student
      :title="`Classes list`"
      :listAll="listMyClasses"
      :loadingData="loadingData"
      :btnCancel="true"
      :nameFunctionCancelRegistered="`cancelClass`"
      :nameFunctionDetail="`detailClass`"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class Code' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'Status', label: 'Status' },
        { prop: 'Capacity', label: 'Capacity' }
      ]"
      @modalInfo="modalInfo($event)"
      @cancelClass="cancelClass($event)"
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
      fullscreenLoading: false,
      loadingData: false
    };
  },
  methods: {
    ...mapActions('student', ['getMyClasses', 'cancelRegisteredClass']),
    detailClass(row) {
      this.$router.push({
        path: `/student/subjects/${this.$route.subjectId}/class/${row.ClassID}`
      });
    },

    async cancelClass(row) {
      this.$swal({
        text: 'Are you sure to cancel enrollment this class ?',
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
          if (!response) {
            this.fullscreenLoading = false;
            this.$swal('Failed!', 'Failed to cancel this class.', 'error');
          } else if (response.status === 200) {
            this.fullscreenLoading = false;
            this.$swal('Canceled!', 'Successfully canceled enrollment.', 'success');
            await this.getMyClasses();
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
