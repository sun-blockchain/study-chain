<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "app",
  methods: {
    ...mapActions({
      clearAlert: "alert/clear"
    })
  },
  watch: {
    $route(to, from) {
      this.clearAlert();
    }
  }
};
</script>
