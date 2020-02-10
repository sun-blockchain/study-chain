<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">Quản Lý Giáo Viên</h1>
      <div class="card shadow mb-4">
        <div class="card-header py-3">
          <button class="btn btn-success" @click="btnCreate" v-b-modal.modal-create>
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <b-table
              show-empty
              stacked="md"
              :items="listTeachers ? listTeachers : []"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
            >
              <template slot="Fullname" slot-scope="row">{{ row.item.Fullname }}</template>

              <template slot="Username" slot-scope="row">{{ row.item.Username }}</template>
              <template slot="more">...</template>

              <template slot="delete" slot-scope="row">
                <div class="row justify-content-center">
                  <b-button
                    variant="info"
                    class="mr-1 btn-circle btn-sm"
                    :to="`teachers/${row.item.Username}/subjects`"
                    :id="`popover-class-${row.item.Username}`"
                  >
                    <b-popover
                      :target="`popover-class-${row.item.Username}`"
                      triggers="hover"
                      placement="top"
                    >Môn Học</b-popover>
                    <i class="fas fa-layer-group"></i>
                  </b-button>
                  <b-button
                    @click="info(row.item, row.index, $event.target)"
                    class="mr-1 float-right btn-circle btn-sm"
                    variant="info"
                    :id="`popover-info-${row.item.Username}`"
                  >
                    <b-popover
                      :target="`popover-info-${row.item.Username}`"
                      triggers="hover"
                      placement="top"
                    >Chi Tiết</b-popover>
                    <i class="fas fa-info-circle"></i>
                  </b-button>
                  <b-button
                    variant="danger"
                    @click="deleteSubject(row.item)"
                    class="float-left btn-circle btn-sm"
                    :id="`popover-del-${row.item.Username}`"
                  >
                    <b-popover
                      :target="`popover-del-${row.item.Username}`"
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
                :total-rows="listTeachers ? listTeachers.length : 0"
                :per-page="perPage"
                v-model="currentPage"
                class="my-0"
              />
            </b-col>
          </b-row>
        </div>
      </div>
    </div>

    <b-modal
      :id="infoModal.id"
      :total="infoModal.total"
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
              <h5>{{teacher.Fullname}}</h5>
            </div>
          </div>
        </b-form-group>
        <b-form-group id="input-group-2" label-for="input-2">
          <div class="row">
            <div class="col-4">
              <h6>Username:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{teacher.Username}}</h5>
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
      >
        <b-form>
          <div v-if="alert.message" :class="`text-center alert ${alert.type}`">{{alert.message}}</div>
          <ValidationProvider rules="required" name="Teacher Username" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="text"
                v-model="newTeacher.Username"
                :state="errors[0] ? false : (valid ? true : null)"
                placeholder="Username"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{ errors[0] }}</b-form-invalid-feedback>
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
                :state="errors[0] ? false : (valid ? true : null)"
                placeholder="Fullname"
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
      teacher: {
        Fullname: "",
        Username: ""
      },
      newTeacher: {
        Fullname: "",
        Username: ""
      },
      infoModal: {
        id: "info-modal",
        total: ""
      },
      fields: [
        {
          key: "Fullname",
          label: "Fullname",
          class: "text-center",
          sortable: true
        },
        {
          key: "Username",
          label: "Username",
          class: "text-center",
          sortable: true
        },
        {
          key: "more",
          label: "...",
          class: "text-center",
          sortable: true
        },
        {
          key: "delete",
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
  computed: {
    ...mapState("adminAcademy", ["listTeachers"]),
    ...mapState({
      alert: state => state.alert
    })
  },
  methods: {
    ...mapActions("adminAcademy", [
      "getAllTeachers",
      "deleteTeacher",
      "createTeacher"
    ]),
    info(item, index, button) {
      this.teacher.Fullname = item.Fullname;
      this.teacher.Username = item.Username;
      this.$root.$emit("bv::show::modal", this.infoModal.id, button);
    },
    async handleCreate(bvModalEvt) {
      await this.createTeacher(this.newTeacher);
      if (this.alert.type != "alert-danger") {
        this.$refs["modal-create"].hide();
        await this.resetInfoModalCreate();
      }
    },
    resetInfoModalCreate() {
      this.newTeacher.Username = "";
      this.newTeacher.Fullname = "";
      requestAnimationFrame(() => {
        this.$refs.observer.reset();
      });
    },
    resetInfoModalDetail() {
      this.teacher.Fullname = "";
      this.teacher.teacher = "";
    },
    deleteSubject(teacher) {
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
          this.deleteTeacher(teacher);
          this.$swal("Deleted!", "Your file has been deleted.", "success");
        }
      });
    },
    btnCreate(item, button) {
      this.$root.$emit("bv::show::modal", button);
    }
  },
  created() {
    this.getAllTeachers();
  }
};
</script>
