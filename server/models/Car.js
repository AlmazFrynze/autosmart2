const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  mileage: Number,
  engineVolume: String,
  enginePower: String,
  transmission: String,
  driveType: String,
  bodyType: String,
  color: String,
  condition: String,
  owners: Number,
  images: [String],
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Car', carSchema); 