<template>
  <div>
    <table-admin
      :title="`Courses Manager`"
      :btnCreate="true"
      :listAll="listCourses"
      :loadingData="loadingData"
      :btnDetail="true"
      :nameFunctionDetail="`detailCourses`"
      :btnEdit="true"
      :nameFunctionEdit="`modalEdit`"
      :nameFunctionDelete="`delCourse`"
      :btnDelete="true"
      :listProperties="[
        { prop: 'CourseCode', label: 'CourseCode' },
        { prop: 'CourseName', label: 'CourseName' },
        { prop: 'Description', label: 'Description' }
      ]"
      @detailCourses="detailCourse($event)"
      @modalEdit="modalEdit($event)"
      @delCourse="delCourse($event)"
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
          <ValidationProvider rules="required" name="Course Code" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editCourse.CourseCode"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Course Code"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Course Name" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editCourse.CourseName"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Course Name"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Course Description" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-textarea
                type="text"
                v-model="editCourse.Description"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Course Description"
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
        title="Tạo Mới Khóa Học"
        @ok.prevent="passes(handleCreate)"
        @cancel="resetInfoModalCreate"
        v-loading.fullscreen.lock="fullscreenLoading"
      >
        <b-form>
          <ValidationProvider rules="required" name="Course Code" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newCourse.CourseCode"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Course Code"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Course Name" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newCourse.CourseName"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Course Name"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{
                errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Course Description" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-textarea
                v-model="newCourse.Description"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Course Description"
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
export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableAdmin
  },
  data() {
    return {
      editCourse: {
        CourseID: '',
        CourseCode: '',
        CourseName: '',
        Description: ''
      },
      newCourse: {
        CourseCode: '',
        CourseName: '',
        Description: ''
      },
      fullscreenLoading: false,
      loadingData: true
    };
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getAllCourses',
      'createCourse',
      'updateCourse',
      'deleteCourse'
    ]),
    detailCourse(row) {
      this.$router.push({ path: `subjects/${row.CourseID}/students` });
    },
    modalEdit(row) {
      console.log(row);
      this.editCourse.CourseID = row.CourseID;
      this.editCourse.CourseCode = row.CourseCode;
      this.editCourse.CourseName = row.CourseName;
      this.editCourse.Description = row.Description;

      this.$root.$emit('bv::show::modal', 'modal-edit');
    },
    async handleCreate() {
      this.$refs['modal-create'].hide();
      this.fullscreenLoading = true;
      let response = await this.createCourse(this.newCourse);
      if (response) {
        await this.resetInfoModalCreate();
      }
      this.fullscreenLoading = false;
      await this.getAllCourses();
    },
    async handleUpdate() {
      this.$refs['modal-edit'].hide();
      this.fullscreenLoading = true;
      await this.updateCourse(this.editCourse);
      await this.resetInfoModalEdit();
      this.fullscreenLoading = false;
      await this.getAllCourses();
    },
    resetInfoModalEdit() {
      this.editCourse.CourseCode = '';
      this.editCourse.CourseName = '';
      this.editCourse.Description = '';
    },
    resetInfoModalCreate() {
      this.newCourse.CourseCode = '';
      this.newCourse.CourseName = '';
      this.newCourse.Description = '';
      requestAnimationFrame(() => {
        this.$refs.observer.reset();
      });
    },
    async delCourse(row) {
      console.log(row);

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
          await this.deleteCourse(row.CourseID);
          await this.getAllCourses();
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
    ...mapState('adminAcademy', ['listCourses'])
  },
  async created() {
    let response = await this.getAllCourses();
    if (response) {
      this.loadingData = false;
    }
  }
};
</script>
