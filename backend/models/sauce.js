const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: false },
  manufacturer: { type: String, required: true},
  mainPepper: { type: String, required: true},
  userId: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, required: false},
  dislikes: { type: Number, required: false},
  usersLiked: { type: Array, required: false},
  usersDisliked: { type: Array, required: false},
});

module.exports = mongoose.model('Sauce', sauceSchema); 