<template>
  <div class="sticky-top">
    <b-navbar toggleable="lg" type="dark" variant="info">
      <button
        type="button"
        class="btn btn-link bd-search-docs-toggle d-lg-none p-0 ml-3 collapsed"
        @click="changeStatusSidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 30 30"
          width="30"
          height="30"
          focusable="false"
        >
          <path
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-miterlimit="10"
            d="M4 7h22M4 15h22M4 23h22"
          />
        </svg>
      </button>
      <b-navbar-brand href="/" class="margin-left-15">Study Chain</b-navbar-brand>

      <b-collapse id="nav-collapse" is-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <p class="fullname pt-2 pr-2">{{ fullname }}</p>
          <b-nav-item-dropdown right>
            <!-- Using 'button-content' slot -->
            <template v-slot:button-content>
              <em>
                <img
                  v-if="avatar"
                  :src="avatar"
                  class="avatar avatar--md rounded-circle"
                  aria-describedby="el-popover-8083"
                  tabindex="0"
                  id="avatar-desktop"
                />
                <img
                  v-else
                  src="@/assets/img/avatar-default.png"
                  srcset="@/assets/img/avatar-default.png"
                  class="avatar avatar--md rounded-circle"
                  aria-describedby="el-popover-8083"
                  tabindex="0"
                  id="avatar-desktop"
                />
              </em>
            </template>
            <b-dropdown-item to="/profile" v-if="user.role !== 1">Profile</b-dropdown-item>
            <b-dropdown-item @click="logout">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
export default {
  name: 'navbar-header',
  computed: {
    ...mapState('account', ['user'])
  },
  data() {
    return {
      fullname: '',
      avatar: ''
    };
  },
  methods: {
    ...mapActions(['changeStatusSidebar']),
    ...mapActions('account', ['logout', 'getProfile'])
  },
  async created() {
    let info = await this.getProfile();

    this.fullname = info.fullname;
    this.avatar = info.avatar;
  }
};
</script>
<style scoped>
.margin-left-15 {
  margin-left: 15px;
}
.margin-top-5rem {
  margin: 0.5rem 0 0;
}

.sticky-top {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 1020;
}
.navbar {
  padding: 0;
}
</style>
