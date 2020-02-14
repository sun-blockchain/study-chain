const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const checkJWT = require('./middlewares/check-jwt');

const app = express();

require('dotenv').config();

const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teacher');
const subjectRoutes = require('./routes/subject');
const certificateRoutes = require('./routes/certificate');
const studentRoutes = require('./routes/student');
const scoreRoutes = require('./routes/score');
const meRoutes = require('./routes/me');
const academyRoutes = require('./routes/academy');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

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

if (process.env.NODE_ENV !== 'test') {
  app.use(limiter);
}

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
app.use('/account/student', checkJWT, studentRoutes);
app.use('/account/teacher', checkJWT, teacherRoutes);
app.use('/subject', checkJWT, subjectRoutes);
app.use('/score', checkJWT, scoreRoutes);
app.use('/certificate', certificateRoutes);
app.use('/account/me', checkJWT, meRoutes);
app.use('/academy', checkJWT, academyRoutes);

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
