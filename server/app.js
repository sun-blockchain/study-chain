const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');
const checkJWT = require('./middlewares/check-jwt');

const app = express();

require('dotenv').config();

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const certificateRoutes = require('./routes/certificates');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const courseRoutes = require('./routes/courses');
const classRoutes = require('./routes/classes');
const meRoutes = require('./routes/me');

// Connect database
mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (error) => {
    if (error) console.log(error);
  }
);
mongoose.set('useCreateIndex', true);

app.use(express.json({ limit: '5mb' }));

// security
app.use(helmet());

// show log
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// set up cors to allow us to accept requests from our client
app.use(
  cors({
    origin: '*', // allow to server to accept request from different origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true // allow session cookie from browser to pass through
  })
);

// Set up routes
app.use('/auth', authRoutes);
app.use('/students', checkJWT, studentRoutes);
app.use('/teachers', checkJWT, teacherRoutes);
app.use('/subjects', checkJWT, subjectRoutes);
app.use('/certificates', certificateRoutes);
app.use('/courses', checkJWT, courseRoutes);
app.use('/classes', checkJWT, classRoutes);
app.use('/me', checkJWT, meRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
