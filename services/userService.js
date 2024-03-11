const { getEpisodeById } = require('./spotify/playerService')
const { getAllUserModels, createUserModel, updateUserModel } = require("../mongooseRepos/userRepository");
const {generateToken} = require("./jwtService");
const bcrypt = require("bcrypt");

const saltRounds = process.env.SALT_ROUNDS;

async function getUserByUsername(username, getEpisodes = false) {
    const user = await getUserByUsername(username)
    if (!getEpisodes) {
        const episodesPromises = user.streamingData.map(async (stream) => {
            const episodeId = stream.episodeId
            const episode = await getEpisodeById(episodeId)
            return episode
        })

        const episodes = await Promise.all(episodesPromises)
        user.streamingData = episodes
    }
    return user
}

async function getAllUsers() {
    const users = await getAllUserModels()
    for (let user in users) {
        user = getUserByUsername(user.username)
    }
    return users
}

async function signUp(username, email, password) {
    let encryptedPassword = null
    bcrypt.hash(password, saltRounds, function(err, hash) {
        encryptedPassword = hash
    });
    const user = await createUserModel(username, email, encryptedPassword)
    return {
        user,
        accessToken: generateToken(username)
    }
}

async function logIn(username, password) {
    const user = await getUserByUsername(username)
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
    if (username != user.username) {
        throw new Error("You are not authorized to update this user")
    }
    const updatedUser = await updateUserModel(user)
    return updatedUser
}

module.exports = {
    getUserByUsername,
    getAllUsers,
    signUp,
    updateUser
}