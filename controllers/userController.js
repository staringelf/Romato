const mongoose = require('mongoose');
const User = mongoose.model('User');
const { body, validationResult } = require('express-validator');
const { promisify } = require('es6-promisify');
const passport = require('passport');
const fs = require('fs');
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');



//utilty helper
const helper = {
  redirectToSignin (res, flashes, body) {
    res.render('signin', { title: 'Sign In', flashes, body });
  },
  redirectToEditAccount (res, flashes, body) {
    res.render('editAccount', {title: 'Edit Account', flashes, body })
  },
  redirect (res, flashes, body, url) {
    switch(url) {
      case '/user/edit':
      case '/user/change':
        this.redirectToEditAccount(res, flashes, body);
        break;
      case '/signup':
        this.redirectToSignin(res, flashes, body);
        break;
    }
  },
  multerOpts: {
    storage: multer.memoryStorage(),
    fileFilter: function (req, file, next) {
      const fileIsImage = file.mimetype.startsWith('image/');
      if (fileIsImage) {
        next(null, true);
      } else {
        next(new Error('Multer: That file type isn\'t allowed'));
      }
    }
  },
};

//Validation Rules 
exports.validationRules = {
  signup () {
    return [
      body('name', 'You must supply a name!').trim().not().isEmpty(),
      body('email', 'Invalid email').trim().isEmail().normalizeEmail({
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        remove_extension: false
      }),
      body('password').not().isEmpty(),
      body('password-confirm').not().isEmpty(),
      body('password-confirm').custom( (value, { req }) => {
        if (value != req.body.password) {
          throw new Error('Oops! Your Passwords do not match!');
        }
        //Marks the success of this synchronous custom validator
        return true;  
      })
    ];
  },

  editAccount () {
    return [
      body('name', 'You must supply a name!').trim().not().isEmpty(),
      body('email', 'Invalid email').trim().isEmail().normalizeEmail({
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        remove_extension: false
      }),
      body('bio', 'Bio can\'t be empty').trim().not().isEmpty()
    ];  
  },
  
  changePassword () {
    return [
      body('password-current').not().isEmpty(),
      body('password-new').not().isEmpty(),
      body('password-confirm').not().isEmpty(),
      body('password-confirm').custom( (value, { req }) => {
        if (value != req.body['password-new']) {
          throw new Error('Oops! Your Passwords do not match!');
        }
        return true;
      })
    ];
  }
};

exports.signinForm = (req, res) => {
  res.render('signin', { title: 'Sign In' });
};

exports.dashboard = (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
};

exports.editAccount = (req, res) => {
  res.render('editAccount', { title: 'Edit Account' });
};

exports.resetForm = (req, res) => {
  res.render('resetForm', { title: 'Reset Password' });
};

exports.getReviews = async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }).populate('reviews').exec();
  res.render('reviews', { title: 'Your Reviews', reviews: user.reviews });
};


//Sign up
exports.signup = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify(User.register.bind(User));
  await register(user, req.body.password);
  next();
};

exports.updateAccount = async (req, res, next) => {
  req.body.photo = req.body.photo || req.user.photo;
  const { name, email, bio, photo } = req.body;
  const updates = { name, email, bio, photo };
  //Querying and updating the user
  /*const user = await User.findOneAndUpdate(
    { _id : req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );*/
  
  const alreadyExists = (updates.email !== req.user.email) && await User.findOne({ email: updates.email }).exec();
  if(alreadyExists) {
    req.flash('error', 'That email has already been registered');
    res.redirect('/user/edit-profile');    
    return;
  }
 
  const user = await User.findOne({ _id: req.user._id }).exec();
  const keys = (Object.keys(updates));
  keys.forEach(key => user[key] = updates[key]);
  
  await user.save();
  await req.login(user);  
  req.flash('success', 'Your account is up to date');
  res.redirect('/user/edit-profile');
};

exports.updatePassword = async (req, res, next) => {
  const user = req.user;
  user.changePassword(req.body['password-current'], req.body['password-new'])
    .then(user => {
      req.flash('success', `Successfully updated your password ${user.name} 💃`);
      res.redirect('/user/edit-profile');
    })
    .catch(err => {
      req.flash('error', 'Sorry, Your Password is incorrect');
      res.redirect('/user/edit-profile');
    });
};

exports.upload = multer(helper.multerOpts).single('photo');

exports.resize = async (req, res, next) => {
  if(!req.file){
    return next();
  }  
  //naming
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuidv4()}.${extension}`;
  //resizing
  const image = await Jimp.read(req.file.buffer);
  await image.resize(500, Jimp.AUTO);
  await image.writeAsync(`public/uploads/users/${req.body.photo}`);
  next();
};

 
//Validating 
exports.handleValidationErrors = (req, res, next) => {
  const { errors } = validationResult(req);
  if(errors.length){
      req.flash('error', errors.map(error => error.msg));
      helper.redirect(res, req.flash(), req.body, req.url);
      return;
    }
  next();
};
