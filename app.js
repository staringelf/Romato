const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const passport = require('passport')
const flash = require('connect-flash');
const { promisify } = require('es6-promisify');
const helpers = require('./helpers');
const routes = require('./routes/index');
const errorHandlers = require('./handlers/errorHandlers');
const httpHandler = require('./handlers/httpHandler');

//Strategy
require('./handlers/passport');

const app = express();

if(app.get('env') === 'production'){
  // Enable Trust Proxy
  app.enable('trust proxy');

  // Disable the x-Powered-By Header
  app.disable('x-powered-by');
  
  // Custom middleware for redirecting to HTTPS
  app.use(httpHandler.redirectToHttps);
}


//the template engine  
app.set('view engine', 'pug');

app.use(express.static('public'));

//Parsing incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Parse HTTP request cookies for Passport
app.use(cookieParser());

//session
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

//Configuring Passport
app.use(passport.initialize());
app.use(passport.session());

//Flash Middleware
app.use(flash());

//Local Variables
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  next();
});

//Promisifying callback based login
app.use((req, res, next) => {
  req.login = promisify(req.login.bind(req));
  next();
});

//Handling the routes
app.use('/', routes);

//If routes don't work, we 404 them and forward to errorHandler
app.use(errorHandlers.notFound);

//Flashing Errors
app.use(errorHandlers.flashValidationErrors);

//Errors for development
if(app.get('env') === 'development') {
    app.use(errorHandlers.developmentErrors);
};

//Errors for production
app.use(errorHandlers.productionErrors);

module.exports = app;