const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const Review = mongoose.model('Review');
const fs = require('fs');
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

//a utility object to help the exports
const helper = {
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
  
  confirmOwner(req, res, store, user) {
    //console.log('Checking Access')
    if(!store.author.equals(user._id)){
      throw Error('Forbidden Waters! You must own a store in order to edit it!');
    }
  },
  
  trim(arr) {
    return arr.map(a => a.trim());
  },
  
  filterEmptiness (arr) {
     return arr.filter(a => a);
  },
}

//Validation rules
exports.validationRules = {
  store () {
    return [
      body('name', 'You must supply a name!').trim().not().isEmpty(),
      body('description', 'Invalid email').trim(),
      body('location[address]').trim().not().isEmpty(),
      body('location[coordinates][0]').not().isEmpty(),
      body('location[coordinates][1]').not().isEmpty(),
      body('dishes').trim(),
      body('highlights').trim(),
      body('contact', 'Please provide contact info!').trim().isMobilePhone(),
      body('timings[0]', 'You must provide an opening time').not().isEmpty(),
      body('timings[1]', 'You must provide a closing time').not().isEmpty(),
    ];
  },
};

//Handling Validation Errors
exports.handleValidationErrors = (req, res, next) => {
  const { errors } = validationResult(req);
  if(errors.length){
      req.flash('error', errors.map(error => error.msg));
      const title = req.url === '/add/' ? 'Add Store' : 'Edit Store';
      res.render('editStore', { title, flashes: req.flash()});
      return;
    }
  next();
};

//The Home Page
exports.homePage = (req, res) => {
  
  const quickSearches = ['Pizza and Pasta', 'Sweet Tooth', 'Burgers', 'Health Is Wealth'];
  
  const collections = [
    { name: 'Top Rated', slug: 'collection/top' }, 
    { name: 'Newly Opened', slug: 'collection/new' },
    { name: 'Popular', slug: 'collection/popular' },
    { name: 'All Restaurants', slug: 'stores/page/1' }
  ]
  res.render('index', { title: 'Welcome!', quickSearches, collections });
};

//Quick Searches
exports.quickSearch = async (req, res) => {
  const stores = await Store.quickSearch(req.query.q);
  res.render('stores', { title: req.query.q , stores });
};

exports.quickSearchByLocation = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const stores = await Store.find({
    location: {
      $near:{
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000
      }
    }
  }).limit(16);
  res.render('stores', { title: 'Near You', stores, showRatings: false });
};

//Get All Stores
exports.getStores = async (req, res) => {
  const page = req.params.page;
  const limit = 12; //results per page
  const skip = limit * (page - 1); //skip specified results
  const storesPromise = Store
    .getStores()
    .sort({ name: 1 }) //sort by name
    .skip(skip)
    .limit(limit);
  const countPromise = Store.countDocuments();
  const [stores, count] = await Promise.all([storesPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  res.render('stores', { title: 'All Restaurants', stores, page, pages, count });
};

//Render collections
exports.collection = async (req, res) => {
  const stores = await Store.find();
  res.render('collection', { title: req.params.name, stores });
};

//Render a store page
exports.getStore = async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('reviews').exec();
  //return res.json(store.reviews);
  const [rating] = await Review.getRatingsInfo(store._id);
  res.render('store', { title: store.name, store, rating });  
  
  //Aggregation didn't quite work out, check getStore in store.js 
  //const store = await Store.getStore(req.params.slug);
  //store.populate('author').exec();
  //return res.json(store);
  //res.render('store', { title: store.name , store});
};

//Render stores linked to user
exports.getStoresByUser = async (req, res) => {
  const stores = await Store.getStoresByUser( { _id: req.user._id } );
  res.render('stores', { title: 'Your Stores', stores });
};

//Return user bookmarked stores
exports.getBookmarkedStores = async (req, res) => {
  //const stores = await Store.find({
    //_id: { $in: req.user.bookmarks }
  //});
  const stores = await Store.getBookmarkedStores( { bookmarks: req.user.bookmarks })
  res.render('stores', { title: 'Your Bookmarks', stores });
};

//Return recently viewed stores 
exports.getRecentStores = async (req, res) => {
  const stores = await Store.getRecentStores({ recents: req.user.recents });
  res.render('stores', { title: 'Recent Stores', stores });  
};

//render popular stores based on view count
exports.getPopularStores = async (req, res) => {
  const stores = await Store.getPopularStores().limit(12);
  res.render('stores', { title: 'Popular', stores })
};

//REST API
exports.searchStores = async (req, res) => {
  const stores = await Store
  //find related stores
  .find({
    $text: {
      $search: req.query.q,
    }
  }, 
  //aiding the sort
  {
    score: { $meta: 'textScore' } 
  })
  //sort
  .sort({
    score: { $meta: 'textScore' }
  })
  //limit
  .limit(5);
  res.json(stores);
};

//REST API
exports.searchStoresByLocation = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const stores = await Store.find({
    location: {
      $near:{
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 100000
      }
    }
  });
  res.json(stores);
};

//Add store page
exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

//Edit Store Page
exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id }).exec();
  helper.confirmOwner(req, res, store, req.user);
  res.render('editStore', { title: `Edit ${store.name}`, store } );
};

//Photo upload using multer
exports.upload = multer(helper.multerOpts).single('photo');

//Resizing the photo
exports.resize = async (req, res, next) => {
  if(!req.file){
    return next();
  }  
  //naming
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuidv4()}.${extension}`;
  //resizing
  const image = await Jimp.read(req.file.buffer);
  await image.resize(800, Jimp.AUTO);
  await image.writeAsync(`public/uploads/stores/${req.body.photo}`);
  next();
};

//formats store data entered by user to match database schema
exports.formatStoreData = (req, res, next) => {
  const timings = req.body.timings
  if(req.body.dishes){
    const dishes = req.body.dishes.split(',');
    const formattedDishes = helper.filterEmptiness(helper.trim(dishes));
    req.body.dishes = formattedDishes.join(', ');
  }
  if(req.body.highlights){
    const highlights = req.body.highlights.split(',');
    const formattedHighlights = helper.filterEmptiness(helper.trim(highlights));
    req.body.highlights = formattedHighlights.join(', ');
  }
  if(timings){
    const regex = new RegExp(`^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$`);
    const validTime = timings.map(time => time.match(regex))
                      .filter(bool => bool);
    if( validTime.length < timings.length ){
      req.flash('error', 'Invalid Time Format!');
      return res.render('editStore', { title: 'Store Form', flashes: req.flash(), store: req.body });
    }
  }
  next();
};

//creates a new store
exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = new Store(req.body);
  await store.save();
  //This is working, store here is automatically updated somehow on calling store.save
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review ?`);
  res.redirect(`/store/${store.slug}`);
};

//updates a store
exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';
  const store = await Store.findOne({ _id: req.params.id }).exec();
  const keys = Object.keys(req.body);
  keys.forEach(key => store[key] = req.body[key]);
  await store.save();
  req.flash('success', `Successfully Updated ${store.name}. <a href="/store/${store.slug}">View Store</a>`);
  res.redirect(`/user/store/${store.id}/edit`);
};

//bookmark store (REST API)
exports.bookmarkStore = async (req, res) => {
  const bookmarks = req.user.bookmarks.map(obj => obj.toString());
  const operation = bookmarks.includes(req.params.id) ? '$pull': '$addToSet';
  const user = await User
  .findByIdAndUpdate( req.user._id,
    { [operation]: { bookmarks: req.params.id } },
    { new: true }
  ).exec();
  res.json(user);
};

//register store views and update user's recent
exports.registerViews = async (req, res) => {
  const limit = -10;
  let userPromise;
  
  if(req.user){
    userPromise =  User
    //query
    .findByIdAndUpdate( req.user._id, 
      //push in the recents, meanwhile limiting the size of array
      { $push: { recents: { $each: [req.params.id], $slice: limit } } },
      //return the new one
      { new: true }
    ).exec();
  } else{
    userPromise = Promise.resolve('success');
  }
  
  const storePromise =  Store
  //query for store 
  .findByIdAndUpdate( req.params.id,
    //increment views of store
    { $inc: { views: 1 } },
    //return the new one
    { new: true }
  ).exec();
  const [user, store] = await Promise.all([userPromise, storePromise]);
  res.json({ success: 'View Registered' });
};

//updating views and recents together some other place 
/*exports.updateViews = async (req, res) => {
  console.log(req.params.id);
  console.log('It works');
  const store = await Store.findByIdAndUpdate( req.params.id,
    { $inc: { views: 1 } }, 
    { new: true }
  ).exec();
  
  res.json(store);
}
*/

//return top rated stores based on average rating count
exports.getTopStores = async (req, res) => {
  const stores = await Store.findTopStores();
  res.render('collection', { title: 'Top', stores });
};

//filter stores by date by the specified limit
exports.getNewStores = async (req, res) => {
  const limit = 3;
  const limiter = new Date();
  limiter.setDate(limiter.getDate() - limit);
  const stores = await Store.find({ created: { $gt: limiter } }).sort({ 'created': -1 });
  res.render('collection', { title: 'Newly Opened', stores, showRatings: false });
};