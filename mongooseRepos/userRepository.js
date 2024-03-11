const mongoose = require("mongoose")
const User = require("../models/User")

async function getAllUserModels() {
    try {
        const users = await User.find()
        return users
    } catch (error) {
        console.error("Error fetching users:", error)
        throw error
    }
}

async function getUserByUsernameModel(username) {
    try {
        const user = await User.findOne({ username: username })
        return user
    } catch (error) {
        console.error("Error fetching user:", error)
        throw error
    }
}

async function updateUserModel(user) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            user,
            {new: true}
        )
        return updatedUser
    } catch (error) {
        console.error("Error updating user:", error)
        throw error
    }
}

async function createUserModel(username, email, password) {
    try {
        const user = new User({
            username: username,
            email: email,
            password: password,
            dateOfRegistration: Date.now()
        })
        await user.save()
        return user
    } catch (error) {
        console.error("Error creating user:", error)
        throw error
    }
}

module.exports = {
    getAllUserModels,
    getUserByUsernameModel,
    updateUserModel,
    createUserModel
}

