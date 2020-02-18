<template>
  <div>
    <table-admin
      :title="`List Of Teachers Subjects`"
      :listAll="subjectsOfTeacher"
      :loadingData="loadingData"
      :btnDelete="true"
      :nameFunctionDelete="`delSubject`"
      :listProperties="[
        { prop: 'SubjectID', label: 'SubjectID' },
        { prop: 'Name', label: 'Name Subject' }
      ]"
      @delSubject="delSubject($event)"
    >
      <template v-slot:btn-create>
        <el-button
          type="success"
          icon="fas fa-plus"
          size="medium"
          round
          v-b-modal.modal-create
        ></el-button>
        <!-- <div class="box-defaul-header"></div> -->
      </template>
    </table-admin>

    <b-modal id="modal-create" title="Thêm Môn Học" ok-title="Thêm" @ok="handleAddSubject" ok-only>
      <b-form-select class="mb-3" v-model="newSubjectId">
        <template v-slot:first>
          <option :value="null" disabled>-- Chọn môn học --</option>
        </template>
        <option
          v-for="subject in subjectsNoTeacher"
          :value="subject.SubjectID"
          :key="subject.SubjectID"
          >{{ subject.Name }}</option
        >
      </b-form-select>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import TableAdmin from '@/components/admin-academy/TableAdmin';
import { Button } from 'element-ui';
export default {
  components: {
    TableAdmin,
    'el-button': Button
  },
  data() {
    return {
      newSubjectId: null,
      fields: [
        {
          key: 'SubjectID',
          label: 'SubjectID',
          class: 'text-center',
          sortable: true
        },
        {
          key: 'Name',
          label: 'Name Subject',
          class: 'text-center',
          sortable: true
        },
        {
          key: 'actions',
          label: 'Actions',
          class: 'text-center',
          sortable: true
        }
      ],
      currentPage: 1,
      perPage: 12,
      pageOptions: [12, 24, 36],
      loadingData: true
    };
  },
  computed: {
    ...mapState('adminAcademy', ['subjectsOfTeacher', 'subjectsNoTeacher'])
  },
  methods: {
    ...mapActions('adminAcademy', [
      'getSubjectsOfTeacher',
      'deleteSubjectOfTeacher',
      'addSubjectOfTeacher'
    ]),
    handleAddSubject() {
      let username = this.$route.params.id;
      let newSubjectId = this.newSubjectId;
      console.log(username, newSubjectId);
      this.addSubjectOfTeacher({ username, subjectId: newSubjectId });
      this.newSubjectId = null;
    },
    delSubject(subject) {
      this.$swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Yes, delete it!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          const Username = this.$route.params.id;
          this.deleteSubjectOfTeacher({
            Username: Username,
            subjectId: subject.SubjectID
          });
          this.$swal('Deleted!', 'Your file has been deleted.', 'success');
        }
      });
    },
    addSubject(item, button) {
      this.$root.$emit('bv::show::modal', button);
    }
  },
  async created() {
    await this.getSubjectsOfTeacher(this.$route.params.id);
    this.loadingData = false;
  }
};
</script>
