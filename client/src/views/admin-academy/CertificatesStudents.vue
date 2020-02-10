<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">Danh Sách Học Viên Của Môn Học</h1>
      <div class="card shadow mb-4">
        <div class="card-header py-3"></div>
        <div class="card-body">
          <div class="table-responsive">
            <b-table
              show-empty
              stacked="md"
              :items="studentsOfSubject ? studentsOfSubject : []"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
            >
              <template slot="Fullname" slot-scope="row">{{ row.item.Fullname }}</template>

              <template slot="Username" slot-scope="row">{{ row.item.Username }}</template>
              <template slot="score" slot-scope="row">{{ row.item.ScoreValue }}</template>

              <template slot="delete" slot-scope="row">
                <div class="row justify-content-center">
                  <div class="col-4 padding-0">
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
                  </div>
                  <div class="col-4 padding-0">
                    <b-button
                      v-if="row.item.statusCertificate == STATUS_CERT.NO_CERT"
                      variant="success"
                      @click="handleConfirm(row.item)"
                      class="float-left btn-circle btn-sm"
                      :id="`popover-confirm-${row.item.Username}`"
                    >
                      <b-popover
                        :target="`popover-confirm-${row.item.Username}`"
                        triggers="hover"
                        placement="top"
                      >Xác nhận</b-popover>
                      <i class="fas fa-check-circle"></i>
                    </b-button>
                    <b-button
                      variant="primary"
                      v-if="row.item.statusCertificate == STATUS_CERT.CERTIFICATED"
                      class="btn-confirm-certificate"
                      :to="`/cert/${row.item.certificateId}`"
                    >Certificated</b-button>
                  </div>
                </div>
              </template>
            </b-table>
          </div>

          <b-row>
            <b-col md="6" class="my-1">
              <b-pagination
                :total-rows="studentsOfSubject ?  studentsOfSubject.length : 0"
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
      title="Chi Tiết Sinh Viên"
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
              <h5>{{ student.Fullname }}</h5>
            </div>
          </div>
        </b-form-group>
        <b-form-group id="input-group-2" label-for="input-2">
          <div class="row">
            <div class="col-4">
              <h6>Username:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{ student.Username }}</h5>
            </div>
          </div>
        </b-form-group>
        <b-form-group id="input-group-2" label-for="input-2">
          <div class="row">
            <div class="col-4">
              <h6>Score:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{ student.ScoreValue }}</h5>
            </div>
          </div>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { STATUS_CERT } from "../../_helpers/constants";
export default {
  data() {
    return {
      STATUS_CERT: STATUS_CERT,
      student: {
        Username: "",
        Fullname: "",
        ScoreValue: 0
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
          key: "score",
          label: "Score",
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
    ...mapState("adminAcademy", ["studentsOfSubject"])
  },
  methods: {
    ...mapActions("adminAcademy", [
      "getCertificatesOfSubject",
      "confirmCertificate"
    ]),
    info(item, index, button) {
      this.student.Fullname = item.Fullname;
      this.student.Username = item.Username;
      this.student.ScoreValue = item.ScoreValue;
      this.$root.$emit("bv::show::modal", this.infoModal.id, button);
    },
    resetInfoModalDetail() {
      this.student.name = "";
    },
    handleConfirm(student) {
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonColor: "#28a745",
        confirmButtonText: "Yes, Confirm The Certificate!",
        reverseButtons: true
      }).then(result => {
        if (result.value) {
          this.confirmCertificate({
            studentUsername: student.Username,
            subjectId: this.$route.params.id
          });
          this.$swal(
            "Confirmed!",
            "The certificate has been confirmed .",
            "success"
          );
        }
      });
    }
  },
  created() {
    this.getCertificatesOfSubject(this.$route.params.id);
  }
};
</script>
