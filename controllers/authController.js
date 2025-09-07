// controllers/authController.js
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// POST /api/auth/register
exports.register = async (req, res) => {
  const { userId, password, role, name } = req.body
  if (!userId || !password || !role || !name) {
    return res.status(400).json({ success: false, msg: 'All fields are required' })
  }

  try {
    const existing = await User.findOne({ userId })
    if (existing) {
      return res.status(400).json({ success: false, msg: 'User already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ userId, password: hashed, role, name })

    res.status(201).json({
      success: true,
      msg: 'User registered successfully',
      user: { userId: user.userId, role: user.role, name: user.name }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, msg: 'Registration failed', error: err.message })
  }
}

// POST /api/auth/login
exports.login = async (req, res) => {
  const { userId, password } = req.body
  if (!userId || !password) {
    return res.status(400).json({ success: false, msg: 'User ID and password are required' })
  }

  try {
    const user = await User.findOne({ userId })
    if (!user) return res.status(400).json({ success: false, msg: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ success: false, msg: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user._id, role: user.role, userId: user.userId, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      user: { userId: user.userId, role: user.role, name: user.name }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, msg: 'Login failed', error: err.message })
  }
}

// GET /api/auth/me  (token-based)
exports.getMe = async (req, res) => {
  try {
    // either trust the token payload or read from DB for freshness
    const user = await User.findById(req.user.id).select('userId role name')
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, msg: 'Failed to load profile', error: err.message })
  }
}
