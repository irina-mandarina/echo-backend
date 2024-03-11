const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    spotifyAccessToken: {
        type: String
    },
    spotifyRefreshToken: {
        type: String
    },
    dateOfRegistration: {
        type: String
    },
    bio: {
        type: String
    },
    streamingData: [{
        episodeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
})

module.exports = mongoose.model('User', userSchema)