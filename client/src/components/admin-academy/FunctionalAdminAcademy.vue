<template>
  <ul class="nav flex-column">
    <li class="nav-item">
      <router-link class="nav-link color-black" to="/academy">
        <i class="color-999 fas fa-home"></i>
        Dashboard
      </router-link>
    </li>
    <li class="nav-item">
      <router-link class="nav-link color-black" to="/academy/courses">
        <i class="color-999 fas fa-book-open"></i>
        Khóa học
      </router-link>
    </li>
    <li class="nav-item">
      <router-link class="nav-link color-black" to="/academy/subjects">
        <i class="color-999 fas fa-layer-group"></i>
        Môn Học
      </router-link>
    </li>
    <li class="nav-item">
      <router-link class="nav-link color-black" to="/academy/teachers">
        <i class="color-999 fas fa-chalkboard-teacher"></i>
        Giáo Viên
      </router-link>
    </li>
    <li class="nav-item">
      <router-link class="nav-link color-black" to="/academy/students">
        <i class="color-999 fas fa-user-graduate"></i>
        Học Viên
      </router-link>
    </li>
    <li class="nav-item">
      <router-link class="nav-link color-black" to="/academy/certificates">
        <i class="color-999 fas fa-award"></i>
        Chứng Chỉ
      </router-link>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'functionalAdminAcademy'
};
</script>
