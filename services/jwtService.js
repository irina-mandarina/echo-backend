const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

function generateToken(username) {
    return jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' })
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET)
}

function decodeToken(token) {
    return jwt.decode(token)
}

function getUsername(token) {
    const decodedToken = decodeToken(token)
    return decodedToken.username
}

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    getUsername
}