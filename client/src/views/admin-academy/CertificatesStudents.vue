<template>
  <div>
    <table-admin
      :title="`List certificate Of Subjects`"
      :listAll="studentsOfSubject"
      :loadingData="loadingData"
      :btnInfo="true"
      :nameFunctionInfo="`info`"
      :btnConfirm="true"
      :nameFunctionConfirm="`handleConfirm`"
      :btnCert="true"
      :nameFunctionCert="`detailCert`"
      :listProperties="[
        { prop: 'Fullname', label: 'Fullname' },
        { prop: 'Username', label: 'Username' },
        { prop: 'score', label: 'Score' }
      ]"
      @info="info($event)"
      @handleConfirm="handleConfirm($event)"
      @detailCert="detailCert($event)"
    ></table-admin>

    <b-modal
      id="info-modal"
      @hide="resetInfoModalDetail"
      title="Chi Tiết Sinh Viên"
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
        <b-form-group id="input-group-2" label-for="input-2">
          <div class="row">
            <div class="col-4">
              <h6>Score:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{ student.ScoreValue }}</h5>
            </div>
          </div>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { STATUS_CERT } from '../../_helpers/constants';
import TableAdmin from '@/components/admin-academy/TableAdmin';
export default {
  components: {
    TableAdmin
  },
  data() {
    return {
      STATUS_CERT: STATUS_CERT,
      student: {
        Username: '',
        Fullname: '',
        ScoreValue: 0
      },
      loadingData: true
    };
  },
  computed: {
    ...mapState('adminAcademy', ['studentsOfSubject'])
  },
  methods: {
    ...mapActions('adminAcademy', ['getCertificatesOfSubject', 'confirmCertificate']),
    detailCert(row) {
      this.$router.push({ path: `/cert/${row.certificateId}` });
    },
    info(item) {
      this.student.Fullname = item.Fullname;
      this.student.Username = item.Username;
      this.student.ScoreValue = item.ScoreValue;
      this.$root.$emit('bv::show::modal', 'info-modal');
    },
    resetInfoModalDetail() {
      this.student.name = '';
    },
    handleConfirm(student) {
      this.$swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Yes, Confirm The Certificate!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          this.confirmCertificate({
            studentUsername: student.Username,
            subjectId: this.$route.params.id
          });
          this.$swal('Confirmed!', 'The certificate has been confirmed .', 'success');
        }
      });
    }
  },
  async created() {
    await this.getCertificatesOfSubject(this.$route.params.id);
    this.loadingData = false;
  }
};
</script>
