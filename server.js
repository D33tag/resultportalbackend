require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const resultRoutes = require('./routes/resultRoutes')

const app = express()

// Connect to MongoDB
connectDB()

// Middleware

app.use(cors({
    origin: 'http://localhost:5173', // frontend origin
    credentials: true,               // allow cookies or auth headers
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/results', resultRoutes)

// Root route
app.get('/', (req, res) => {
    res.send('Student Result Backend API is running')
})

// Start server
const PORT = process.env.PORT || 5050
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
