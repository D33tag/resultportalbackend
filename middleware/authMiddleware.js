// middleware/authMiddleware.js
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ msg: 'No token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, role, userId, name }
    next()
  } catch (err) {
    return res.status(403).json({ msg: 'Invalid token' })
  }
}
