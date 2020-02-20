<template>
  <div class="container-fluid">
    <h1 class="bannerTitle_1wzmt7u">{{ listSubjects.SubjectName }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item href="/academy"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item href="/academy/subjects">Subject</b-breadcrumb-item>
      <b-breadcrumb-item active>Subject Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">About this subject</h1>

          <p>{{ listSubjects.Description }}</p>
        </div>
      </div>
    </div>
    <table-admin
      :title="`Classes list`"
      :listAll="listClasses"
      :loadingData="loadingData"
      :btnDetail="true"
      :nameFunctionDetail="`detailClass`"
      :btnEdit="true"
      :nameFunctionEdit="`modalEdit`"
      :nameFunctionDelete="`delClass`"
      :btnDelete="true"
      :listProperties="[
        { prop: 'ClassCode', label: 'ClassCode' },
        { prop: 'Room', label: 'Room' },
        { prop: 'Time', label: 'Time' },
        { prop: 'ShortDescription', label: 'Description' },
        { prop: 'Capacity', label: 'Capacity' }
      ]"
      @detailClass="detailClass($event)"
      @modalEdit="modalEdit($event)"
      @delClass="delClass($event)"
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

    <ValidationObserver ref="observer" v-slot="{ passes }">
      <b-modal
        id="modal-edit"
        ref="modal-edit"
        ok-title="Update"
        @ok.prevent="passes(handleUpdate)"
        title="Cập Nhật Khóa Học"
      >
        <b-form>
          <ValidationProvider rules="required" name="ClassCode" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editClass.ClassCode"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class Code"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>

          <ValidationProvider rules="required" name="Room" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editClass.Room"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class room"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>

          <ValidationProvider rules="required" name="Time" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="time"
                v-model="editClass.Time"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Time"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>

          <ValidationProvider rules="required" name="ShortDescription" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editClass.ShortDescription"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class Short Description"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>

          <ValidationProvider rules="required" name="ClassDescription" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-textarea
                v-model="editClass.Description"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class Description"
              ></b-form-textarea>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Capacity" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-textarea
                v-model="editClass.Capacity"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Capacity"
              ></b-form-textarea>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
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
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
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
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
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
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
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
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Class Description" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-textarea
                v-model="newClass.Description"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Class Description"
              ></b-form-textarea>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Capacity" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-textarea
                v-model="newClass.Capacity"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Capacity"
              ></b-form-textarea>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
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
      editClass: {
        ClassID: '',
        ClassCode: '',
        Room: '',
        Time: '',
        ShortDescription: '',
        Description: '',
        SubjectId: this.$route.params.id,
        Capacity: ''
      },
      newClass: {
        ClassCode: '',
        Room: '',
        Time: '',
        ShortDescription: '',
        Description: '',
        SubjectId: this.$route.params.id,
        Capacity: ''
      },
      fullscreenLoading: false,
      loadingData: false
    };
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getSubject',
      'getClassesOfSubject',
      'createClass',
      'updateClass',
      'deleteClass'
    ]),
    detailClass(row) {
      this.$router.push({
        path: `/academy/subjects/${this.$route.params.id}/class/${row.ClassID}`
      });
    },
    modalEdit(row) {
      this.editClass.ClassID = row.ClassID;
      this.editClass.ClassCode = row.ClassCode;
      this.editClass.Room = row.Room;
      this.editClass.Time = row.Time;
      this.editClass.ShortDescription = row.ShortDescription;
      this.editClass.Description = row.Description;
      this.editClass.Capacity = row.Capacity;
      this.$root.$emit('bv::show::modal', 'modal-edit');
    },
    async handleCreate() {
      this.$refs['modal-create'].hide();
      this.fullscreenLoading = true;
      let response = await this.createClass(this.newClass);

      if (response) {
        this.resetInfoModalCreate();
        this.fullscreenLoading = false;
        this.$swal('Success!', 'Class has been created.', 'success');
      }
      await this.getClassesOfSubject(this.$route.params.id);
    },
    async handleUpdate() {
      this.$refs['modal-edit'].hide();

      this.fullscreenLoading = true;

      let response = await this.updateClass(this.editClass);

      if (response) {
        //this.resetInfoModalEdit();
        this.fullscreenLoading = false;
        this.$swal('Success!', 'Class has been edited.', 'success');
      }

      await this.getClassesOfSubject(this.$route.params.id);
    },
    resetInfoModalEdit() {
      this.editClass.ClassCode = '';
      this.editClass.Room = '';
      this.editClass.Time = '';
      this.editClass.ShortDescription = '';
      this.editClass.Description = '';
      this.editClass.Capacity = '';
    },
    resetInfoModalCreate() {
      this.newClass.ClassCode = '';
      this.newClass.Room = '';
      this.newClass.Time = '';
      this.newClass.ShortDescription = '';
      this.newClass.Description = '';
      this.newClass.Capacity = '';
      requestAnimationFrame(() => {
        this.$refs.observer.reset();
      });
    },
    async delClass(row) {
      this.$swal({
        title: 'Are you sure to delete this?',
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
          await this.deleteClass({ subjectId: this.listSubjects.SubjectID, classId: row.ClassID });

          await this.getClassesOfSubject(this.$route.params.id);
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
    ...mapState('adminAcademy', ['listClasses', 'listSubjects'])
  },
  async created() {
    let classes = await this.getClassesOfSubject(this.$route.params.id);
    let subject = await this.getSubject(this.$route.params.id);
    if (classes && subject) {
      this.loadingData = false;
    }
  }
};
</script>
<style scoped>
.bannerTitle_1wzmt7u {
  font-family: 'OpenSans-Bold', Arial, sans-serif;
  font-size: 34px;
  line-height: 46px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 24px;
  color: blue;
}
</style>
