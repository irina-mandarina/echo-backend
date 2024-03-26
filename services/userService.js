const { getEpisodeById } = require('./spotify/episodeService')
const { getAllUserModels, createUserModel, updateUserModel, getUserModelByUsername, getUserModelByField } = require("../mongooseRepos/userRepository");
const {generateToken} = require("./jwtService");
const bcrypt = require("bcrypt");

const saltRounds = parseInt(process.env.SALT_ROUNDS);

async function getUserByUsername(username, requestedUserUsername = null, getEpisodes = false) {
    try {
        if (requestedUserUsername === null) requestedUserUsername = username
        const user = await getUserModelByUsername(requestedUserUsername)
        if (getEpisodes) {
            if (!user?.streamingData) return user
            const episodesPromises = user?.streamingData?.map(async (stream) => {
                const episodeId = stream.episodeId
                return await getEpisodeById(episodeId)
            })

            user.streamingData = await Promise.all(episodesPromises) ?? []
        }
        return user
    } catch (error) {
        console.error("Error fetching user:", error)
        throw error
    }
}

async function getAllUsers() {
    const users = await getAllUserModels()
    for (let user in users) {
        user = await getUserModelByUsername(user.username)
    }
    return users
}

async function signUp(username, email, password) {
    console.log("Signing up", username, email, password)

    const encryptedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Encrypted password: ", encryptedPassword)

    const user = await createUserModel(username, email, encryptedPassword)
    return {
        user,
        accessToken: generateToken(username)
    }
}

async function logIn(username, password) {
    const user = await getUserModelByUsername(username)
    bcrypt.compare(password, user.password, function(err, result) {
        if (result) {
            return {
                user,
                accessToken: generateToken(username)
            }
        }
        else {
            throw new Error("Invalid password")
        }
    })
}

async function updateUser(username, user) {
    if (username !== user.username) {
        throw new Error("You are not authorized to update this user")
    }
    return await updateUserModel(user)
}

async function deleteUser(username) {
    const user = await getUserModelByUsername(username)
    await user.delete()
    return user
}

async function addStream(username, episodeId) {
    const user = await getUserModelByUsername(username)
    if (!user.streamingData) {
        user.streamingData = []
    }
    user.streamingData.push({episodeId, timestamp: Date.now()})
    return await updateUserModel(user)
}

async function saveState(username, state) {
    try {
        const user = await getUserModelByUsername(username)
        user.spotifyState = state
        const updatedUser = await updateUserModel(user)
        return updatedUser
    } catch (error) {
        console.error("Error saving user state:", error)
        throw error
    }
}

async function getUsernameBySpotifyState(state) {
    return await getUserModelByField("spotifyState", state)
}

module.exports = {
    getUserByUsername,
    getAllUsers,
    signUp,
    updateUser,
    deleteUser,
    addStream,
    getUsernameBySpotifyState,
    saveState
}