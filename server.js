require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')


const authRoutes = require('./routes/authRoutes')
const resultRoutes = require('./routes/resultRoutes')

const app = express()

connectDB()


app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())


app.use('/api/auth', authRoutes)
app.use('/api/results', resultRoutes) 


app.get('/', (req, res) => {
  res.send('Student Result Backend API is running')
})


const PORT = process.env.PORT || 5050
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`)
})
