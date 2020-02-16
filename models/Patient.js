const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  pid: {
    type: String,
    alias: 'Program Identifier'
  },
  data: {
    type:String,
    alias: 'Data Source'
  },
  card: {
    type: String,
    alias: 'Card Number'
  },
  mid: {
    type: String,
    alias: 'Member ID'
  },
  fname: {
    type: String,
    alias: 'First Name'
  },
  lname: {
    type: String,
    alias: 'Last Name'
  },
  bdate: {
    type: String,
    alias: 'Date of Birth'
  },
  addr1: {
    type: String,
    alias: 'Address 1'
  },
  addr2: {
    type: String,
    alias: 'Address 2'
  },
  city: {
    type: String,
    alias: 'City'
  },
  state: {
    type: String,
    alias: 'State'
  },
  zip: {
    type: String,
    alias: 'Zip code'
  },
  tel: {
    type: String,
    alias: 'Telephone number'
  },
  email: {
    type: String,
    alias: 'Email Address'
  },
  con: {
    type: String,
    alias: 'CONSENT'
  },
  mob: {
    type: String,
    alias: 'Mobile Phone'
  },
  emails: [
    { type: mongoose.Schema.ObjectId, ref: 'Email' }
  ]
});

module.exports = mongoose.model('Patient', patientSchema);