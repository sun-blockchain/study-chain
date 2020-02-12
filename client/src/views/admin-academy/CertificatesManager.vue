<template>
  <div>
    <table-admin
      :title="`Certificates Manager`"
      :listAll="listSubjects"
      :loadingData="loadingData"
      :btnDetail="true"
      :nameFunctionDetail="`detailCertificate`"
      :listProperties="[
        { prop: 'SubjectID', label: 'SubjectID' },
        { prop: 'Name', label: 'Name Subject' }
      ]"
      @detailCertificate="detailCertificate($event)"
    ></table-admin>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import TableAdmin from '@/components/admin-academy/TableAdmin';
export default {
  components: {
    TableAdmin
  },
  data() {
    return {
      form: {
        Name: ''
      },
      newSubject: {
        Name: ''
      },
      loadingData: true
    };
  },
  computed: {
    ...mapState('adminAcademy', ['listSubjects'])
  },
  methods: {
    ...mapActions('adminAcademy', ['getAllSubjects']),
    info(item) {
      this.form.Name = item.Name;
      this.$root.$emit('bv::show::modal', 'info-modal');
    },
    detailCertificate(row) {
      this.$router.push({ path: `certificates/${row.SubjectID}/students` });
    }
  },
  async created() {
    await this.getAllSubjects();
    this.loadingData = false;
  }
};
</script>
