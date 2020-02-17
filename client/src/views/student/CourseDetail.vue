<template>
  <div class="container-fluid">
    <h1 class="bannerTitle_1wzmt7u">{{ listCourses.CourseName }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item href="/student">
        <i class="blue fas fa-home"></i>Home
      </b-breadcrumb-item>
      <b-breadcrumb-item href="/student/courses">Course</b-breadcrumb-item>
      <b-breadcrumb-item active>Course Detail</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">About this course</h1>

          <p>{{ listCourses.Description }}</p>
        </div>
      </div>
    </div>
    <table-admin
      :title="`Student List`"
      :btnCreate="true"
      :listAll="listStudents"
      :loadingData="loadingData"
      :btnDetail="true"
      :nameFunctionDetail="`detailStudents`"
      :btnEdit="true"
      :nameFunctionEdit="`modalEdit`"
      :nameFunctionDelete="`delStudent`"
      :btnDelete="true"
      :listProperties="[
        { prop: 'StudentCode', label: 'StudentCode' },
        { prop: 'StudentName', label: 'Name' },
        { prop: 'Class', label: 'Class' }
      ]"
      @detailStudents="detailStudent($event)"
      @modalEdit="modalEdit($event)"
      @delStudent="delStudent($event)"
    ></table-admin>

    <ValidationObserver ref="observer" v-slot="{ passes }">
      <b-modal
        id="modal-edit"
        ref="modal-edit"
        ok-title="Update"
        @ok.prevent="passes(handleUpdate)"
        title="Update student's information"
      >
        <b-form>
          <ValidationProvider rules="required" name="Student Code" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editStudent.StudentCode"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Student Code"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{ errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Student Name" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editStudent.StudentName"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Student Name"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{ errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Student Class" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editStudent.Class"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Student Class"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{ errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
        </b-form>
      </b-modal>
    </ValidationObserver>

    <ValidationObserver ref="observer" v-slot="{ passes }">
      <b-modal
        id="modal-create"
        ref="modal-create"
        title="Create new student"
        @ok.prevent="passes(handleCreate)"
        @cancel="resetInfoModalCreate"
        v-loading.fullscreen.lock="fullscreenLoading"
      >
        <b-form>
          <ValidationProvider rules="required" name="Student Code" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newStudent.StudentCode"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Student Code"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{ errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <ValidationProvider rules="required" name="Student Name" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newStudent.StudentName"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Student Name"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{ errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
          <b-form-group>
            <el-select v-model="value" filterable placeholder="Class Name">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </b-form-group>
        </b-form>
      </b-modal>
    </ValidationObserver>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import TableAdmin from "@/components/admin-academy/TableAdmin";
export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableAdmin
  },
  data() {
    return {
      items: [
        {
          text: "Course",
          href: `${process.env.VUE_APP_API_BACKEND}/student/courses`
        },
        {
          text: "Course Detail",
          active: true
        }
      ],
      course: {
        courseCode: "",
        courseName: "",
        description: ""
      },
      options: [
        {
          value: "Option1",
          label: "Option1"
        },
        {
          value: "Option2",
          label: "Option2"
        },
        {
          value: "Option3",
          label: "Option3"
        },
        {
          value: "Option4",
          label: "Option4"
        },
        {
          value: "Option5",
          label: "Option5"
        }
      ],
      editStudent: {
        StudentID: "",
        StudentCode: "",
        StudentName: "",
        Class: ""
      },
      newStudent: {
        StudentCode: "",
        StudentName: "",
        Class: ""
      },
      fullscreenLoading: false,
      loadingData: false
    };
  },
  methods: {
    ...mapActions("adminAcademy", [
      "getCourse",
      "getStudentsOfCourse",
      "createStudent",
      "updateStudent",
      "deleteStudent"
    ]),
    detailStudent(row) {
      this.$router.push({ path: `students/${row.StudentID}/students` });
    },
    modalEdit(row) {
      this.editStudent.StudentID = row.StudentID;
      this.editStudent.StudentCode = row.StudentCode;
      this.editStudent.StudentName = row.StudentName;
      this.editStudent.Class = row.Class;

      this.$root.$emit("bv::show::modal", "modal-edit");
    },
    async handleCreate() {
      this.$refs["modal-create"].hide();
      this.fullscreenLoading = true;
      let response = await this.createStudent(this.newStudent);
      if (response) {
        await this.resetInfoModalCreate();
      }
      this.fullscreenLoading = false;
      await this.getStudentsOfCourse();
    },
    async handleUpdate() {
      this.$refs["modal-edit"].hide();
      this.fullscreenLoading = true;
      await this.updateStudent(this.editStudent);
      await this.resetInfoModalEdit();
      this.fullscreenLoading = false;
      await this.getStudentsOfCourse();
    },
    resetInfoModalEdit() {
      this.editStudent.StudentCode = "";
      this.editStudent.StudentName = "";
      this.editStudent.Class = "";
    },
    resetInfoModalCreate() {
      this.newStudent.StudentCode = "";
      this.newStudent.StudentName = "";
      this.newStudent.Class = "";
      requestAnimationFrame(() => {
        this.$refs.observer.reset();
      });
    },
    async delStudent(row) {
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonColor: "#28a745",
        confirmButtonText: "Yes, delete it!",
        reverseButtons: true
      }).then(async result => {
        if (result.value) {
          this.fullscreenLoading = true;
          await this.deleteStudent(row.StudentID);
          await this.getStudentsOfCourse();
          this.fullscreenLoading = false;

          this.$swal("Deleted!", "Your file has been deleted.", "success");
        }
      });
    },
    btnCreate(item, button) {
      this.$root.$emit("bv::show::modal", button);
    }
  },
  computed: {
    ...mapState("adminAcademy", ["listStudents", "listCourses"])
  },
  async created() {
    let course = await this.getCourse(this.$route.params.id);
    let students = await this.getStudentsOfCourse();

    if (course && students) {
      this.loadingData = false;
    }
  }
};
</script>
<style scoped>
.el-select {
  width: 100%;
}
.bannerTitle_1wzmt7u {
  font-family: "OpenSans-Bold", Arial, sans-serif;
  font-size: 34px;
  line-height: 46px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 24px;
  color: blue;
}
</style>
