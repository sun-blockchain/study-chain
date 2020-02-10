<template>
  <div>
    <div class="main-content">
      <!-- Header -->
      <div class="header pb-8 pt-5 pt-lg-8 d-flex align-items-center header-profile">
        <!-- Mask -->
        <span class="mask bg-gradient-default opacity-8"></span>
        <!-- Header container -->
        <div class="container-fluid d-flex align-items-center">
          <div class="row"></div>
        </div>
      </div>
      <!-- Page content -->
      <div class="container-fluid mt--7">
        <div class="row">
          <div class="col-xl-4 order-xl-2 mb-5 mb-xl-0">
            <div class="card card-profile shadow">
              <div class="row justify-content-center">
                <div class="col-lg-3 order-lg-2">
                  <div class="card-profile-image">
                    <a href="#">
                      <img
                        src="https://raw.githack.com/creativetimofficial/argon-dashboard/master/assets/img/theme/team-4-800x800.jpg"
                        class="rounded-circle"
                      />
                    </a>
                  </div>
                </div>
              </div>
              <div class="card-header text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">
                <div class="d-flex justify-content-between"></div>
              </div>
              <div class="card-body pt-0 pt-md-4">
                <div class="row">
                  <div class="col">
                    <div class="card-profile-stats d-flex justify-content-center mt-md-5">
                      <div>
                        <span class="heading">22</span>
                        <span class="description">Friends</span>
                      </div>
                      <div>
                        <span class="heading">10</span>
                        <span class="description">Photos</span>
                      </div>
                      <div>
                        <span class="heading">89</span>
                        <span class="description">Comments</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="text-center">
                  <h3>
                    Jessica Jones
                    <span class="font-weight-light">, 27</span>
                  </h3>
                  <div class="h5 font-weight-300">
                    <i class="ni location_pin mr-2"></i>Bucharest, Romania
                  </div>
                  <div class="h5 mt-4">
                    <i class="ni business_briefcase-24 mr-2"></i>Solution Manager - Creative Tim Officer
                  </div>
                  <div>
                    <i class="ni education_hat mr-2"></i>University of Computer Science
                  </div>
                  <hr class="my-4" />
                  <p>Ryan — the name taken by Melbourne-raised, Brooklyn-based Nick Murphy — writes, performs and records all of his own music.</p>
                  <a href="#">Show more</a>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-8 order-xl-1">
            <div class="card bg-secondary shadow">
              <b-card no-body>
                <b-tabs card>
                  <b-tab title="My account" active>
                    <div class="card-body">
                      <form>
                        <h6 class="heading-small text-muted mb-4">User information</h6>
                        <div class="pl-lg-4">
                          <div class="row">
                            <div class="col-lg-6">
                              <div class="form-group focused">
                                <input
                                  type="text"
                                  id="input-username"
                                  class="form-control form-control-alternative"
                                  placeholder="Username"
                                />
                              </div>
                            </div>
                            <div class="col-lg-6">
                              <div class="form-group">
                                <input
                                  type="email"
                                  id="input-email"
                                  class="form-control form-control-alternative"
                                  placeholder="Email"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-lg-6">
                              <div class="form-group focused">
                                <input
                                  type="text"
                                  id="input-first-name"
                                  class="form-control form-control-alternative"
                                  placeholder="First name"
                                />
                              </div>
                            </div>
                            <div class="col-lg-6">
                              <div class="form-group focused">
                                <input
                                  type="text"
                                  id="input-last-name"
                                  class="form-control form-control-alternative"
                                  placeholder="Last name"
                                />
                              </div>
                            </div>
                            <div class="col-lg-6">
                              <div class="form-group focused">
                                <input
                                  id="input-address"
                                  class="form-control form-control-alternative"
                                  placeholder="Address"
                                  type="text"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr class="my-4" />
                        <!-- Description -->
                        <h6 class="heading-small text-muted mb-4">About me</h6>
                        <div class="pl-lg-4">
                          <div class="form-group focused">
                            <label>About Me</label>
                            <textarea
                              rows="4"
                              class="form-control form-control-alternative"
                              placeholder="A few words about you ..."
                            ></textarea>
                          </div>
                        </div>
                        <div class="col-4 text-right float-right">
                          <a href="#" class="btn btn-sm btn-primary">Update</a>
                        </div>
                      </form>
                    </div>
                  </b-tab>
                  <b-tab title="Change Password">
                    <div class="card-body">
                      <form>
                        <div class="pl-lg-4">
                          <div class="row">
                            <div class="col-lg-12">
                              <div class="form-group focused">
                                <input
                                  type="password"
                                  class="form-control form-control-alternative"
                                  placeholder="Current Password"
                                />
                              </div>
                            </div>
                            <div class="col-lg-12">
                              <div class="form-group focused">
                                <input
                                  type="password"
                                  class="form-control form-control-alternative"
                                  placeholder="New Password"
                                />
                              </div>
                            </div>
                            <div class="col-lg-12">
                              <div class="form-group">
                                <input
                                  type="password"
                                  class="form-control form-control-alternative"
                                  placeholder="Re Password"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-4 text-right float-right">
                          <a href="#" class="btn btn-sm btn-primary">Update</a>
                        </div>
                      </form>
                    </div>
                  </b-tab>
                </b-tabs>
              </b-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
@import "../assets/styleProfile.css";
</style>
