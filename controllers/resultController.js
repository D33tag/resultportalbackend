// controllers/resultController.js
const Result = require('../models/Result')
console.log('Result model:', Result)

// Grade helper
const getGrade = (score) => {
  if (score >= 70) return 'A'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  if (score >= 45) return 'D'
  if (score >= 40) return 'E'
  return 'F'
}

// @desc Upload result (lecturer only)
exports.uploadResult = async (req, res) => {
  try {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({ msg: 'Only lecturers can upload results' })
    }

    const { studentId, course, score, unit, session, semester } = req.body
    if (!studentId || !course || score === undefined || !unit || !session || !semester) {
      return res.status(400).json({ msg: 'Please provide all required fields' })
    }

    const grade = getGrade(Number(score))

    const result = await Result.create({
      studentId,
      course,
      score,
      unit,
      session,
      semester,
      grade,
      lecturerId: req.user.id,
      lecturerName: req.user.name,
    })

    res.status(201).json({ success: true, result })
  } catch (err) {
    console.error("Error saving result:", err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc Get results for logged-in lecturer
exports.getLecturerResults = async (req, res) => {
  try {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({ msg: 'Access denied' })
    }

    const { session, semester } = req.query
    const query = { lecturerId: req.user.id }   // ✅ fixed

    if (session) query.session = session
    if (semester) query.semester = semester

    const results = await Result.find(query)
      .sort({ createdAt: -1 })

    res.json({ success: true, results })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, msg: 'Server error', error: err.message })
  }
}

// @desc Edit a result
exports.updateResult = async (req, res) => {
  try {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({ msg: 'Only lecturers can update results' })
    }

    const result = await Result.findById(req.params.id)
    if (!result) return res.status(404).json({ msg: 'Result not found' })

    if (result.lecturerId.toString() !== req.user.id) {   // ✅ fixed
      return res.status(403).json({ msg: 'Not authorized' })
    }

    const { course, score, unit, session, semester } = req.body
    if (course !== undefined) result.course = course
    if (score !== undefined) {
      result.score = Number(score)
      result.grade = getGrade(Number(score))
    }
    if (unit !== undefined) result.unit = unit
    if (session !== undefined) result.session = session
    if (semester !== undefined) result.semester = semester

    await result.save()
    res.json({ success: true, result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, msg: 'Server error', error: err.message })
  }
}

// @desc Delete a result
exports.deleteResult = async (req, res) => {
  try {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({ msg: 'Only lecturers can delete results' })
    }

    const result = await Result.findById(req.params.id)
    if (!result) return res.status(404).json({ msg: 'Result not found' })

    if (result.lecturerId.toString() !== req.user.id) {   // ✅ fixed
      return res.status(403).json({ msg: 'Not authorized' })
    }

    await result.deleteOne()
    res.json({ success: true, msg: 'Result deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, msg: 'Server error', error: err.message })
  }
}

// @desc Get student results
exports.getStudentResults = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied' })
    }

    const { session, semester } = req.query
    const query = { studentId: req.user.userId }  // ✅ consistent

    if (session) query.session = session
    if (semester) query.semester = semester
    console.log("QUERY USED:", query)

    const results = await Result.find(query)
       .sort({ createdAt: -1 })

    res.json({ success: true, results })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, msg: 'Server error', error: err.message })
  }
  console.log("REQ.USER:", req.user)
console.log("QUERY PARAMS:", req.query)
}
