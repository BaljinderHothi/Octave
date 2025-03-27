import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  alias: String,
  title: String
});

const HourSchema = new mongoose.Schema({
  is_overnight: Boolean,
  start: String,
  end: String,
  day: Number
});

const RestaurantSchema = new mongoose.Schema({
  id: String,
  address: [String],
  categories: [CategorySchema],
  hours: [{
    open: [HourSchema],
    hours_type: String,
    is_open_now: Boolean
  }],
  image_url: String,
  is_closed: Boolean,
  name: String,
  phone: String,
  rating: Number,
  review_count: Number,
  yelp_url: String
});

export default mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);