const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization

    console.log('Auth middleware: authHeader:', authHeader ? authHeader.substring(0, 20) + '...' : undefined)

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Auth middleware: No token or invalid format')
        return res.status(401).json({ message: 'Not authorized' })
    }

    try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')
        next()
    } catch(error) {
        console.log('Auth middleware: Token invalid:', error.message)
        return res.status(401).json({ message: 'Token invalid' })
    }
}

module.exports = { protect }