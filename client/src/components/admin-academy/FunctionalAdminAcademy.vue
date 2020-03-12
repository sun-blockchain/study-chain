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
        Courses
      </router-link>
    </li>
    <li class="nav-item">
      <router-link class="nav-link color-black" to="/academy/subjects">
        <i class="color-999 fas fa-layer-group"></i>
        Subjects
      </router-link>
    </li>
    <li class="nav-item">
      <router-link class="nav-link color-black" to="/academy/teachers">
        <i class="color-999 fas fa-chalkboard-teacher"></i>
        Teacher
      </router-link>
    </li>
    <li class="nav-item">
      <router-link class="nav-link color-black" to="/academy/students">
        <i class="color-999 fas fa-user-graduate"></i>
        Student
      </router-link>
    </li>
    <!-- <li class="nav-item">
      <router-link class="nav-link color-black" to="/academy/certificates">
        <i class="color-999 fas fa-award"></i>
        Certificates
      </router-link>
    </li> -->
  </ul>
</template>

<script>
export default {
  name: 'functionalAdminAcademy'
};
</script>
