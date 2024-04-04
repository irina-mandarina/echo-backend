const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
        unique: true
    },
    supaId: {
        type: String,
        required: true,
        unique: true
    },
    spotifyAccessToken: {
        type: String
    },
    spotifyRefreshToken: {
        type: String
    },
    spotifyState: {
        type: String,
        unique: true
    },
    dateOfRegistration: {
        type: String
    },
    bio: {
        type: String
    },
    streamingData: [{
        episodeId: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
})

module.exports = mongoose.model('User', userSchema)