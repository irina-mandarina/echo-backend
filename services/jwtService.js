const jwt = require('jsonwebtoken')
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET

function generateToken(username) {
    return jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' })
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET)
}

function getUsername(token) {
    try {
        const decodedToken = verifyToken(token, JWT_SECRET)

        const username = decodedToken.username
        return username
    } catch (error) {
        console.error('Error verifying token:', error)
        return null
    }
}

module.exports = {
    generateToken,
    verifyToken,
    getUsername
}