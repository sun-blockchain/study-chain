<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800 mt-3">Dashboard</h1>
      <el-tag type="success" class="mt-5 mb-2"
        >Number of enrolling courses: {{ summaryInfo.courseCount }}</el-tag
      >
      <el-tag>Number of enrolling classes: {{ summaryInfo.classCount }}</el-tag>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Vue from 'vue';
import { Tag } from 'element-ui';
Vue.use(Tag);

export default {
  data() {
    return {
      fullscreenLoading: false,
      loadingData: false
    };
  },
  computed: {
    ...mapState('student', ['summaryInfo']),
    ...mapState({
      user: (state) => state.account
    })
  },
  methods: {
    ...mapActions('student', ['getSummaryInfo'])
  },
  async created() {
    let response = await this.getSummaryInfo();

    if (response) {
      this.loadingData = false;
    }
  }
};
</script>

<style scoped>
span {
  display: block;
  font-size: 14px;
  width: 25%;
}
</style>
