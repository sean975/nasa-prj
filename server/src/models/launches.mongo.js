const mongoose = require('mongoose')

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  target: {
    type: String
  },
  launchDate: {
    type: Date,
    required: true,
  },
  customers: [String],
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    default: true
  },
})

//* connect launchesSchema with the 'launches' collection
module.exports = mongoose.model('Launch', launchesSchema)
