//I handle async errors
exports.catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  }
};

//I handle routes that app could not find and pass them to next errorHandler
exports.notFound = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};


//MongoDB Validation Error Handler
exports.flashValidationErrors = (err, req, res, next) => {
  if(!err.errors){
    return next(err);
  } 
  // validation error looks like
  const keys = Object.keys(err.errors);
  keys.forEach(key => req.flash('error', err.errors[key].message));
  res.redirect('back');
};


//Cool highlighted errors
exports.developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || '';
  const errorInfo = {
    message: err.message,
    status: err.status,
    betterStack: err.stack.replace(/[a-z_-\d]+.js:\d+/gi, '<mark>$&</mark>')
  };
  res.status(err.status || 500);
  res.format({
    //Based on the 'Accept' http header
    'text/html': () => {
      res.render('error', errorInfo);
    },//Form Submit, Reload the page
    'application/json': () => {
      res.json(errorInfo);
    }
  })
};

//Produuction Error Handler
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
};

