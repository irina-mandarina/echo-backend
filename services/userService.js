const userRepository = require("../repositories/userRepository")
const { supabase, supabaseAdmin } = require('../supabaseClient')
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
        else {
            user.streamingData = []
        }
        return user
    } catch (error) {
        console.error("Error fetching user:", error)
        throw error
    }
}


exports.getAllUsers = async (query) => {
    try {
        let users = []
        if (query) {
            users = await userRepository.searchUsersByUsername(query)
        }
        else {
            users = await userRepository.getAllUserModels()
        }
        return users
    } 
    catch (error) {
        console.error("Error fetching users:", error)
        throw error
    }
}

exports.signUp = async (username, email, password) => {
    console.log("Signing up", username, email, password)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        console.error('Error signing up:', error.message)
        throw new Error(error.message)
    }

    try {
        const user = await userRepository.createUserModel(
            username,
            data.user.id
        )

        return {
            user,
            jwt: data.session.access_token
        }
    }
    catch (error) {
        console.log(error.code)
        if (error.code == '11000') {
            // delete supabase user if user creation fails
            await supabaseAdmin.auth.admin.deleteUser(data.user.id)
            throw new Error("Username already registered")
        }
        console.error(error)
        throw new Error("Failed to create user")
    }
}

exports.logIn = async (identifier, password) => {
    return identifier.includes('@') ? logInWithEmail(identifier, password) : logInWithUsername(identifier, password)
}

const logInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.log(error)
        switch (error.message) {
            case 'Invalid login credentials':
                throw new Error(error.message)
            default:
                throw new Error("Failed to log in")
            }
    }
    const user = await this.getUserBySupaId(data.user.id)
    if (!user) {
        throw new Error("User does not exist")
    }

    return {
        user,
        jwt: data.session.access_token
    }
}

const logInWithUsername = async (username, password) => {
    const user = await userRepository.getUserModelByUsername(username)
    if (!user) {
        throw new Error("User does not exist")
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
    })

    if (error) {
        console.log(error)
        switch (error.message) {
            case 'Invalid login credentials':
                throw new Error("Wrong password")
            default:
                throw new Error("Failed to log in")
            }
    }

    return {
        user,
        jwt: data.session.access_token
    }
}

exports.updateUser = async (username, user) => {
    try {
        if (username !== user.username) {
            throw new Error("You are not authorized to update this user")
        }
        return await userRepository.updateUserModel({username}, user)
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
        const user = await userRepository.updateUserModel({spotifyAccessToken}, {
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

exports.saveState = async (supaId, state) => {
    try {
        const updatedUser = await userRepository.updateUserModel({supaId}, {
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
        console.error("Error fetching user by spotify state: ", error)
        throw error
    }
}

exports.removeAccessToken = async (spotifyAccessToken) => {
    try {
        return await userRepository.updateUserModel({spotifyAccessToken}, {
            $unset: {
                spotifyAccessToken: 1,
                spotifyRefreshToken: 1
            }
        })
    }
    catch (error) {
        console.error("Error removing access token: ", error)
        throw error
    }
}
