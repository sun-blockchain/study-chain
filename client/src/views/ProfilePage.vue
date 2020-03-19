<template>
  <div>
    <div class="main-content" v-loading.fullscreen.lock="fullscreenLoading">
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
        <div class="row d-flex justify-content-center">
          <div class="col-xl-10 order-xl-1">
            <div class="card bg-secondary shadow">
              <b-card no-body>
                <b-tabs card>
                  <b-tab title="My account" active>
                    <div class="card-body">
                      <el-form
                        :model="ruleForm"
                        :rules="rules"
                        ref="ruleForm"
                        class="demo-ruleForm"
                      >
                        <div class="row mb-5">
                          <div class="col-sm-8">
                            <h3 class="heading-small text-muted mb-4">User information</h3>
                          </div>
                          <div class="col-sm-4">
                            <div class="box-upload float-sm-right">
                              <el-upload
                                ref="upload"
                                class="rounded-circle hover-upload-avatar"
                                action
                                :auto-upload="false"
                                :show-file-list="false"
                                :multiple="false"
                                :limit="1"
                                :on-change="submitUploadAvatar"
                              >
                                <img
                                  v-if="ruleForm.avatar"
                                  :src="ruleForm.avatar"
                                  class="avatar-img-upload rounded-circle"
                                />
                                <img
                                  v-else
                                  src="@/assets/img/avatar-default.png"
                                  class="avatar-img-upload rounded-circle"
                                />
                                <div class="hover-upload">
                                  <i class="el-icon-upload" />
                                </div>
                              </el-upload>
                            </div>
                          </div>
                        </div>
                        <el-form-item required>
                          <div class="row">
                            <div class="col-sm-6 mt-2">
                              <el-form-item prop="username">
                                <h6 class="el-input__inner">{{ ruleForm.username }}</h6>
                              </el-form-item>
                            </div>
                            <div class="col-sm-6 mt-2">
                              <el-form-item prop="fullname">
                                <el-input
                                  v-model="ruleForm.fullname"
                                  placeholder="Full name"
                                ></el-input>
                              </el-form-item>
                            </div>
                          </div>
                        </el-form-item>
                        <el-form-item>
                          <div class="row">
                            <div class="col-sm-6 mt-sm-1 mt-2">
                              <el-form-item prop="email">
                                <el-input v-model="ruleForm.email" placeholder="Email"></el-input>
                              </el-form-item>
                            </div>
                            <div class="col-sm-6 mt-sm-1 mt-2">
                              <el-form-item
                                prop="phonenumber"
                                class="style-input-phonenumber"
                                v-if="checkInput"
                              >
                                <vue-tel-input
                                  v-model="ruleForm.phonenumber"
                                  @validate="inputNumberPhone"
                                  @country-changed="countryChanged"
                                  :defaultCountry="ruleForm.country"
                                ></vue-tel-input>
                              </el-form-item>
                            </div>
                          </div>
                        </el-form-item>
                        <el-form-item>
                          <div class="row">
                            <div class="col-sm-6 mt-2">
                              <el-form-item prop="address">
                                <el-input
                                  v-model="ruleForm.address"
                                  placeholder="Address"
                                ></el-input>
                              </el-form-item>
                            </div>
                            <div class="col-sm-6 mt-2">
                              <div class="row">
                                <div class="col-sm-6 mt-1 mt-sm-0">
                                  <el-form-item prop="sex">
                                    <el-select v-model="ruleForm.sex" placeholder="Gender">
                                      <el-option label="Male" value="0"></el-option>
                                      <el-option label="Female" value="1"></el-option>
                                      <el-option label="Other" value="2"></el-option>
                                    </el-select>
                                  </el-form-item>
                                </div>
                                <div class="col-sm-6 mt-3 mt-sm-0">
                                  <el-form-item prop="birthday">
                                    <el-date-picker
                                      v-model="ruleForm.birthday"
                                      type="date"
                                      placeholder="Birthday"
                                      format="dd-MM-yyyy"
                                      value-format="dd-MM-yyyy"
                                      :default-value="defaultDate()"
                                      :picker-options="pickerOptions"
                                    ></el-date-picker>
                                  </el-form-item>
                                </div>
                              </div>
                            </div>
                          </div>
                        </el-form-item>

                        <el-form-item>
                          <el-button type="primary" @click="submitForm('ruleForm')"
                            >Update</el-button
                          >
                        </el-form-item>
                      </el-form>
                    </div>
                  </b-tab>
                  <b-tab title="Change Password">
                    <div class="card-body">
                      <el-form
                        :model="changePassword"
                        status-icon
                        :rules="ruleChangePass"
                        ref="changePassword"
                        class="demo-ruleForm"
                      >
                        <div class="row justify-content-center">
                          <div class="col-lg-8">
                            <el-form-item prop="oldPass">
                              <el-input
                                type="password"
                                v-model="changePassword.oldPass"
                                autocomplete="off"
                                placeholder="Current Password"
                                clearable
                              ></el-input>
                            </el-form-item>
                          </div>
                          <div class="col-lg-8">
                            <el-form-item prop="newPass">
                              <el-input
                                type="password"
                                v-model="changePassword.newPass"
                                autocomplete="off"
                                placeholder="New Password"
                                clearable
                              ></el-input>
                            </el-form-item>
                          </div>
                          <div class="col-lg-8">
                            <el-form-item prop="confirmPass">
                              <el-input
                                type="password"
                                v-model="changePassword.confirmPass"
                                autocomplete="off"
                                placeholder="Comfirm Password"
                                clearable
                              ></el-input>
                            </el-form-item>
                          </div>
                          <div class="col-lg-8">
                            <el-form-item>
                              <el-button
                                type="primary"
                                @click="submitChangePassword('changePassword')"
                                >Change</el-button
                              >
                              <el-button @click="resetFormChangePass('changePassword')"
                                >Reset</el-button
                              >
                            </el-form-item>
                          </div>
                        </div>
                      </el-form>
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
import {
  Upload,
  Form,
  FormItem,
  Input,
  RadioGroup,
  Radio,
  Button,
  Select,
  Option,
  DatePicker
} from 'element-ui';
import { mapState, mapActions } from 'vuex';
import { Message } from 'element-ui';
import axios from 'axios';
import { VueTelInput } from 'vue-tel-input';
export default {
  components: {
    'el-upload': Upload,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-radio-group': RadioGroup,
    'el-radio': Radio,
    'el-button': Button,
    'el-select': Select,
    'el-option': Option,
    'el-date-picker': DatePicker,
    VueTelInput
  },
  data() {
    var validateEmail = (rule, value, callback) => {
      if (value) {
        var mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (mailRegex.test(value)) {
          callback();
        } else {
          callback(new Error('Wrong email format'));
        }
      } else {
        callback();
      }
    };

    var valiRePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('confirm password is required'));
      } else if (value !== this.changePassword.newPass) {
        console.log('value', typeof value);
        console.log('this.changePassword.newPass', typeof this.changePassword.newPass);

        callback(new Error('new password and confirm password does not match!'));
      } else {
        callback();
      }
    };
    return {
      checkInput: false,
      imageUrl: '',
      validPhoneNumber: false,
      fullscreenLoading: false,
      ruleForm: {
        username: '',
        fullname: '',
        phonenumber: '',
        country: '',
        email: '',
        address: '',
        birthday: '',
        sex: '',
        avatar: ''
      },
      changePassword: {
        oldPass: '',
        newPass: '',
        confirmPass: ''
      },
      rules: {
        fullname: [
          {
            required: true,
            message: 'fullname is required',
            trigger: 'blur'
          },
          {
            min: 6,
            message: 'fullname must be at least 6 characters',
            trigger: 'blur'
          }
        ],
        email: [{ validator: validateEmail, trigger: 'blur' }],
        phonenumber: [
          {
            validator: this.validatePhoneNumber,
            trigger: 'blur'
          }
        ]
      },
      ruleChangePass: {
        oldPass: [
          {
            required: true,
            message: 'current password is required',
            trigger: 'blur'
          },
          {
            min: 6,
            message: 'current password must be at least 6 characters',
            trigger: 'blur'
          }
        ],
        newPass: [
          {
            required: true,
            message: 'new password is required',
            trigger: 'blur'
          },
          {
            min: 6,
            message: 'new password must be at least 6 characters',
            trigger: 'blur'
          }
        ],
        confirmPass: [
          {
            validator: valiRePass,
            trigger: 'blur'
          },
          {
            min: 6,
            message: 'confirm password must be at least 6 characters',
            trigger: 'blur'
          }
        ]
      },
      pickerOptions: {
        disabledDate(time) {
          let user = localStorage.getItem('user');
          user = JSON.parse(user);

          if (user.role === 2) {
            return time.getTime() > Date.now() - 3600 * 1000 * 24 * 365 * 18;
          } else {
            return time.getTime() > Date.now() - 3600 * 1000 * 24 * 365 * 6;
          }
        }
      }
    };
  },
  methods: {
    ...mapActions('account', ['getProfile', 'pushProfile', 'changePass']),
    countryChanged(country) {
      this.ruleForm.country = country.iso2;
    },
    defaultDate() {
      let user = localStorage.getItem('user');
      user = JSON.parse(user);

      if (user.role === 2) {
        return Date.now() - 3600 * 1000 * 24 * 365 * 18;
      } else {
        return Date.now() - 3600 * 1000 * 24 * 365 * 6;
      }
    },
    inputNumberPhone(number) {
      this.ruleForm.country = number.regionCode;
      this.validPhoneNumber = number.valid;
    },
    validatePhoneNumber(rule, value, callback) {
      if (value) {
        if (this.validPhoneNumber) {
          callback();
        } else {
          callback(new Error('Wrong phone number format'));
        }
      } else {
        callback();
      }
    },
    submitUploadAvatar() {
      if (this.$refs.upload.uploadFiles.length >= 1) {
        let user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
          this.fullscreenLoading = true;
          var formData = new FormData();
          formData.append('image', this.$refs.upload.uploadFiles[0].raw);
          axios
            .put(`${process.env.VUE_APP_API_BACKEND}/me/avatar`, formData, {
              headers: {
                'authorization': user.token,
                'Content-Type': 'multipart/form-data'
              }
            })
            .then(async (response) => {
              this.ruleForm.avatar = response.data.imageUrl;
              this.ruleForm = await this.getProfile();
              await this.$refs.upload.clearFiles();
              Message.success('Update avatar success!');
              this.fullscreenLoading = false;
            })
            .catch((errors) => {
              Message.error('Update avatar error!');
              this.fullscreenLoading = false;
              console.log(errors);
            });
        }
      } else {
        Message.error('Input avatar is empty!');
      }
    },
    changeInputFile(file) {
      const isJPG = file.raw.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        Message.error('Avatar picture must be JPG format!');
        this.$refs.upload.clearFiles();
        return false;
      }
      if (!isLt2M) {
        Message.error('Avatar picture size can not exceed 2MB!');
        this.$refs.upload.clearFiles();
        return false;
      }
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    submitForm(formName) {
      let self = this;
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          let data = await self.pushProfile(self.ruleForm);
          if (!data) {
            self.fullscreenLoading = false;
            return Message.error(data.msg);
          }

          self.ruleForm = await self.getProfile();
          Message.success('Update Success!');
          self.fullscreenLoading = false;
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    submitChangePassword(formName) {
      let self = this;
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          let data = await this.changePass(self.changePassword);

          if (!data || data.msg !== 'Change password successfully') {
            self.fullscreenLoading = false;
            return Message.error(data.msg);
          }

          Message.success('Your password has been changed successfully!');
          self.fullscreenLoading = false;
        } else {
          console.log('Something went wrong, please try again!');
          return false;
        }
      });
    },
    resetFormChangePass(formName) {
      this.$refs[formName].resetFields();
    }
  },
  async mounted() {
    let ruleForm = await this.getProfile();
    if (ruleForm) {
      this.ruleForm = ruleForm;
      this.imageUrl = this.ruleForm.avatar;
    }
    this.$watch(
      'ruleForm',
      () => {
        this.checkInput = true;
      },
      { immediate: true }
    );
  }
};
</script>

<style scoped>
@import '../assets/styleProfile.css';
</style>
