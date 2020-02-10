<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">Danh Sách Chứng Chỉ</h1>
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
              :items="myCertificates ? myCertificates : []"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
            >
              <template slot="SubjectID" slot-scope="row">{{ row.item.SubjectID }}</template>

              <template slot="Name" slot-scope="row">{{ row.item.Name }}</template>

              <template slot="status" slot-scope="row">
                <div class="row justify-content-center">
                  <b-button
                    variant="success"
                    class="btn-confirm-certificate"
                    :to="`/cert/${row.item.CertificateID}`"
                  >Certificated</b-button>
                </div>
              </template>
            </b-table>
          </div>

          <b-row>
            <b-col md="6" class="my-1">
              <b-pagination
                :total-rows="myCertificates ? myCertificates.length : 0 "
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
          key: "status",
          label: "Status",
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
    ...mapState("student", ["myCertificates"])
  },
  methods: {
    ...mapActions("student", ["getMyCertificates"])
  },
  created() {
    this.getMyCertificates();
  }
};
</script>
