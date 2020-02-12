<template>
  <div>
    <table-admin
      :title="`List Of Students Of Subjects`"
      :listAll="studentsOfSubject"
      :loadingData="loadingData"
      :btnInfo="true"
      :nameFunctionInfo="`info`"
      :btnDelete="true"
      :nameFunctionDelete="`delSubject`"
      :listProperties="[
        { prop: 'Fullname', label: 'Fullname' },
        { prop: 'Username', label: 'Username' }
      ]"
      @info="info($event)"
      @delSubject="delSubject($event)"
    ></table-admin>

    <b-modal
      id="info-modal"
      @hide="resetInfoModalDetail"
      title="Information Student"
      ok-only
      ok-variant="secondary"
      ok-title="Cancel"
    >
      <b-form>
        <b-form-group id="input-group-1" label-for="input-1">
          <div class="row">
            <div class="col-4">
              <h6>Fullname:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{ student.Fullname }}</h5>
            </div>
          </div>
        </b-form-group>
        <b-form-group id="input-group-2" label-for="input-2">
          <div class="row">
            <div class="col-4">
              <h6>Username:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{ student.Username }}</h5>
            </div>
          </div>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import TableAdmin from '@/components/admin-academy/TableAdmin';
export default {
  components: {
    TableAdmin
  },
  data() {
    return {
      student: {
        Fullname: ''
      },
      loadingData: true
    };
  },
  computed: {
    ...mapState('adminAcademy', ['studentsOfSubject'])
  },
  methods: {
    ...mapActions('adminAcademy', ['getStudentsOfSubject', 'deleteStudentOfSubject']),
    info(item) {
      this.student.Fullname = item.Fullname;
      this.student.Username = item.Username;
      this.$root.$emit('bv::show::modal', 'info-modal');
    },
    resetInfoModalDetail() {
      this.student.Fullname = '';
    },
    delSubject(student) {
      this.$swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Yes, delete it!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          const SubjectID = this.$route.params.id;
          this.deleteStudentOfSubject({
            SubjectID: SubjectID,
            Username: student.Username
          });
          this.$swal('Deleted!', 'Your file has been deleted.', 'success');
        }
      });
    }
  },
  async created() {
    await this.getStudentsOfSubject(this.$route.params.id);
    this.loadingData = false;
  }
};
</script>
