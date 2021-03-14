const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = mongoose.model('Review');
const slug = require('slugs');

const storeSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a name!'
  },

  description: {
    type: String,
    trim: true
  },

  dishes: {
    type: String,
    trim: true
  },

  highlights: {
    type: String,
    trim: true
  },
  
  contact: {
    type: Number,
    trim: true,
    required: 'Please enter contact information'
  },

  timings: {
    type: [String],
    trim: true,
    required: 'Please enter store timings'
  },
 

  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: 'You must supply coordinates!'
    },
    address: {
      type: String,
      trim: true,
      required: 'You must supply an address'
    }
  },

  photo: String,

  slug: String,

  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'No author found'
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  created: {
    type: Date,
    default: Date.now
  }

}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

storeSchema.index({
  name: 'text',
  description: 'text',
  dishes: 'text',
  highlights: 'text'
});

storeSchema.index({
  location: '2dsphere'
});

storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store', 
  options: { sort: { created: -1 }}
});

storeSchema.statics.getStores = function () {
  return this.aggregate ([
    //Look up stores and populate reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
    //adds on a averageRatingField
    { $addFields: {
        avgRating: { $avg: '$reviews.rating' },
        votes: { $size: '$reviews' }
      }
    },
  ]);
};

storeSchema.statics.quickSearch = function (query = 'tasty') {
  return this.aggregate ([
     { $match: { $text: { $search: query } } },
     { $sort: { score: { $meta: "textScore" } } },
    //Look up stores and populate reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
    //adds on a averageRatingField
    { $addFields: {
        avgRating: { $avg: '$reviews.rating' },
        votes: { $size: '$reviews' }
      }
    },
  ]);
};

storeSchema.statics.getStoresByUser = function (user) {
  return this.aggregate ([
    //Get the restaurants authorized by current user
    { $match: { author: { $eq: user._id } }},
    //Look up stores and populate reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
    //adds on a averageRatingField
    { $addFields: {
        avgRating: { $avg: '$reviews.rating' },
        votes: { $size: '$reviews' }
      }
    },
  ]);
};

storeSchema.statics.getBookmarkedStores = function (user) {
  return this.aggregate ([
    //Get the restaurants authorized by current user
    { $match: { _id: { $in: user.bookmarks } }},
    //Look up stores and populate reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
    //adds on a averageRatingField
    { $addFields: {
        avgRating: { $avg: '$reviews.rating' },
        votes: { $size: '$reviews' }
      }
    },
  ]);
};



storeSchema.statics.getRecentStores = function (user) {
  return this.aggregate ([
    //Get the restaurants authorized by current user
    { $match: { _id: { $in: user.recents } }},
    //Look up stores and populate reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
    //adds on a averageRatingField
    { $addFields: {
        avgRating: { $avg: '$reviews.rating' },
        votes: { $size: '$reviews' }
      }
    },
  ]);
};

storeSchema.statics.getPopularStores = function (user) {
  return this.aggregate ([
    //Look up stores and populate reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
    //adds on a averageRatingField
    { $addFields: {
        avgRating: { $avg: '$reviews.rating' },
        votes: { $size: '$reviews' }
      }
    },
    { $sort: { views: -1 } }
  ]);
};


/*
Not used
//populated reviews in store
//couldn't populate author in for reviews
storeSchema.statics.getStore = function (slug) {
  
  return this.aggregate ([
    //find store by slug
    { $match: { slug: { $eq: slug} }}, 
    //Look up store and populate reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
    //adds on a averageRatingField
    { $addFields: {
        avgRating: { $avg: '$reviews.rating' },
        votes: { $size: '$reviews' }
      }
    },
    { $unwind: '$reviews'},
    { $lookup: { from: 'users', localField: 'reviews.author', foreignField: '_id', as: 'reviews.author' } },
  ])
};
*/

storeSchema.statics.findTopStores = function () {
  return this.aggregate ([
    //Look up stores and populate reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
    //Filter for at least 2 reviews
    { $match: { 'reviews.1': { $exists: true } } },
    //adds on a averageRatingField
    { $addFields: {
        avgRating: { $avg: '$reviews.rating' },
        votes: { $size: '$reviews' }
      }
    },
    //Sort by rating
    { $sort: { avgRating: -1 }},
    //Limit 
    { $limit: 10 },
  ]);
};

storeSchema.pre('save', async function (next){
  if(!this.isModified('name')){
    return next();
  }
  this.slug = slug(this.name);
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const matchedStores = await this.constructor.find({ slug: slugRegex });
  if(matchedStores.length){
    this.slug = `${this.slug}-${matchedStores.length + 1}`;
  }
  next();
});

const Store = new mongoose.model('Store', storeSchema);

module.exports = Store;