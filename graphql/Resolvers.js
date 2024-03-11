const User = require("../models/User")
const { getUserByUsername, getAllUsers, signUp, updateUser, logIn } = require("../services/userService")

const resolvers = {
    getUser: async ({ username }, { requestedFields }, context) => {
        try {
            console.log(context.username)
            const streamingDataRequested = requestedFields.contains('streamingData');

            // If 'streamingData' is requested, call getUserByUsername with the additional flag
            if (streamingDataRequested) {
                const user = await getUserByUsername(username, true);
                return user;
            } else {
                // Otherwise, call getUserByUsername without the flag
                const user = await getUserByUsername(username);
                return user;
            }
        } catch (err) {
            throw new Error("Error retrieving user")
        }
    },
    getUsers: async () => {
        try {
            return getAllUsers()
        } catch (err) {
            throw new Error("Error retrieving users")
        }
    },
    signUp: async ({ username, email, password }) => {
        try {
            return signUp(username, email, password)
        } catch (err) {
            throw new Error("Error creating user")
        }
    },
    logIn: async ({ username, password }) => {
        try {
            return logIn(username, password)
        } catch (err) {
            throw new Error("Error logging in")
        }
    },
    updateUser: async ({ password, bio }, _, context) => {
        try {
            return updateUser(context.username,{ password, bio })
        } catch (err) {
            throw new Error("Error updating user")
        }
    },
    deleteUser: async ({ id }) => {
        try {
            const user = await User.findByIdAndRemove(id)
            return user
        } catch (err) {
            throw new Error("Error deleting user")
        }
    },
}

module.exports = resolvers