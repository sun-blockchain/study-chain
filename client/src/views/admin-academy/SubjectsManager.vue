<template>
  <div>
    <table-admin
      :title="`Subjects Manager`"
      :listAll="listSubjects"
      :loadingData="loadingData"
      :btnDetail="true"
      :nameFunctionDetail="`detailSubject`"
      :btnEdit="true"
      :nameFunctionEdit="`modalEdit`"
      :btnDelete="true"
      :nameFunctionDelete="`delSubject`"
      :listProperties="[
        { prop: 'SubjectID', label: 'SubjectID' },
        { prop: 'Name', label: 'Name Subject' }
      ]"
      @delSubject="delSubject($event)"
      @detailSubject="detailSubject($event)"
      @modalEdit="modalEdit($event)"
    >
      <template v-slot:btn-create>
        <el-button
          type="success"
          icon="fas fa-plus"
          size="medium"
          round
          @click="dialogFormVisible = true"
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
        title="Cập Nhật Môn Học"
      >
        <b-form>
          <ValidationProvider rules="required" name="Subject Name" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="editSubject.Name"
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Subject Name"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{ errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
        </b-form>
      </b-modal>
    </ValidationObserver>

    <!-- <ValidationObserver ref="observer" v-slot="{ passes }">
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
                :state="errors[0] ? false : valid ? true : null"
                placeholder="Subject Name"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{ errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
        </b-form>
      </b-modal>
    </ValidationObserver>-->

    <el-dialog title="Create Subject" :visible.sync="dialogFormVisible" class="modal-with-create">
      <el-form :model="newSubject" :rules="ruleNewSubject" ref="newSubject">
        <el-form-item prop="subjectName">
          <el-input v-model="newSubject.subjectName" autocomplete="off" placeholder="Subject Name"></el-input>
        </el-form-item>
        <el-form-item prop="subjectCode">
          <el-input v-model="newSubject.subjectCode" autocomplete="off" placeholder="Subject Code"></el-input>
        </el-form-item>
        <el-form-item prop="shortDescription">
          <el-input
            v-model="newSubject.shortDescription"
            autocomplete="off"
            placeholder="Subject Short Description"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
        <el-form-item prop="description">
          <el-input
            v-model="newSubject.description"
            autocomplete="off"
            placeholder="Subject Description"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetInfoModalCreate('newSubject')">Cancel</el-button>
        <el-button type="primary" @click="handleCreate('newSubject')">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import TableAdmin from "@/components/admin-academy/TableAdmin";
import { Dialog, Form, FormItem, Input, Button } from "element-ui";
export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableAdmin,
    "el-dialog": Dialog,
    "el-form": Form,
    "el-form-item": FormItem,
    "el-input": Input,
    "el-button": Button
  },
  data() {
    return {
      editSubject: {
        Name: ""
      },
      newSubject: {
        subjectName: "",
        subjectCode: "",
        shortDescription: "",
        description: ""
      },
      ruleNewSubject: {
        subjectName: [
          {
            required: true,
            message: "subject name is required",
            trigger: "blur"
          }
        ],
        subjectCode: [
          {
            required: true,
            message: "subject code is required",
            trigger: "blur"
          }
        ],
        shortDescription: [
          {
            required: true,
            message: "short description is required",
            trigger: "blur"
          }
        ],
        description: [
          {
            required: true,
            message: "description is required",
            trigger: "blur"
          }
        ]
      },
      fullscreenLoading: false,
      loadingData: true,
      dialogFormVisible: false
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
      this.$router.push({ path: `subjects/${row.SubjectID}/classes` });
    },
    modalEdit(row) {
      this.editSubject.Name = row.Name;
      this.$root.$emit("bv::show::modal", "modal-edit");
    },
    async handleCreate(formName) {
      let self = this;
      this.$refs[formName].validate(async valid => {
        if (valid) {
          console.log(valid);

          // this.fullscreenLoading = true;
          // let response = await this.createSubject(this.newSubject);
          // if (response) {
          //   this.dialogFormVisible = false;
          //   await this.resetInfoModalCreate();
          // }
          // this.fullscreenLoading = false;
        }
      });
    },
    async handleUpdate() {
      this.$refs["modal-edit"].hide();
      await this.updateSubject(this.editSubject);
      await this.resetInfoModalEdit();
    },
    resetInfoModalEdit() {
      this.editSubject.Name = "";
    },
    resetInfoModalCreate(formName) {
      this.newSubject.subjectName = "";
      this.$refs[formName].resetFields();
      this.dialogFormVisible = false;
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
    await this.getAllSubjects();
    this.loadingData = false;
  }
};
</script>
