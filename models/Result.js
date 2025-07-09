const mongoose = require('mongoose')

const resultSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  course: { type: String, required: true },
  score: { type: Number, required: true },
  unit: { type: Number, required: true },
  session: { type: String, required: true },
  lecturerName: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

module.exports = mongoose.model('Result', resultSchema)
