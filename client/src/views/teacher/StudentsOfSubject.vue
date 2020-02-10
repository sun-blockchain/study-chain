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
                      v-if="!row.item.ScoreValue"
                      @click="setScore(row.item, row.index, $event.target)"
                      class="text-center btn-circle btn-sm float-left"
                      variant="warning"
                      :id="`popover-edit-${row.item.Username}`"
                    >
                      <b-popover
                        :target="`popover-edit-${row.item.Username}`"
                        triggers="hover"
                        placement="top"
                      >Cho Điểm</b-popover>
                      <i class="fas fa-edit"></i>
                    </b-button>
                  </div>
                </div>
              </template>
            </b-table>
          </div>

          <b-row>
            <b-col md="6" class="my-1">
              <b-pagination
                :total-rows="studentsOfSubject ? studentsOfSubject.length : 0"
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
        id="modal-setScore"
        ref="modal-setScore"
        title="Cho Điểm Học Viên"
        @ok.prevent="passes(handleScore)"
        @cancel="resetInfoModalSetPoint"
      >
        <b-form>
          <ValidationProvider rules="required|min_value:1" name="Score" v-slot="{ valid, errors }">
            <b-form-group>
              <b-form-input
                type="number"
                v-model="newScore.score"
                :state="errors[0] ? false : (valid ? true : null)"
                placeholder="Score"
              ></b-form-input>
              <b-form-invalid-feedback id="inputLiveFeedback">{{ errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </ValidationProvider>
        </b-form>
      </b-modal>
    </ValidationObserver>

    <b-modal
      :id="infoModal.id"
      :total="infoModal.total"
      @hide="resetInfoModalDetail"
      title="Thông tin sinh viên"
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
              <h5>{{student.Fullname}}</h5>
            </div>
          </div>
        </b-form-group>
        <b-form-group id="input-group-2" label-for="input-2">
          <div class="row">
            <div class="col-4">
              <h6>Username:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{student.Username}}</h5>
            </div>
          </div>
        </b-form-group>
      </b-form>
    </b-modal>
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
      student: {
        Fullname: "",
        Username: ""
      },
      newScore: {
        subjectId: null,
        username: "",
        score: null
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
    ...mapState("teacher", ["studentsOfSubject"])
  },
  methods: {
    ...mapActions("teacher", ["getStudentsOfSubject", "setScoreForStudent"]),
    info(item, index, button) {
      this.student.Fullname = item.Fullname;
      this.student.Username = item.Username;
      this.$root.$emit("bv::show::modal", this.infoModal.id, button);
    },
    setScore(item, index, button) {
      this.newScore.subjectId = this.$route.params.id;
      this.newScore.username = item.Username;
      this.$root.$emit("bv::show::modal", "modal-setScore", button);
    },
    handleScore() {
      this.$refs["modal-setScore"].hide();
      this.setScoreForStudent(this.newScore);
      this.resetInfoModalSetPoint();
    },
    resetInfoModalDetail() {
      this.student.Fullname = "";
      this.student.Username = "";
    },
    resetInfoModalSetPoint() {
      this.newScore.score = null;
      this.newScore.username = "";
      this.newScore.subjectId = null;
      requestAnimationFrame(() => {
        this.$refs.observer.reset();
      });
    }
  },
  created() {
    this.getStudentsOfSubject(this.$route.params.id);
  }
};
</script>
