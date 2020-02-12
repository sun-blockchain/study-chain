<template>
  <div>
    <table-admin
      :title="`LList Of Student Subject`"
      :listAll="subjectOfStudent"
      :loadingData="loadingData"
      :listProperties="[
        { prop: 'SubjectID', label: 'SubjectID' },
        { prop: 'Name', label: 'Name Subject' }
      ]"
    ></table-admin>
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
      form: {
        Name: ''
      },
      newSubject: {
        Name: ''
      },
      fields: [
        {
          key: 'SubjectID',
          label: 'SubjectID',
          class: 'text-center',
          sortable: true
        },
        {
          key: 'Name',
          label: 'Name Subject',
          class: 'text-center',
          sortable: true
        }
      ],
      currentPage: 1,
      perPage: 12,
      pageOptions: [12, 24, 36],
      loadingData: true
    };
  },
  computed: {
    ...mapState('adminAcademy', ['subjectOfStudent'])
  },
  methods: {
    ...mapActions('adminAcademy', ['getSubjectsOfStudent'])
  },
  async created() {
    await this.getSubjectsOfStudent(this.$route.params.id);
    this.loadingData = false;
  }
};
</script>
