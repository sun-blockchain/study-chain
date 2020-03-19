<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <div class="mb-5">
      <div></div>
    </div>

    <table-student
      :title="`My Classes`"
      :listAll="listMyClasses"
      :loadingData="loadingData"
      :btnCancel="true"
      :nameFunctionCancelRegistered="`cancelClass`"
      :nameFunctionDetail="`detailClass`"
      :statusCol="true"
      :listProperties="[
        { prop: 'ClassCode', label: 'Class' },
        { prop: 'SubjectName', label: 'Subject' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'Repeat', label: 'Repeat' }
      ]"
      :date="true"
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
import { Button, Message, MessageBox } from 'element-ui';
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
      MessageBox.confirm(`Are you sure to unenroll this class?`, {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
        center: true
      })
        .then(async () => {
          this.fullscreenLoading = true;

          let data = await this.cancelRegisteredClass({
            classId: row.ClassID
          });

          if (!data) {
            this.fullscreenLoading = false;
            await this.getMyClasses();
            return Message.error(data.msg);
          }

          this.status = false;
          Message.success('Unenroll successfully!');

          await this.getMyClasses();
          this.fullscreenLoading = false;
        })
        .catch(() => {
          Message.error('Unenroll has failed');
          this.fullscreenLoading = false;
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
