const Result = require('../models/Result')

// Grade helper
const getGrade = (score) => {
  if (score >= 70) return 'A'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  if (score >= 45) return 'D'
  if (score >= 40) return 'E'
  return 'F'
}

// GPA helper
const calculateGPA = (results) => {
  const gradePoints = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }
  let totalPoints = 0
  let totalUnits = 0

  results.forEach(result => {
    const grade = getGrade(result.score)
    totalPoints += gradePoints[grade] * result.unit
    totalUnits += result.unit
  })

  return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00'
}

// Upload result (lecturer only)
exports.uploadResult = async (req, res) => {
  try {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({ msg: 'Only lecturers can upload results' })
    }

    const { studentId, course, score, unit, session } = req.body

    if (!studentId || !course || score === undefined || !unit || !session) {
      return res.status(400).json({ msg: 'Please provide all required fields' })
    }

    const lecturerName = req.user.name

    const newResult = new Result({
      studentId,
      course,
      score,
      unit,
      session,
      lecturerName,
      createdBy: req.user.id
    })

    await newResult.save()

    res.status(201).json({ msg: 'Result uploaded successfully', result: newResult })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
}

// Get student results with GPA per session
exports.getStudentResults = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied' })
    }

    const query = { studentId: req.user.userId }
    if (req.query.session) {
      query.session = req.query.session
    }

    const rawResults = await Result.find(query)

    // Group by session
    const grouped = {}
    rawResults.forEach(r => {
      const session = r.session
      if (!grouped[session]) grouped[session] = []
      grouped[session].push(r)
    })

    const sessionData = Object.entries(grouped).map(([session, results]) => {
      const formatted = results.map(r => ({
        course: r.course,
        score: r.score,
        unit: r.unit,
        session: r.session,
        lecturerName: r.lecturerName,
        grade: getGrade(r.score)
      }))

      return {
        session,
        gpa: calculateGPA(results),
        results: formatted
      }
    })

    res.json({ sessions: sessionData })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
}

// Update result (lecturer only, own results)
exports.updateResult = async (req, res) => {
  try {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({ msg: 'Only lecturers can update results' })
    }

    const result = await Result.findById(req.params.id)
    if (!result) return res.status(404).json({ msg: 'Result not found' })

    if (result.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You can only update your own results' })
    }

    const { course, score, unit, session } = req.body
    if (course !== undefined) result.course = course
    if (score !== undefined) result.score = score
    if (unit !== undefined) result.unit = unit
    if (session !== undefined) result.session = session

    await result.save()

    res.json({ msg: 'Result updated successfully', result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
}

// Delete result (lecturer only, own results)
exports.deleteResult = async (req, res) => {
  try {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({ msg: 'Only lecturers can delete results' })
    }

    const result = await Result.findById(req.params.id)
    if (!result) return res.status(404).json({ msg: 'Result not found' })

    if (result.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You can only delete your own results' })
    }

    await result.deleteOne()

    res.json({ msg: 'Result deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
}
