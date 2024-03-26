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

async function getUserModelByUsername(username) {
    try {
        const user = await User.findOne({ username: username })
        if (user) {
            return user;
        } else {
            console.log(`User with username ${username} not found.`);
            return null;
        }
        return user
    } catch (error) {
        console.error("Error fetching user:", error)
        throw error
    }
}

async function updateUserModel(user) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
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
    console.log("Creating user", username, email, password)
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

async function getUserModelByField(field, value) {
    try {
        let query = {};
        query[field] = value;
        const user = await User.findOne(query);

        if (user) {
            return user;
        } else {
            console.log(`User with field ${field} and value ${value} not found.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}

module.exports = {
    getAllUserModels,
    getUserModelByUsername,
    updateUserModel,
    createUserModel,
    getUserModelByField
}

