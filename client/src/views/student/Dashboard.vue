<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">Danh Sách Môn Học Hiện Có</h1>
      <p class="mb-4 mt-4"></p>
      <div class="card shadow mb-4">
        <div class="card-header py-3">
          <h6 class="m-0 font-weight-bold text-primary"></h6>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <b-table
              show-empty
              stacked="md"
              :items="listSubjects ? listSubjects : []"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
            >
              <template slot="SubjectID" slot-scope="row">{{ row.item.SubjectID }}</template>

              <template slot="Name" slot-scope="row">{{ row.item.Name }}</template>

              <template slot="delete" slot-scope="row">
                <div class="row justify-content-center">
                  <b-button
                    variant="primary"
                    @click="handleRegisterSubject(row.item)"
                    class="float-left btn-circle btn-sm"
                    :id="`popover-confirm-${row.item.SubjectID}`"
                    v-if="!row.item.statusConfirm || row.item.statusConfirm === STATUS_REGISTERED.UNREGISTERED"
                  >
                    <b-popover
                      :target="`popover-confirm-${row.item.SubjectID}`"
                      triggers="hover"
                      placement="top"
                    >Đăng ký</b-popover>
                    <i class="fas fa-check-circle"></i>
                  </b-button>
                  <b-button
                    variant="info"
                    v-if="row.item.statusConfirm !== STATUS_REGISTERED.UNREGISTERED"
                    disabled="disabled"
                    class="btn-confirm-certificate"
                  >Registered</b-button>
                </div>
              </template>
            </b-table>
          </div>

          <b-row>
            <b-col md="6" class="my-1">
              <b-pagination
                :total-rows="listSubjects ? listSubjects.length : 0 "
                :per-page="perPage"
                v-model="currentPage"
                class="my-0"
              />
            </b-col>
          </b-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { STATUS_REGISTERED } from "../../_helpers/constants";
export default {
  data() {
    return {
      STATUS_REGISTERED: STATUS_REGISTERED,
      form: {
        Name: ""
      },
      newSubject: {
        Name: ""
      },
      infoModal: {
        SubjectID: "info-modal"
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
    ...mapState("student", ["listSubjects"]),
    ...mapState({
      user: state => state.account
    })
  },
  methods: {
    ...mapActions("student", ["getAllSubjects", "registerSubject"]),
    handleRegisterSubject(subject) {
      this.$swal({
        title: "Are you sure?",
        text: "After registration will wait list!",
        type: "success",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonColor: "#28a745",
        confirmButtonText: "Yes, Register Subject!",
        reverseButtons: true
      }).then(result => {
        if (result.value) {
          this.registerSubject(subject.SubjectID);
          this.$swal(
            "Confirmed!",
            "The course has been registered.",
            "success"
          );
        }
      });
    }
  },
  created() {
    this.getAllSubjects(this.user.user.username);
  }
};
</script>
