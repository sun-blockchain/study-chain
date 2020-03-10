<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mt-5 mb-2 text-gray-800">{{ title }}</h1>
      <p class="mb-4 mt-4"></p>
      <div class="card shadow mb-4 border-radius-15px">
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
              <el-table-column
                v-if="statusCol"
                sortable
                label="Status"
                :filters="[
                  { text: 'Open', value: 'Open' },
                  { text: 'In Progress', value: 'InProgress' }
                ]"
                :filter-method="filterTag"
                filter-placement="bottom-end"
              >
                <template slot-scope="scope">
                  <el-tag
                    align="center"
                    size="medium"
                    :type="scope.row.Status === 'Open' ? 'success' : 'primary'"
                    >{{ scope.row.Status }}</el-tag
                  >
                </template>
              </el-table-column>
              <el-table-column
                v-if="Progressing"
                sortable
                label="Progressing"
                :filters="[
                  { text: 'Completed', value: 'Completed' },
                  { text: 'Learning', value: 'Learning' }
                ]"
                :filter-method="filterProgress"
                filter-placement="bottom-end"
              >
                <template slot-scope="scope">
                  <el-tag
                    align="center"
                    size="medium"
                    :type="scope.row.Progressing === 'Completed' ? 'success' : 'primary'"
                    >{{ scope.row.Progressing }}</el-tag
                  >
                </template>
              </el-table-column>
              <el-table-column align="center">
                <template slot="header" slot-scope="scope">
                  <el-input
                    v-model="search"
                    size="mini"
                    placeholder=" search"
                    @input="searchHandle"
                  />
                </template>
                <template slot-scope="scope">
                  <el-tooltip
                    v-if="btnRegister && !registeredId"
                    class="item"
                    content="Register"
                    placement="top"
                  >
                    <el-button
                      icon="fa fa-registered"
                      type="primary"
                      round
                      size="mini"
                      @click.stop="callFunctionRegister(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip v-if="btnGetCert" class="item" content="GetCert" placement="top">
                    <el-button
                      icon="el-icon-postcard"
                      type="primary"
                      round
                      size="mini"
                      @click.stop="callFunctionGetCert(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip
                    v-if="
                      (btnCancel && registeredId && scope.row[attrId] === registeredId) ||
                        (btnCancel && !btnRegister)
                    "
                    class="item"
                    content="Cancel Register"
                    placement="top"
                  >
                    <el-button
                      icon="el-icon-circle-close"
                      type="danger"
                      round
                      size="mini"
                      @click.stop="callFunctionCancelRegistered(scope.row)"
                    >
                    </el-button>
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
import { STATUS_REGISTERED } from '../../_helpers/constants';
import { Button, Table, TableColumn, Pagination, Input, Tooltip, Tag } from 'element-ui';
export default {
  name: 'common-view-student',
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
    listAll: Array,
    btnGetCert: Boolean,
    btnRegister: Boolean,
    btnCancel: Boolean,
    nameFunctionDetail: String,
    nameFunctionGetCert: String,
    nameFunctionRegister: String,
    nameFunctionCancelRegistered: String,
    loadingData: Boolean,
    listProperties: Array,
    registeredId: String,
    attrId: String,
    statusCol: Boolean,
    Progressing: Boolean
  },
  data() {
    return {
      STATUS_REGISTERED: STATUS_REGISTERED,
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
    callFunctionDetail(row) {
      if (row.score) {
        if (row.score < 1) {
          this.$emit(this.nameFunctionDetail, row);
        }
      } else {
        this.$emit(this.nameFunctionDetail, row);
      }
    },
    callFunctionGetCert(row) {
      this.$emit(this.nameFunctionGetCert, row);
    },
    callFunctionRegister(row) {
      this.$emit(this.nameFunctionRegister, row);
    },
    callFunctionCancelRegistered(row) {
      this.$emit(this.nameFunctionCancelRegistered, row);
    },
    filterTag(value, row) {
      return row.Status === value;
    },
    filterProgress(value, row) {
      return row.Progressing === value;
    }
  }
};
</script>
