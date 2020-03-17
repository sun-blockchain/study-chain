<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">{{ title }}</h1>
      <p class="mb-4 mt-4"></p>
      <div class="card shadow mb-4 border-radius-15px">
        <div class="card-header py-3">
          <h6 class="m-0 font-weight-bold text-primary">
            <slot name="btn-create"></slot>
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
              @row-click="callFunctionDetail"
            >
              <el-table-column
                sortable
                v-for="(attibute, index) in listProperties"
                :label="attibute.label"
                :prop="attibute.prop"
                :key="index"
              ></el-table-column>
              <el-table-column v-if="date" sortable label="Start Date">
                <template slot-scope="scope">
                  <span>{{ convertDate(scope.row.StartDate) }}</span>
                </template>
              </el-table-column>
              <el-table-column v-if="date" sortable label="End Date">
                <template slot-scope="scope">
                  <span>{{ convertDate(scope.row.EndDate) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="statusCol"
                sortable
                label="Status"
                :filters="filter"
                :filter-method="filterTag"
                filter-placement="bottom-end"
              >
                <template slot-scope="scope">
                  <el-tag
                    align="center"
                    size="medium"
                    :type="scope.row.Status === 'Open' ? 'success' : 'danger'"
                    >{{ scope.row.Status }}</el-tag
                  >
                </template>
              </el-table-column>
              <el-table-column align="center">
                <template slot="header">
                  <el-input
                    v-model="search"
                    size="mini"
                    placeholder=" search"
                    @input="searchHandle"
                  />
                </template>
                <template slot-scope="scope">
                  <el-tooltip v-if="btnInfo" class="item" content="Information" placement="top">
                    <el-button
                      icon="fa fa-info"
                      type="info"
                      round
                      size="mini"
                      @click.stop="callFunctionInfo(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip v-if="btnEdit" class="item" content="Edit" placement="top">
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      round
                      size="mini"
                      @click.stop="callFunctionEdit(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip
                    v-if="btnChangeStatus"
                    class="item"
                    :content="scope.row.Status == 'Open' ? 'Close' : 'Open'"
                    placement="top"
                  >
                    <el-button
                      :type="scope.row.Status == 'Open' ? 'danger' : 'success'"
                      :icon="scope.row.Status == 'Open' ? 'el-icon-open' : 'el-icon-turn-off'"
                      round
                      size="mini"
                      @click.stop="callFunctionChangeStatus(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip v-if="btnDelete" class="item" content="Delete" placement="top">
                    <el-button
                      size="mini"
                      type="danger"
                      icon="el-icon-delete"
                      round
                      @click.stop="callFunctionDelete(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip
                    v-if="btnConfirm && scope.row.statusCertificate === STATUS_CERT.NO_CERT"
                    class="item"
                    content="Confirm"
                    placement="top"
                  >
                    <el-button
                      size="mini"
                      type="success"
                      icon="el-icon-check"
                      round
                      @click="callFunctionConfirm(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip
                    v-if="btnCert && scope.row.statusCertificate === STATUS_CERT.CERTIFICATED"
                    class="item"
                    content="Certificated"
                    placement="top"
                  >
                    <el-button
                      type="primary"
                      size="mini"
                      icon="fas fa-graduation-cap"
                      round
                      @click.stop="callFunctionCert(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip
                    v-if="btnRemove && scope.row.Status !== 'InProgress'"
                    class="item"
                    content="Unassign"
                    placement="top"
                  >
                    <el-button
                      type="danger"
                      size="mini"
                      icon="el-icon-circle-close"
                      round
                      @click.stop="callFunctionRemove(scope.row)"
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
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { STATUS_CERT } from '../../_helpers/constants';
import { Button, Table, TableColumn, Pagination, Input, Tooltip, Tag } from 'element-ui';
export default {
  name: 'common-view-admin',
  components: {
    ValidationObserver,
    ValidationProvider,
    'el-button': Button,
    'el-table': Table,
    'el-table-column': TableColumn,
    'el-pagination': Pagination,
    'el-input': Input,
    'el-tooltip': Tooltip,
    'el-tag': Tag
  },
  props: {
    title: String,
    btnCreate: Boolean,
    listAll: Array,
    btnInfo: Boolean,
    nameFunctionDetail: String,
    nameFunctionInfo: String,
    btnEdit: Boolean,
    nameFunctionEdit: String,
    btnDelete: Boolean,
    nameFunctionDelete: String,
    btnConfirm: Boolean,
    nameFunctionConfirm: String,
    btnCert: Boolean,
    nameFunctionCert: String,
    loadingData: Boolean,
    listProperties: Array,
    statusCol: Boolean,
    btnRemove: Boolean,
    nameFunctionRemove: String,
    filter: Array,
    date: Boolean,
    btnChangeStatus: Boolean,
    nameFunctionChangeStatus: String
  },
  data() {
    return {
      STATUS_CERT: STATUS_CERT,
      currentPage: 1,
      pageOptions: [10, 20, 50, 100],
      fullscreenLoading: false,
      pageSize: 10,
      search: '',
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
      let statment = '!this.search';
      this.listProperties.forEach((attr, index) => {
        if (attr) {
          statment += ` || data.${attr.prop}.toLowerCase().includes(this.search.toLowerCase()) `;
        }
      });
      this.listQuery = this.listAll ? eval(`this.listAll.filter(data => ${statment})`) : [];
      this.setlistPagination();
    },
    callFunctionEdit(row) {
      this.$emit(this.nameFunctionEdit, row);
    },
    callFunctionDetail(row) {
      this.$emit(this.nameFunctionDetail, row);
    },
    callFunctionInfo(row) {
      this.$emit(this.nameFunctionInfo, row);
    },
    callFunctionDelete(row) {
      this.$emit(this.nameFunctionDelete, row);
    },
    callFunctionConfirm(row) {
      this.$emit(this.nameFunctionConfirm, row);
    },
    callFunctionCert(row) {
      this.$emit(this.nameFunctionCert, row);
    },
    callFunctionRemove(row) {
      this.$emit(this.nameFunctionRemove, row);
    },
    callFunctionChangeStatus(row) {
      this.$emit(this.nameFunctionChangeStatus, row);
    },
    filterTag(value, row) {
      return row.Status === value;
    },
    convertDate(timestamp) {
      let date = new Date(parseInt(timestamp));
      return date.toLocaleDateString();
    }
  }
};
</script>
