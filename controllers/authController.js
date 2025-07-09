const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.register = async (req, res) => {
  const { userId, password, role, name } = req.body
  try {
    const existing = await User.findOne({ userId })
    if (existing) return res.status(400).json({ msg: 'User exists' })

    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      userId,
      password: hashed,
      role,
      name
    })

    res.status(201).json({ msg: 'Registered', user: user.userId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.login = async (req, res) => {
  const { userId, password } = req.body
  try {
    const user = await User.findOne({ userId })
    if (!user) return res.status(400).json({ msg: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user._id, role: user.role, userId: user.userId, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { userId: user.userId, role: user.role, name: user.name } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
}
