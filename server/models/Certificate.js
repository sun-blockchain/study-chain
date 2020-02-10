const mongoose = require('mongoose');
const { Schema } = mongoose;

const CertificateSchema = new Schema({
  certificateID: {
    type: String,
    unique: true,
    required: [true, "can't be blank"]
  },
  subjectID: {
    type: String,
    trim: true,
    required: [true, "can't be blank"]
  },
  username: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "can't be blank"]
  },
  issueDate: {
    type: String,
    trim: true,
    required: [true, "can't be blank"]
  }
});

const Certificate = mongoose.model('Certificate', CertificateSchema);

module.exports = Certificate;
