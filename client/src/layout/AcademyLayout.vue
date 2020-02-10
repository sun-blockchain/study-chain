<template>
  <div>
    <NavbarHeader />
    <div class="container-fluid">
      <div class="row">
        <sidebar-left-admin
          class="col-lg-2 col-md-4 col-6 d-md-block bg-light sidebar sidebar-left"
        />
        <div class="col-lg-10 col-md-12 col-12">
          <slide-y-up-transition mode="out-in" origin="center top">
            <router-view></router-view>
          </slide-y-up-transition>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { SlideYUpTransition } from "vue2-transitions";
import NavbarHeader from "@/components/common/NavbarHeader";
import SidebarLeftAdmin from "@/components/common/SidebarLeftAdmin";
export default {
  name: "navbar-header",
  components: {
    SlideYUpTransition,
    NavbarHeader,
    SidebarLeftAdmin
  }
};
</script>
