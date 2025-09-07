// routes/resultRoutes.js
const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const {
  uploadResult,
  getStudentResults,
  getLecturerResults,
  updateResult,
  deleteResult
} = require('../controllers/resultController')

// Role guards
function isLecturer(req, res, next) {
  if (!req.user || req.user.role !== 'lecturer') {
    return res.status(403).json({ msg: 'Access denied: Lecturer only' })
  }
  next()
}

function isStudent(req, res, next) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Access denied: Student only' })
  }
  next()
}

// Lecturer-only
router.post('/upload',   auth, isLecturer, uploadResult)
router.get('/lecturer',  auth, isLecturer, getLecturerResults)
router.put('/:id',       auth, isLecturer, updateResult)
router.delete('/:id',    auth, isLecturer, deleteResult)

// Student-only
router.get('/student',   auth, isStudent, getStudentResults)

module.exports = router
