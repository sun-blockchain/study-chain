<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">Admin Academy</h1>
      <div class="card shadow mb-4">
        <div class="card-header py-3">
          <h6 class="m-0 font-weight-bold text-primary">
            <el-button type="success" icon="fas fa-plus" v-b-modal.modal-create></el-button>
          </h6>
        </div>

        <div class="card-body">
          <el-table
            :data="tableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
            stripe
          >
            <el-table-column prop="id" sortable label="ID"></el-table-column>
            <el-table-column prop="name" sortable label="Name"></el-table-column>
            <el-table-column prop="description" label="Description"></el-table-column>
            <el-table-column>
              <template slot="header" slot-scope="scope">
                <el-input v-model="search" size="mini" placeholder="search" @input="searchName" />
              </template>
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="handleEdit(scope.$index, scope.row)"
                ></el-button>

                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="handleDelete(scope.$index, scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="block">
          <el-pagination
            :class="`float-md-right`"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="pageOptions"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableData.length"
          ></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        {
          id: 1,
          name: "Blockchain",
          description: "Blockchain course by Sun-blockchain"
        },
        {
          id: 2,
          name: "Ethereum",
          description: "Blockchain course by Sun-blockchain"
        },
        {
          id: 3,
          name: "Bitcoin",
          description: "Blockchain course by Sun-blockchain"
        }
      ],
      search: "",
      currentPage: 1,
      pageOptions: [2, 20, 50, 100],
      pageSize: 10
    };
  },
  methods: {
    handleSizeChange(val) {
      console.log(`${val} items per page`);
    },
    handleCurrentChange(val) {
      console.log(`current page: ${val}`);
    }
  }
};
</script>

<style>
.el-table th,
.el-table td {
  text-align: center;
}
</style>
