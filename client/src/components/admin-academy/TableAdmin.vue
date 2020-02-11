<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">{{title}}</h1>
      <p class="mb-4 mt-4"></p>
      <div class="card shadow mb-4">
        <div class="card-header py-3">
          <h6 class="m-0 font-weight-bold text-primary">
            <el-button
              v-if="btnCreate"
              type="success"
              icon="fas fa-plus"
              circle
              v-b-modal.modal-create
            ></el-button>
            <div v-else class="box-defaul-header"></div>
          </h6>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <el-table
              v-loading="loadingData"
              element-loading-text="Loading..."
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(255, 255, 255, 0.7)"
              :data="listPagination"
            >
              <el-table-column
                v-for="(attibute, index) in listProperties"
                :label="attibute.label"
                :prop="attibute.prop"
                :key="index"
              ></el-table-column>
              <el-table-column align="right">
                <template slot="header" slot-scope="scope">
                  <el-input
                    v-model="search"
                    size="mini"
                    placeholder=" search"
                    @input="searchHandle"
                  />
                </template>
                <template slot-scope="scope">
                  <el-tooltip v-if="btnDetail" class="item" content="Detail" placement="top">
                    <el-button
                      plain
                      icon="el-icon-info"
                      round
                      size="mini"
                      @click="callFunctionDetail(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip v-if="btnEdit" class="item" content="Edit" placement="top">
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      round
                      size="mini"
                      @click="callFunctionEdit(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip v-if="btnDelete" class="item" content="Delete" placement="top">
                    <el-button
                      size="mini"
                      type="danger"
                      icon="el-icon-delete"
                      round
                      @click="callFunctionDelete(scope.row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <b-row>
            <div class="col-12 my-1 mt-3 pr-2 pl-2">
              <el-pagination
                :class="`float-md-right`"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-sizes="pageOptions"
                :page-size="pageSize"
                layout="sizes, jumper, prev, pager, next"
                :total="total"
                small
              ></el-pagination>
            </div>
          </b-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { ValidationObserver, ValidationProvider } from "vee-validate";
export default {
  name: "common-view-admin",
  components: {
    ValidationObserver,
    ValidationProvider
  },
  props: {
    title: String,
    btnCreate: Boolean,
    listAll: Array,
    btnDetail: Boolean,
    nameFunctionDetail: String,
    btnEdit: Boolean,
    nameFunctionEdit: String,
    btnDelete: Boolean,
    nameFunctionDelete: String,
    loadingData: Boolean,
    listProperties: Array
  },
  data() {
    return {
      currentPage: 1,
      pageOptions: [10, 20, 50, 100],
      fullscreenLoading: false,
      pageSize: 10,
      search: "",
      listQuery: this.listAll,
      listPagination: [],
      total: this.listAll ? this.listAll.length : 0
    };
  },
  watch: {
    listAll: function() {
      this.searchHandle();
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val;
      this.setlistPagination();
    },
    handleCurrentChange(val) {
      this.currentPage = val ? val : 1;
      this.setlistPagination();
    },
    setlistPagination() {
      let startRecord = (this.currentPage - 1) * this.pageSize;
      let endRecord = startRecord + this.pageSize;
      this.listPagination = this.listQuery.filter(
        (data, index) => index >= startRecord && index <= endRecord
      );
    },
    searchHandle() {
      let statment = "!this.search";
      this.listProperties.forEach((attr, index) => {
        if (attr) {
          statment += ` || data.${attr.prop}.toLowerCase().includes(this.search.toLowerCase()) `;
        }
      });
      this.listQuery = eval(`this.listAll.filter(data => ${statment})`);
      this.setlistPagination();
    },
    callFunctionEdit(row) {
      this.$emit(this.nameFunctionEdit, row);
    },
    callFunctionDetail(row) {
      this.$emit(this.nameFunctionDetail, row);
    },
    callFunctionDelete(row) {
      this.$emit(this.nameFunctionDelete, row);
    }
  }
};
</script>
