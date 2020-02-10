<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">Danh Sách Môn Học Đang Dạy</h1>
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
                    variant="info"
                    class="mr-1 btn-circle btn-sm"
                    :to="`teacher/${row.item.SubjectID}/students`"
                    :id="`popover-info-${row.item.SubjectID}`"
                  >
                    <b-popover
                      :target="`popover-info-${row.item.SubjectID}`"
                      triggers="hover"
                      placement="top"
                    >Chi Tiết</b-popover>
                    <i class="fas fa-info-circle"></i>
                  </b-button>
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
export default {
  data() {
    return {
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
    ...mapState("teacher", ["listSubjects"])
  },
  methods: {
    ...mapActions("teacher", ["getAllSubjects"])
  },
  created() {
    this.getAllSubjects();
  }
};
</script>
