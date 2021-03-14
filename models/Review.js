const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'No writer is provided!'
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'No store is provided!'
  },
  review: {
    type: String,
    required: 'You must supply a review'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

const helper = {
  autopopulate(next){
    this.populate('author store');
    next();
  }
};

reviewSchema.statics.getRatingsInfo = function (storeId) {
  return this.aggregate([
    { $match: { store: { $eq: storeId }} },
    { $group: { _id: '$store', avg  : { $avg: '$rating' }, votes: { $sum: 1} } },
  ]);
};


reviewSchema.pre('find', helper.autopopulate);
reviewSchema.pre('findOne', helper.autopopulate);

module.exports = mongoose.model('Review', reviewSchema);