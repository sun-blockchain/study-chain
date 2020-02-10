<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">Quản Lý Môn Học</h1>
      <p class="mb-4 mt-4"></p>
      <div class="card shadow mb-4">
        <div class="card-header py-3">
          <h6 class="m-0 font-weight-bold text-primary">
            <button class="btn btn-success" @click="btnCreate" v-b-modal.modal-create>
              <i class="fas fa-plus"></i>
            </button>
          </h6>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <b-table
              show-empty
              stacked="md"
              :items="listSubjects"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
            >
              <template slot="SubjectID" slot-scope="row">{{ row.item.SubjectID }}</template>

              <template slot="Name" slot-scope="row">{{ row.item.Name }}</template>

              <template slot="actions" slot-scope="row">
                <div class="row justify-content-center">
                  <b-button
                    variant="info"
                    class="mr-1 btn-circle btn-sm"
                    :to="`subjects/${row.item.SubjectID}/students`"
                    :id="`popover-info-${row.item.SubjectID}`"
                  >
                    <b-popover
                      :target="`popover-info-${row.item.SubjectID}`"
                      triggers="hover"
                      placement="top"
                    >Chi Tiết</b-popover>
                    <i class="fas fa-info-circle"></i>
                  </b-button>
                  <b-button
                    @click="info(row.item, row.index, $event.target)"
                    class="text-center btn-circle btn-sm"
                    variant="warning"
                    :id="`popover-edit-${row.item.SubjectID}`"
                  >
                    <b-popover
                      :target="`popover-edit-${row.item.SubjectID}`"
                      triggers="hover"
                      placement="top"
                    >Chỉnh sửa</b-popover>
                    <i class="fas fa-edit"></i>
                  </b-button>
                  <b-button
                    variant="danger"
                    @click="delSubject(row.item)"
                    class="ml-1 btn-circle btn-sm"
                    :id="`popover-del-${row.item.SubjectID}`"
                  >
                    <b-popover
                      :target="`popover-del-${row.item.SubjectID}`"
                      triggers="hover"
                      placement="top"
                    >Xóa</b-popover>
                    <i class="fas fa-trash-alt"></i>
                  </b-button>
                </div>
              </template>
            </b-table>
          </div>

          <b-row>
            <b-col md="6" class="my-1">
              <b-pagination
                :total-rows="listSubjects ? listSubjects.length: 0"
                :per-page="perPage"
                v-model="currentPage"
                class="my-0"
              />
            </b-col>
          </b-row>
        </div>
      </div>
    </div>

    <ValidationObserver ref="observer" v-slot="{ passes }">
      <b-modal
        :id="infoModal.id"
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
export default {
  components: {
    ValidationObserver,
    ValidationProvider
  },
  data() {
    return {
      editSubject: {
        Name: ""
      },
      newSubject: {
        Name: ""
      },
      infoModal: {
        id: "info-modal"
      },
      fields: [
        {
          key: "SubjectID",
          label: "SubjectID",
          class: "text-center",
          sortable: true
        },
        {
          key: "Name",
          label: "Name Subject",
          class: "text-center",
          sortable: true
        },
        {
          key: "actions",
          label: "Actions",
          class: "text-center",
          sortable: true
        }
      ],
      currentPage: 1,
      perPage: 12,
      pageOptions: [12, 24, 36]
    };
  },
  methods: {
    ...mapActions("adminAcademy", [
      "getAllSubjects",
      "createSubject",
      "updateSubject",
      "deleteSubject"
    ]),
    info(item, index, button) {
      this.editSubject.Name = item.Name;
      this.$root.$emit("bv::show::modal", this.infoModal.id, button);
    },
    async handleCreate(bvModalEvt) {
      this.$refs["modal-create"].hide();
      await this.createSubject(this.newSubject);
      await this.resetInfoModalCreate();
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
  created() {
    this.getAllSubjects();
  }
};
</script>
