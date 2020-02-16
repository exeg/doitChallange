const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  shedule: {
    type: Date,
    default: Date.now
  },
  to: {
    type: String,
    required: 'Please supply an address',
    trim: true
  },
  from: {
    type:String,
  },
  subject: {
    type: String,
  },
  body: {
    type: String,
  },
  attach: [String]
});

module.exports = mongoose.model('Email', emailSchema);