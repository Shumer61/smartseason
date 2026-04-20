const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { adminOnly } = require('../middleware/roles')

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body
        console.log('Step 1 - body received:', req.body)
        
        const userExists = await User.findOne({ email })
        console.log('Step 2 - checked existing user')
        
        if(userExists) return res.status(400).json({ message: 'User already exists' })

        const user = await User.create({ name, email, password, role })
        console.log('Step 3 - user created')
        
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        })
    } catch(error) {
        console.log('ERROR CAUGHT:', error)
        res.status(500).json({ message: error.message })
    }
})

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if(!user) return res.status(400).json({ message: 'Invalid credentials' })

        const match = await bcrypt.compare(password, user.password)
        if(!match) return res.status(400).json({ message: 'Invalid credentials' })

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        })
    } catch(error) {
        res.status(500).json({ message: error.message })
    }
})

// Get all agents (admin only)
router.get('/agents', protect, adminOnly, async (req, res) => {
    try {
        const agents = await User.find({ role: 'agent' }).select('-password')
        res.json(agents)
    } catch(error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router