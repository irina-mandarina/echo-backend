const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    // id: mongoose.Schema.Types.ObjectId,
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
            type: String
        },
        timestamps: [{
            type: Date,
            default: Date.now
        }]
    }]
})

userModel = mongoose.model('User', userSchema)

userSchema.plugin(require('mongoose-lifecycle'))

module.exports = userModel