const User = require("../models/User");
const userService = require("../services/userService");
const playerService = require("../services/spotify/playerService");
const graphqlFields = require('graphql-fields'); // Add this line

const resolvers = {
    Query: {
        getUser: async (parent, args, context, info) => {
            try {

                const topLevelFields = graphqlFields(info);

                const streamingDataRequested = 'streamingData' in Object.keys(topLevelFields)
                const usernameRequested = 'username' in Object.keys(topLevelFields)

                let user = await userService.getUserByUsername(context.username, args.username, streamingDataRequested);
                
                // if (streamingDataRequested) {
                //     user = await userService.getUserByUsername(context.username, true);
                // } else {
                //     user = await userService.getUserByUsername(context.username);
                // }

                if (user.spotifyState) {
                    user.spotifyState = null
                    user.spotifyAccessToken = null
                    user.spotifyRefreshToken = null
                    user.spotifyConnected = true
                }
                else {
                    user.spotifyConnected = false
                }
                return user;
            } catch (err) {
                console.error("Error retrieving user:", err);
                throw new Error("Failed to retrieve user");
            }
        },
        getUsers: async () => {
            try {
                return userService.getAllUsers();
            } catch (err) {
                console.error("Error retrieving users:", err);
                throw new Error("Failed to retrieve users");
            }
        },
        getCurrentlyPlaying: async (parent, args, context, info) => {
            try {
                const episode = playerService.getCurrentlyPlayingEpisode(context.username);
                return episode;
            } catch (err) {
                console.error("Error retrieving currently playing episode:", err);
                throw new Error("Failed to retrieve currently playing episode");
            }
        }
    },
    Mutation: {
        signUp: async (_, { username, email, password }) => {
            try {
                console.log("Signing up:", username, email)
                const { user, jwt } = await userService.signUp(username, email, password)
                console.log("Signed up:", user.username, user.email)
                return { user, jwt }
            } catch (err) {
                console.error("Error creating user:", err)
                throw new Error("Failed to create user")
            }
        },
        logIn: async (_, { username, password }) => {
            try {
                console.log("Logging in:", username)
                const res = await userService.logIn(username, password)
                return res
            } catch (err) {
                console.error("Error logging in:", err)
                throw new Error("Failed to log in")
            }
        },
        updateUser: async (_, { password, bio }, { username }) => {
            try {
                console.log("Updating user:", username)
                return userService.updateUser(username, { password, bio })
            } catch (err) {
                console.error("Error updating user:", err)
                throw new Error("Failed to update user")
            }
        },
        deleteUser: async (_, { id }) => {
            try {
                console.log("Deleting user:", id)
                const user = await User.findByIdAndRemove(id)
                return user;
            } catch (err) {
                console.error("Error deleting user:", err)
                throw new Error("Failed to delete user")
            }
        }
    }
};

module.exports = resolvers;
