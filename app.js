require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');

//Nous avons besoin d'express session & connect-mongo pour créer une session pour le user récemment créé
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

mongoose
  .connect('mongodb://localhost/uber-for-laundry', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error('Error connecting to mongo', err);
  });

const indexRouter = require('./routes/index');
//On le met en dessous de indexRouter car on veut que indexRouter soit accessible même si on n'est pas encore log
const authRouter = require('./routes/auth')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware Setup

app.use(logger('dev'));
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Configuration de la session et ajout en tant que middleware:
app.use(session({
  secret: 'Never do your own laundry again',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 //Combien de temps dure le cookir (1 jour)
  })
}));
//Pour vérifier l'état de l'initialisation de la session, ce middleware nous permettra de personnaliser la homepage plus facilement dans views/index.hbs
app.use((req, res, next) => {
  if (req.session.currentUser) {
    //La información del usuario de la sesión (solo disponible si ha iniciado sesión).
    res.locals.currentUserInfo = req.session.currentUser;
    //Un booleano que indica si hay un usuario conectado o no.
    res.locals.isUserLoggedIn = true;
  } else {
    res.locals.isUserLoggedIn = false;
  }

  next();
})

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use('/', indexRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;