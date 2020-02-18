<template>
  <div class="container-fluid">
    <h1 class="bannerTitle_1wzmt7u">Tên môn học</h1>
    <b-breadcrumb>
      <b-breadcrumb-item href="/academy"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item href="/academy/subjects">Subject</b-breadcrumb-item>
      <b-breadcrumb-item active>Subject Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">About this subject</h1>

          <p>Description</p>
        </div>
      </div>
    </div>
    <table-admin
      :title="`Classes list`"
      :btnCreate="true"
      :listAll="listClasses"
      :loadingData="loadingData"
      :btnDetail="true"
      :nameFunctionDetail="`detailClasss`"
      :btnEdit="true"
      :nameFunctionEdit="`modalEdit`"
      :nameFunctionDelete="`delClass`"
      :btnDelete="true"
      :listProperties="[
        { prop: 'ClassCode', label: 'ClassCode' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'ShortDescription', label: 'Short Description' },
        { prop: 'Description', label: 'Description' }
      ]"
      @detailClasss="detailClass($event)"
      @modalEdit="modalEdit($event)"
      @delClass="delClass($event)"
    ></table-admin>

    <ValidationObserver ref="observer" v-slot="{ passes }">
      <b-modal
        id="modal-edit"
        ref="modal-edit"
        ok-title="Update"
        @ok.prevent="passes(handleUpdate)"
        title="Cập Nhật Khóa Học"
      >
        <b-form>
          <ValidationProvider rules="required" name="Class Code" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editClass.ClassCode"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class Code"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">
                {{ errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Class Name" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editClass.ClassName"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class Name"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">
                {{ errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
            { path: '/academy/courses', name: 'academy-courses', component: () =>
            import('./views/admin-academy/ClasssManager.vue') },
          </ValidationProvider>
          <ValidationProvider rules="required" name="Class Description" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-textarea
                type="text"
                v-model="editClass.Description"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class Description"
              ></b-form-textarea>
              <b-form-invalid-feedback id="inputLiveFeedback">
                {{ errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
        </b-form>
      </b-modal>
    </ValidationObserver>

    <ValidationObserver ref="observer" v-slot="{ passes }">
      <b-modal
        id="modal-create"
        ref="modal-create"
        title="Create new class"
        @ok.prevent="passes(handleCreate)"
        @cancel="resetInfoModalCreate"
        v-loading.fullscreen.lock="fullscreenLoading"
      >
        <b-form>
          <ValidationProvider rules="required" name="Class Code" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newClass.ClassCode"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class Code"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">
                {{ errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Room" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newClass.Room"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class room"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">
                {{ errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Time" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="time"
                v-model="newClass.Time"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Time"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">
                {{ errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Short Description" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newClass.ShortDescription"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class Short Description"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">
                {{ errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Class Description" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-textarea
                v-model="newClass.Description"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class Description"
              ></b-form-textarea>
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
export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableAdmin
  },
  data() {
    return {
      editClass: {
        ClassID: '',
        ClassCode: '',
        Room: '',
        Time: '',
        ShortDescription: '',
        Description: ''
      },
      newClass: {
        ClassID: '',
        ClassCode: '',
        Room: '',
        Time: '',
        ShortDescription: '',
        Description: ''
      },
      fullscreenLoading: false,
      loadingData: false
    };
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getClassesOfSubject',
      'createClass',
      'updateClass',
      'deleteClass'
    ]),
    detailClass(row) {
      this.$router.push({ path: `subjects/${row.ClassID}/classes` });
    },
    modalEdit(row) {
      this.editClass.ClassID = row.ClassID;
      this.editClass.ClassCode = row.ClassCode;
      this.editClass.ClassName = row.ClassName;
      this.editClass.Description = row.Description;

      this.$root.$emit('bv::show::modal', 'modal-edit');
    },
    async handleCreate() {
      this.$refs['modal-create'].hide();
      this.fullscreenLoading = true;
      let response = await this.createClass(this.newClass);
      if (response) {
        await this.resetInfoModalCreate();
      }
      this.fullscreenLoading = false;
      await this.getAllClasss();
    },
    async handleUpdate() {
      this.$refs['modal-edit'].hide();
      this.fullscreenLoading = true;
      await this.updateClass(this.editClass);
      await this.resetInfoModalEdit();
      this.fullscreenLoading = false;
      await this.getAllClasss();
    },
    resetInfoModalEdit() {
      this.editClass.ClassCode = '';
      this.editClass.ClassName = '';
      this.editClass.Description = '';
    },
    resetInfoModalCreate() {
      this.newClass.ClassCode = '';
      this.newClass.ClassName = '';
      this.newClass.Description = '';
      requestAnimationFrame(() => {
        this.$refs.observer.reset();
      });
    },
    async delClass(row) {
      this.$swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Yes, delete it!',
        reverseButtons: true
      }).then(async (result) => {
        if (result.value) {
          this.fullscreenLoading = true;
          await this.deleteClass(row.ClassID);
          await this.getAllClasss();
          this.fullscreenLoading = false;

          this.$swal('Deleted!', 'Your file has been deleted.', 'success');
        }
      });
    },
    btnCreate(item, button) {
      this.$root.$emit('bv::show::modal', button);
    }
  },
  computed: {
    ...mapState('adminAcademy', ['listClasses', 'listSubject'])
  },
  async created() {
    let classes = await this.getClassesOfSubject(this.$route.params.id);
    if (classes) {
      this.loadingData = false;
    }
  }
};
</script>
