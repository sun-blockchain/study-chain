<template>
  <div>
    <!--::header part start::-->
    <header class="main_menu home_menu">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-12">
            <nav class="navbar navbar-expand-lg navbar-light">
              <a class="navbar-brand" href="#">
                <!-- <img id="logo-aa" src="img/AWACA_Logo_sun-02.png" alt="logo" /> -->
              </a>
              <button
                class="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span class="menu_icon">
                  <i class="fas fa-bars"></i>
                </span>
              </button>

              <div class="collapse navbar-collapse main-menu-item" id="navbarSupportedContent">
                <ul class="navbar-nav"></ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
    <!-- Header part end-->

    <!-- banner part start-->
    <section class="banner_part">
      <router-view></router-view>
    </section>
  </div>
</template>

<script>
export default {};
</script>
