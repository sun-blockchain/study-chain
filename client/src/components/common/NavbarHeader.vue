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
      <b-navbar-brand href="/" class="margin-left-15">Certificate Verify</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse">
        <em>
          <img
            src="https://images.viblo.asia/60x60/66e3b1f8-0b62-44e2-8a6a-deae3a61c125.jpg"
            srcset="https://images.viblo.asia/120x120/66e3b1f8-0b62-44e2-8a6a-deae3a61c125.jpg 2x"
            class="avatar avatar--md rounded-circle"
            aria-describedby="el-popover-8083"
            tabindex="0"
          />
        </em>
      </b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <div class="input-group input-group-alternative">
              <b-form-input size="sm" placeholder="Search" class="form-control"></b-form-input>
            </div>
          </b-nav-form>
          <b-nav-item-dropdown right>
            <!-- Using 'button-content' slot -->
            <template v-slot:button-content>
              <em>
                <img
                  src="https://images.viblo.asia/60x60/66e3b1f8-0b62-44e2-8a6a-deae3a61c125.jpg"
                  srcset="https://images.viblo.asia/120x120/66e3b1f8-0b62-44e2-8a6a-deae3a61c125.jpg 2x"
                  class="avatar avatar--md rounded-circle"
                  aria-describedby="el-popover-8083"
                  tabindex="0"
                  id="avatar-desktop"
                />
              </em>
            </template>
            <b-dropdown-item to="/profile">Profile</b-dropdown-item>
            <b-dropdown-item @click="logout">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "navbar-header",
  data() {
    return {
      username: "Ngo Van Nghia"
    };
  },
  methods: {
    ...mapActions(["changeStatusSidebar"]),
    ...mapActions("account", ["logout"])
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
