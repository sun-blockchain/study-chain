<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { Message } from 'element-ui';
export default {
  name: 'app',
  computed: {
    ...mapState({
      alert: (state) => state.alert
    })
  },
  methods: {
    ...mapActions({
      clearAlert: 'alert/clear'
    })
  },
  watch: {
    alert: {
      deep: true,
      handler() {
        if (this.alert.alert) {
          if (this.alert.type === 'alert-success') {
            Message.success(this.alert.message);
          } else {
            Message.error(this.alert.message);
          }
        }
      }
    },
    $route(to, from) {
      this.clearAlert();
    }
  }
};
</script>
