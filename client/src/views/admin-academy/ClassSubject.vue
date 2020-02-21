<template>
  <div class="container-fluid">
    <h1 class="bannerTitle_1wzmt7u">ClassRoom: {{ listClasses.Room }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item href="/academy"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item active>Class Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h2 class="h4 mb-2 text-gray-800">About this classs</h2>
          <p>Time: {{ listClasses.Time }}</p>
          <p>Capacity: {{ listClasses.Capacity }}</p>
          <p>Status: {{ listClasses.Status }}</p>
          <p>{{ listClasses.Description }}</p>
          <el-button type="danger" round size="mini" @click="close()">Close</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { Button } from 'element-ui';

export default {
  components: {
    'el-button': Button
  },
  methods: {
    ...mapActions('adminAcademy', ['getClass', 'closeClass']),
    close() {
      this.$swal({
        title: 'Are you sure to close this class?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Yes, delete it!',
        reverseButtons: true
      }).then(async (result) => {
        if (result.value) {
          this.fullscreenLoading = true;
          await this.closeClass({
            classId: this.$route.params.classId
          });

          await this.getClass(this.$route.params.classId);
          this.fullscreenLoading = false;

          this.$swal('Closed!', 'This class has been closed.', 'success');
        }
      });
    }
  },
  computed: {
    ...mapState('adminAcademy', ['listClasses'])
  },
  async created() {
    let _class = await this.getClass(this.$route.params.classId);
    if (_class.success) {
      this.listClasses = _class.class;
    }
    this.loadingData = false;
  }
};
</script>
<style scoped>
.bannerTitle_1wzmt7u {
  font-family: 'OpenSans-Bold', Arial, sans-serif;
  font-size: 34px;
  line-height: 46px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 24px;
  color: blue;
}
</style>
