const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

const express = require('express');
const router = express.Router();

//User
router.get('/signin', 
  authController.isLoggedOut,
  userController.signinForm
);

router.get('/user/dashboard', 
  authController.isLoggedIn,
  userController.dashboard
);

router.get('/user/edit-profile', 
  authController.isLoggedIn,
  userController.editAccount
);

router.get('/logout', 
  authController.isLoggedIn, 
  authController.logout
);

router.post('/signup', 
  userController.validationRules.signup(),
  userController.handleValidationErrors,
  catchErrors(userController.signup),
  authController.authenticate
);

router.post('/login', authController.authenticate);

router.post('/user/edit',
   userController.upload,
   userController.resize,
   userController.validationRules.editAccount(),
   userController.handleValidationErrors,
   catchErrors(userController.updateAccount)
);

router.post('/user/change', 
   userController.validationRules.changePassword(),
   userController.handleValidationErrors,
   userController.updatePassword,

);

router.post('/forgot', catchErrors(authController.forgotPassword));

router.get('/user/forgot/:token', catchErrors(authController.resetForm));

router.post('/user/forgot/:token', 
  authController.matchPasswords,
  catchErrors(authController.updatePassword)
);

//Store
router.get('/', storeController.homePage);

router.get('/results/stores', catchErrors(storeController.quickSearch));

router.get('/results/stores/near', catchErrors(storeController.quickSearchByLocation));

router.get('/collection/top', catchErrors(storeController.getTopStores));

router.get('/collection/new', catchErrors(storeController.getNewStores));

router.get('/collection/popular', catchErrors(storeController.getPopularStores));

router.get('/stores', catchErrors(storeController.getStores));

router.get('/stores/page/:page', catchErrors(storeController.getStores));

router.get('/store/:slug', catchErrors(storeController.getStore));

router.get('/cd', catchErrors(reviewController.getAverageRating));

router.get('/user/store/:id/edit', 
  authController.isLoggedIn,
  catchErrors(storeController.editStore)
);

//Dashboard

router.get('/user/restaurants', 
  authController.isLoggedIn,
  catchErrors(storeController.getStoresByUser)
);

router.get('/user/bookmarks', 
  authController.isLoggedIn,
  catchErrors(storeController.getBookmarkedStores)
);

router.get('/user/recent', 
  authController.isLoggedIn,
  catchErrors(storeController.getRecentStores)
);

router.get('/user/reviews', 
  authController.isLoggedIn,
  catchErrors(userController.getReviews)
);

router.get('/user/add-restaurant', 
  authController.isLoggedIn,
  storeController.addStore
);

router.get('/user/manage-restaurants',
  authController.isLoggedIn,
  catchErrors(storeController.getStoresByUser)
);

router.post('/add', 
  authController.isLoggedIn,
  storeController.upload,
  catchErrors(storeController.resize),
  storeController.validationRules.store(),
  storeController.handleValidationErrors,
  storeController.formatStoreData,
  catchErrors(storeController.createStore)
);

router.post('/add/:id',
  authController.isLoggedIn,
  storeController.upload,
  catchErrors(storeController.resize),
  storeController.validationRules.store(),
  storeController.handleValidationErrors,
  storeController.formatStoreData,
  catchErrors(storeController.updateStore)
);

//Reviews

router.post('/reviews/:id', 
  authController.isLoggedIn,
  catchErrors(reviewController.addReview)
);

//APIs

router.get('/api/v1/search', catchErrors(storeController.searchStores));

router.get('/api/v1/stores/near', catchErrors(storeController.searchStoresByLocation));

router.post('/api/v1/store/:id/bookmark', catchErrors(storeController.bookmarkStore));

router.post('/api/v1/store/:id/views', catchErrors(storeController.registerViews));

router.delete('/api/v1/review/:id/delete', catchErrors(reviewController.deleteReview));
 
module.exports = router;