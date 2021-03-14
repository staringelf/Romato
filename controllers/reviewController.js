const mongoose = require('mongoose');
const Review = mongoose.model('Review');
const Store = mongoose.model('Store');

exports.addReview = async (req, res) => {
  req.body.author = req.user._id;
  req.body.store = req.params.id;
  const review = new Review(req.body);
  //return res.json(req.body);
  await review.save();
  req.flash('success', 'Successfully added your review');
  res.redirect('back');
};

exports.getAverageRating = async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('reviews').exec();
  const reviews = await Review.getAverageRating(store._id);
  res.json(reviews);
};

exports.deleteReview = async (req, res) => {
  const review = await Review.findByIdAndDelete( req.params.id );
  res.json(review);
}