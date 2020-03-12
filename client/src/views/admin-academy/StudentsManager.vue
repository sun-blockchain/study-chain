<template>
  <div>
    <table-admin
      :title="`Students Manager`"
      :listAll="listStudents"
      :loadingData="loadingData"
      :nameFunctionDetail="`detailStudent`"
      :listProperties="[
        { prop: 'Fullname', label: 'Fullname' },
        { prop: 'Username', label: 'Username' }
      ]"
      @detailStudent="detailStudent($event)"
    ></table-admin>

    <b-modal
      id="info-modal"
      @hide="resetInfoModalDetail"
      title="Cập Nhật Môn Học"
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
    ...mapState('adminAcademy', ['listStudents'])
  },
  methods: {
    ...mapActions('adminAcademy', ['getAllStudents']),
    resetInfoModalDetail() {
      this.student.Fullname = '';
    },
    detailStudent(row) {
      this.$router.push({ path: `student/${row.Username}` });
    }
  },
  async created() {
    await this.getAllStudents();
    this.loadingData = false;
  }
};
</script>
