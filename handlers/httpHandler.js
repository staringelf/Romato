exports.redirectToHttps = (req, res, next) => {
  if(req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
};