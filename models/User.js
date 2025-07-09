const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'lecturer'], required: true },
  name: { type: String, required: true }
})

module.exports = mongoose.model('User', userSchema)
