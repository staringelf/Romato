const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.authenticate = passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: 'Invalid Email or Password',
  successRedirect: '/',
  successFlash: 'You are now logged in! 🏄'
});


exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out! 👋');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); 
  }
  req.flash('error',  'You must be logged in to do that!');
  res.redirect('/signin');
};

exports.isLoggedOut = (req, res, next) => {
  if (req.isUnauthenticated()) {
    return next(); 
  }
  req.flash('error',  'Don\'t know but sometimes people just wanna login twice! ');
  res.redirect('back');
};

exports.forgotPassword = async (req, res) => {
  //Check for Email
  const user = await User.findOne({ email: req.body['email-forgot']});
  if(!user){
    req.flash('error', 'That email has not been registered');
    return res.redirect('/signin');
  }
  
  //Setting up the reset token
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save()
  
  //Sending the email
  //req.flash('success', `Password reset link has been sent to your email <a href="/user/forgot/${user.resetPasswordToken}"> Link </a>`);
  const resetPasswordLink = `${req.headers.host}/user/forgot/${user.resetPasswordToken}`;
  
  await mail.send({
    user,
    filename: 'password-reset',
    subject: 'Password reset',
    resetPasswordLink
  });
 req.flash('success', `You have been emailed a password reset link!`);
  
  //Redirecting to login page
  res.redirect('/signin');
};

exports.resetForm = async (req, res) => {
  const user = await User.findOne({ 
    resetPasswordToken: req.params.token, 
    resetPasswordExpires: { $gt: Date.now() }
  }).exec();
  if (!user){
    req.flash('error', 'Password reset is invalid or has expired!');
    return res.redirect('/login');
  }
  res.render('reset', { title: 'Reset your password' });
};

exports.updatePassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if(!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/signin');
  }
  
  //Pasport-local-mongoose
  await user.setPassword(req.body['password-new']);
  
  //Flushing the reset token and updating
  user.resetPasswordToken = user.resetPasswordExpires = undefined;
  await user.save();
  
  //Logging in
  await req.login(user);
  req.flash('success', ' Your password has been reset! You are now logged in!');
  res.redirect('/');
};

exports.matchPasswords = (req, res, next) => {
  //If passwords match
  if(req.body['password-new'] === req.body['password-confirm'])
    return next(); //keep going
  req.flash('error', 'Oops your passwords do not match');
  res.redirect('back');
};


