// models/Result.js
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },   // e.g. matric number
    course: { type: String, required: true },
    score: { type: Number, required: true },
    unit: { type: Number, required: true },
    session: { type: String, required: true },
    grade: { type: String, required: true },       // computed from score
    semester: {
      type: String,
      enum: ['First Semester', 'Second Semester'],
      required: true,
    },
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lecturerName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
