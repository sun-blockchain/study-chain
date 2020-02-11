<template>
  <div>
    <table-admin
      :title="`Subjects Manager`"
      :btnCreate="true"
      :listAll="listSubjects"
      :loadingData="loadingData"
      :btnDetail="true"
      :nameFunctionDetail="`detailSubject`"
      :btnEdit="true"
      :nameFunctionEdit="`modalEdit`"
      :btnDelete="true"
      :listProperties="[{prop:'SubjectID', label:'SubjectID' },{prop:'Name', label:'Name' } ]"
      @detailSubject="detailSubject($event)"
      @modalEdit="modalEdit($event)"
    ></table-admin>

    <ValidationObserver ref="observer" v-slot="{ passes }">
      <b-modal
        id="modal-edit"
        ref="modal-edit"
        ok-title="Update"
        @ok.prevent="passes(handleUpdate)"
        title="Cập Nhật Môn Học"
      >
        <b-form>
          <ValidationProvider rules="required" name="Subject Name" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editSubject.Name"
                :state="errors[0] ? false : (valid ? true : null)"
                placeholder="Subject Name"
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
        title="Tạo Mới Môn Học"
        @ok.prevent="passes(handleCreate)"
        @cancel="resetInfoModalCreate"
        v-loading.fullscreen.lock="fullscreenLoading"
      >
        <b-form>
          <ValidationProvider rules="required" name="Subject Name" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newSubject.Name"
                :state="errors[0] ? false : (valid ? true : null)"
                placeholder="Subject Name"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{ errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
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
      editSubject: {
        Name: ""
      },
      newSubject: {
        Name: ""
      },
      fullscreenLoading: false,
      loadingData: true
    };
  },
  methods: {
    ...mapActions("adminAcademy", [
      "getAllSubjects",
      "createSubject",
      "updateSubject",
      "deleteSubject"
    ]),
    detailSubject(row) {
      this.$router.push({ path: `subjects/${row.SubjectID}/students` });
    },
    modalEdit(row) {
      console.log(row);
      this.editSubject.Name = item.Name;
      this.$root.$emit("bv::show::modal", this.infoModal.id, button);
    },
    async handleCreate() {
      this.fullscreenLoading = true;
      let response = await this.createSubject(this.newSubject);
      if (response) {
        this.$refs["modal-create"].hide();
        await this.resetInfoModalCreate();
      }
      this.fullscreenLoading = false;
    },
    async handleUpdate() {
      this.$refs["modal-edit"].hide();
      await this.updateSubject(this.editSubject);
      await this.resetInfoModalEdit();
    },
    resetInfoModalEdit() {
      this.editSubject.Name = "";
    },
    resetInfoModalCreate() {
      this.newSubject.Name = "";
      requestAnimationFrame(() => {
        this.$refs.observer.reset();
      });
    },
    delSubject(subject) {
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonColor: "#28a745",
        confirmButtonText: "Yes, delete it!",
        reverseButtons: true
      }).then(result => {
        if (result.value) {
          this.deleteSubject(subject);
          this.$swal("Deleted!", "Your file has been deleted.", "success");
        }
      });
    },
    btnCreate(item, button) {
      this.$root.$emit("bv::show::modal", button);
    }
  },
  computed: {
    ...mapState("adminAcademy", ["listSubjects"])
  },
  async created() {
    let response = await this.getAllSubjects();
    if (response) {
      this.loadingData = false;
    }
  }
};
</script>
