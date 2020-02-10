<template>
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-7">
        <div class="banner_text">
          <div class="banner_text_iner">
            <router-link to="/register" class="btn_2 banner_btn_1" tag="a">Sign Up</router-link>
            <router-link to="/login" class="btn_2 banner_btn_2" tag="a">Sign In</router-link>
          </div>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="banner_img d-none d-lg-block">
          <img src="img/banner_img.png" alt />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},

  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  }
};
</script>

<style>
#logo-aa {
  width: 160px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
  .fade-leave-to

  /* .fade-leave-active below version 2.1.8 */
 {
  opacity: 0;
}
</style>
