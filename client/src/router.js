import Vue from 'vue';
import Router from 'vue-router';
import AuthLayout from '@/layout/AuthLayout';
import HomePage from '@/layout/HomePage';
import AcademyLayout from '@/layout/AcademyLayout';
Vue.use(Router);

export const router = new Router({
  linkExactActiveClass: 'active',
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: 'home',
      name: 'home',
      component: HomePage,
      children: [
        {
          path: '/home',
          name: 'homepage',
          component: () => import('./views/HomePage.vue')
        },
        {
          path: '/cert/:id',
          name: 'cert',
          component: () => import('./views/CertPage.vue')
        },
        {
          path: '/404',
          name: '404',
          component: () => import('./views/404.vue')
        },
        {
          path: '/403',
          name: '403',
          component: () => import('./views/403.vue')
        }
      ],
      meta: {
        guest: true
      }
    },
    {
      path: '/',
      redirect: 'academy',
      name: 'academy',
      component: AcademyLayout,
      children: [
        {
          path: '/academy',
          name: 'academyPage',
          component: () => import('./views/admin-academy/Academy.vue')
        },
        {
          path: '/academy/courses',
          name: 'academy-courses',
          component: () => import('./views/admin-academy/CoursesManager.vue')
        },
        {
          path: '/academy/courses/:id/course-detail',
          name: 'academy-courses-detail',
          component: () => import('./views/admin-academy/CoursesDetail.vue')
        },
        {
          path: '/academy/subjects',
          name: 'academy-subjects',
          component: () => import('./views/admin-academy/SubjectsManager')
        },
        {
          path: '/academy/subjects/:id',
          name: 'academy-subject-detail',
          component: () => import('./views/admin-academy/SubjectDetail')
        },
        {
          path: '/academy/subjects/:id/class/:classId',
          name: 'academy-subject-class',
          component: () => import('./views/admin-academy/ClassSubject')
        },
        {
          path: '/academy/subjects/:id/students',
          name: 'academy-subject-student',
          component: () => import('./views/admin-academy/SubjectStudents')
        },
        {
          path: '/profile',
          name: 'academy-profile',
          component: () => import('./views/ProfilePage')
        },
        {
          path: '/academy/teachers',
          name: 'academy-teachers',
          component: () => import('./views/admin-academy/TeacherManager')
        },
        {
          path: '/academy/teachers/:id/subjects',
          name: 'academy-teacher-subject',
          component: () => import('./views/admin-academy/ClassessOfTeacher')
        },
        {
          path: '/academy/students',
          name: 'academy-student',
          component: () => import('./views/admin-academy/StudentsManager')
        },
        {
          path: '/academy/student/:id',
          name: 'student-detail',
          component: () => import('./views/admin-academy/StudentDetail')
        },
        {
          path: '/academy/students/:id/subjects',
          name: 'academy-student-subjects',
          component: () => import('./views/admin-academy/StudentSubjects')
        },
        {
          path: '/academy/certificates',
          name: 'academy-certificates',
          component: () => import('./views/admin-academy/CertificatesManager')
        },
        {
          path: '/academy/certificates/:id/students',
          name: 'academy-certificates-students',
          component: () => import('./views/admin-academy/CertificatesStudents')
        }
      ],
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/',
      redirect: 'student',
      name: 'student',
      component: AcademyLayout,
      children: [
        {
          path: '/student',
          name: 'studentPage',
          component: () => import('./views/student/Dashboard.vue')
        },
        {
          path: '/student/courses',
          name: 'coursesPage',
          component: () => import('./views/student/Courses.vue')
        },
        {
          path: '/student/courses/:id',
          name: 'student-courses-detail',
          component: () => import('./views/student/CourseDetail.vue')
        },
        {
          path: '/student/courses/:id/subject/:subjectId',
          name: 'student-subject-detail',
          component: () => import('./views/student/SubjectDetail')
        },
        {
          path: '/myCourses',
          name: 'courses-of-student',
          component: () => import('./views/student/MyCourses')
        },
        {
          path: '/myCourses/:id',
          name: 'courses-of-student',
          component: () => import('./views/student/MyCourseDetail.vue')
        },
        {
          path: '/myCourses/:id/subject/:subjectId',
          name: 'subject-of-student',
          component: () => import('./views/student/MySubjectDetail.vue')
        },
        {
          path: '/myClasses',
          name: 'classes-of-student',
          component: () => import('./views/student/MyClasses')
        },
        {
          path: '/student/mycertificates',
          name: 'student-mycertificates',
          component: () => import('./views/student/MyCertificates')
        }
      ]
    },
    {
      path: '/',
      redirect: 'teacher',
      name: 'teacher',
      component: AcademyLayout,
      children: [
        {
          path: '/teacher',
          name: 'teacherPage',
          component: () => import('./views/teacher/Dashboard.vue')
        },
        {
          path: '/teacher/:id/students',
          name: 'teacher-subject-students',
          component: () => import('./views/teacher/StudentsOfSubject.vue')
        }
      ]
    },
    {
      path: '/',
      redirect: 'login',
      component: AuthLayout,
      children: [
        {
          path: '/login',
          name: 'login',
          component: () => import('./views/Login.vue')
        },
        {
          path: '/register',
          name: 'register',
          component: () => import('./views/Register.vue')
        }
      ],
      meta: {
        guest: true
      }
    },
    { path: '*', redirect: '/404' }
  ]
});
router.beforeEach((to, from, next) => {
  let user = JSON.parse(localStorage.getItem('user'));
  const publicPages = ['/login', '/register', '/home', '/404', '/403'];
  const afterloginPages = ['/login', '/register', '/home'];
  const authRequired = publicPages.includes(to.path);
  const afterlogin = afterloginPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  if (to.path.match(/\/cert\//)) {
    return next();
  } else if (!authRequired && !loggedIn) {
    return next('/login');
  } else if (!authRequired && loggedIn) {
    if (!to.matched[1]) {
      return next();
    }
    if (to.matched[1].parent.name === 'academy' && user.role === 1) {
      return next();
    }
    if (to.matched[1].parent.name === 'teacher' && user.role === 2) {
      return next();
    }
    if (to.matched[1].parent.name === 'student' && user.role === 4) {
      return next();
    }
    if (to.fullPath === '/profile' && user.role) {
      return next();
    }
    return next('/403');
  } else if (afterlogin && loggedIn) {
    if (user.role === 1) {
      return next('/academy');
    }
    if (user.role === 2) {
      return next('/teacher');
    }
    if (user.role === 4) {
      return next('/student');
    }
    next();
  }
  next();
});
