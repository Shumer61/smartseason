require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./db')

const app = express()
connectDB()

app.use(cors({
    origin: [
        'http://localhost:5173',
        /\.vercel\.app$/
    ],
    credentials: true
}))
app.use(express.json())

const authRoutes = require('./routes/auth')
const fieldRoutes = require('./routes/fields')
const dashboardRoutes = require('./routes/dashboard')

app.use('/auth', authRoutes)
app.use('/fields', fieldRoutes)
app.use('/dashboard', dashboardRoutes)

app.get('/', (req, res) => {
    res.json({ message: 'SmartSeason API is running' })
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})