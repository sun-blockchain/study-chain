<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">Các Môn Học Của Giáo Viên</h1>
      <p class="mb-4 mt-4"></p>
      <div class="card shadow mb-4">
        <div class="card-header py-3">
          <h6 class="m-0 font-weight-bold text-primary">
            <button class="btn btn-success" @click="createSubject" v-b-modal.modal-create>
              <i class="fas fa-plus"></i>
            </button>
          </h6>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <b-table
              show-empty
              stacked="md"
              :items="subjectsOfTeacher ? subjectsOfTeacher : []"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
            >
              <template slot="SubjectID" slot-scope="row">{{ row.item.SubjectID }}</template>

              <template slot="Name" slot-scope="row">{{ row.item.Name }}</template>

              <template slot="actions" slot-scope="row">
                <div class="row justify-content-center">
                  <b-button
                    variant="danger"
                    @click="deleteSubject(row.item)"
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
                :total-rows="subjectsOfTeacher ? subjectsOfTeacher.length : 0"
                :per-page="perPage"
                v-model="currentPage"
                class="my-0"
              />
            </b-col>
          </b-row>
        </div>
      </div>
    </div>

    <b-modal id="modal-create" title="Thêm Môn Học" ok-title="Thêm" @ok="handleAddSubject" ok-only>
      <b-form-select class="mb-3" v-model="newSubjectId">
        <template v-slot:first>
          <option :value="null" disabled>-- Chọn môn học --</option>
        </template>
        <option
          v-for="subject in subjectsNoTeacher"
          :value="subject.SubjectID"
          :key="subject.SubjectID"
        >{{subject.Name}}</option>
      </b-form-select>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      newSubjectId: null,
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
  computed: {
    ...mapState("adminAcademy", ["subjectsOfTeacher", "subjectsNoTeacher"])
  },
  methods: {
    ...mapActions("adminAcademy", [
      "getSubjectsOfTeacher",
      "deleteSubjectOfTeacher",
      "addSubjectOfTeacher"
    ]),
    handleAddSubject() {
      let username = this.$route.params.id;
      let newSubjectId = this.newSubjectId;
      console.log(username, newSubjectId);
      this.addSubjectOfTeacher({ username, subjectId: newSubjectId });
      this.newSubjectId = null;
    },
    deleteSubject(subjectId) {
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
          const Username = this.$route.params.id;
          this.deleteSubjectOfTeacher({
            Username: Username,
            subjectId: subjectId.SubjectID
          });
          this.$swal("Deleted!", "Your file has been deleted.", "success");
        }
      });
    },
    createSubject(item, button) {
      this.$root.$emit("bv::show::modal", button);
    }
  },
  created() {
    this.getSubjectsOfTeacher(this.$route.params.id);
  }
};
</script>
