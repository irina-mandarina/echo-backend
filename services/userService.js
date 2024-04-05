const userRepository = require("../mongooseRepos/userRepository")
const { supabase } = require('../supabaseClient')
const episodeService = require('./spotify/episodeService')
require('dotenv').config()


exports.getUserByUsername = async (username, getEpisodes = false) => {
    try {
        const user = await userRepository.getUserModelByUsername(username)
        if (getEpisodes) {
            user.streamingData = await episodeService.getEpisodesForUser(user.streamingData)
        }
        return user
    } catch (error) {
        console.error("Error fetching user:", error)
        throw error
    }
}

exports.getUserBySupaId = async (supaId, getEpisodes = false) => {
    try {
        const user = await userRepository.getUserBySupaId(supaId)
        if (getEpisodes) {
            user.streamingData = await episodeService.getEpisodesForUser(user.streamingData)
        }
        return user
    } catch (error) {
        console.error("Error fetching user:", error)
        throw error
    }
}


exports.getAllUsers = async () => {
    try {
        const users = await userRepository.getAllUserModels()
        return users
    } 
    catch (error) {
        console.error("Error fetching users:", error)
        throw error
    }
}

exports.signUp = async (username, email, password) => {
    try {
        console.log("Signing up", username, email, password)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) {
            console.error('Error signing up:', error.message)
            return null
        }

        console.log(data)

        const user = await userRepository.createUserModel(username, data.user.id)

        return {
            user,
            jwt: data.session.access_token
        }
    }
    catch (error) {
        console.error("Error signing up:", error)
        throw error
    }
}

exports.logIn = async (identifier, password) => {
    try {
        let email = null
        let user = null

        // Check if identifier is a username
        if (!identifier.includes("@")) {
            user = await userRepository.getUserModelByUsername(identifier)
            if (!user) {
                throw new Error("User not found")
            }
            const { data, error } = await supabase.auth.admin.getUserById(user.supaId)
            if (error) {
                console.error('Error signing in:', error.message)
                return null
            }
            email = data.email
        }
        else {
            email = identifier
        }
        
        const { data, error } = await supabase.auth.signIn({
            email,
            password,
        })

        if (error) {
            throw error
        }

        if (!user) {
            user = await supabase.auth.admin.getUserById(data.user.id)
        }

        return {
            user,
            jwt: data.session.access_token
        }
        
    } catch (error) {
        console.error("Error logging in:", error)
        throw error
    }
}

exports.updateUser = async (username, user) => {
    try {
        if (username !== user.username) {
            throw new Error("You are not authorized to update this user")
        }
        return await userRepository.updateUserModel(user)
    }
    catch (error) {
        console.error("Error updating user:", error)
        throw error
    }
}

exports.deleteUser = async (username) => {
    try {
        const user = await userRepository.getUserModelByUsername(username)
        await user.delete()
        return user
    }
    catch (error) {
        console.error("Error deleting user:", error)
        throw error
    }
}

exports.addStream = async (spotifyAccessToken, episodeId) => {
    try {
        const user = await userRepository.updateUserModel(spotifyAccessToken, {
            $push: {
            streamingData: {
                episodeId,
                timestamp: Date.now()
            }
            }
        })
    }
    catch (error) {
        console.error("Error adding stream:", error)
        throw error
    }
}

exports.saveState = async (userSupaId, state) => {
    try {
        const updatedUser = await userRepository.updateUserModel(userSupaId, {
            spotifyState: state
        })
        return updatedUser
    } catch (error) {
        console.error("Error saving user state:", error)
        throw error
    }
}

exports.getUsernameBySpotifyState = async (state) => {
    try {
        return await userRepository.getUserModelByField("spotifyState", state)
    }
    catch (error) {
        console.error("Error fetching user by spotify state:", error)
        throw error
    }
}
