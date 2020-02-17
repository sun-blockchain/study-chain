<template>
  <div>
    <table-admin
      :title="`Teachers Manager`"
      :listAll="listTeachers"
      :loadingData="loadingData"
      :btnDetail="true"
      :nameFunctionDetail="`detailTeacher`"
      :btnInfo="true"
      :nameFunctionInfo="`info`"
      :btnDelete="true"
      :nameFunctionDelete="`delTeacher`"
      :listProperties="[
        { prop: 'Fullname', label: 'Fullname' },
        { prop: 'Username', label: 'Username' }
      ]"
      @delTeacher="delTeacher($event)"
      @info="info($event)"
      @detailTeacher="detailTeacher($event)"
    >
      <template v-slot:btn-create>
        <el-button
          type="success"
          icon="fas fa-plus"
          size="medium"
          round
          v-b-modal.modal-create
        ></el-button>
        <!-- <div class="box-defaul-header"></div> -->
      </template>
    </table-admin>

    <b-modal
      id="info-modal"
      @hide="resetInfoModalDetail"
      title="Cập Nhật Môn Học"
      ok-only
      ok-variant="secondary"
      ok-title="Cancel"
    >
      <b-form>
        <b-form-group id="input-group-1" label-for="input-1">
          <div class="row">
            <div class="col-4">
              <h6>Fullname:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{ teacher.Fullname }}</h5>
            </div>
          </div>
        </b-form-group>
        <b-form-group id="input-group-2" label-for="input-2">
          <div class="row">
            <div class="col-4">
              <h6>Username:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{ teacher.Username }}</h5>
            </div>
          </div>
        </b-form-group>
      </b-form>
    </b-modal>

    <ValidationObserver ref="observer" v-slot="{ passes }">
      <b-modal
        id="modal-create"
        ref="modal-create"
        title="Tạo Mới Giáo Viên"
        @ok.prevent="passes(handleCreate)"
        @cancel="resetInfoModalCreate"
        v-loading.fullscreen.lock="fullscreenLoading"
      >
        <b-form>
          <div v-if="alert.message" :class="`text-center alert ${alert.type}`">
            {{ alert.message }}
          </div>
          <ValidationProvider rules="required" name="Teacher Username" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newTeacher.Username"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Username"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">
                {{ errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider
            rules="required|min:6"
            name="Teacher Fullname"
            v-slot="{ valid, errors }"
          >
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newTeacher.Fullname"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Fullname"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">
                {{ errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
        </b-form>
      </b-modal>
    </ValidationObserver>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableAdmin from '@/components/admin-academy/TableAdmin';
import { Button } from 'element-ui';
export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableAdmin,
    'el-button': Button
  },
  data() {
    return {
      teacher: {
        Fullname: '',
        Username: ''
      },
      newTeacher: {
        Fullname: '',
        Username: ''
      },
      infoModal: {
        id: 'info-modal',
        total: ''
      },
      fullscreenLoading: false,
      loadingData: true
    };
  },
  computed: {
    ...mapState('adminAcademy', ['listTeachers']),
    ...mapState({
      alert: (state) => state.alert
    })
  },
  methods: {
    ...mapActions('adminAcademy', ['getAllTeachers', 'deleteTeacher', 'createTeacher']),
    detailTeacher(row) {
      this.$router.push({ path: `teachers/${row.Username}/subjects` });
    },
    info(row) {
      this.teacher.Fullname = row.Fullname;
      this.teacher.Username = row.Username;
      this.$root.$emit('bv::show::modal', 'info-modal');
    },
    async handleCreate(bvModalEvt) {
      this.fullscreenLoading = true;
      await this.createTeacher(this.newTeacher);
      if (this.alert.type != 'alert-danger') {
        this.$refs['modal-create'].hide();
        await this.resetInfoModalCreate();
      }
      this.fullscreenLoading = false;
    },
    resetInfoModalCreate() {
      this.newTeacher.Username = '';
      this.newTeacher.Fullname = '';
      requestAnimationFrame(() => {
        this.$refs.observer.reset();
      });
    },
    resetInfoModalDetail() {
      this.teacher.Fullname = '';
      this.teacher.teacher = '';
    },
    delTeacher(teacher) {
      this.$swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Yes, delete it!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          this.deleteTeacher(teacher);
          this.$swal('Deleted!', 'Your file has been deleted.', 'success');
        }
      });
    }
  },
  async created() {
    await this.getAllTeachers();
    this.loadingData = false;
  }
};
</script>
