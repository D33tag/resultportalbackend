const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const {
  uploadResult,
  getStudentResults,
  updateResult,
  deleteResult
} = require('../controllers/resultController')

router.post('/upload', auth, uploadResult)
router.get('/student', auth, getStudentResults)
router.put('/:id', auth, updateResult)
router.delete('/:id', auth, deleteResult)

module.exports = router
