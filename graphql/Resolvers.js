const User = require("../models/User");
const userService = require("../services/userService");
const playerService = require("../services/spotify/playerService")
const graphqlFields = require('graphql-fields');

const resolvers = {
    Query: {
        getUser: async (parent, args, context, info) => {
            try {

                const topLevelFields = graphqlFields(info);

                const streamingDataRequested = 'streamingData' in Object.keys(topLevelFields);
                let user;

                if (streamingDataRequested) {
                    user = await userService.getUserByUsername(context.username, true);
                } else {
                    user = await userService.getUserByUsername(context.username);
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
                console.log("Signing up:", username, email);
                const { user, accessToken } = await userService.signUp(username, email, password);
                return { user, accessToken };
            } catch (err) {
                console.error("Error creating user:", err);
                throw new Error("Failed to create user");
            }
        },
        logIn: async (_, { username, password }) => {
            try {
                console.log("Logging in:", username);
                return userService.logIn(username, password);
            } catch (err) {
                console.error("Error logging in:", err);
                throw new Error("Failed to log in");
            }
        },
        updateUser: async (_, { password, bio }, { username }) => {
            try {
                console.log("Updating user:", username);
                return userService.updateUser(username, { password, bio });
            } catch (err) {
                console.error("Error updating user:", err);
                throw new Error("Failed to update user");
            }
        },
        deleteUser: async (_, { id }) => {
            try {
                console.log("Deleting user:", id);
                const user = await User.findByIdAndRemove(id);
                return user;
            } catch (err) {
                console.error("Error deleting user:", err);
                throw new Error("Failed to delete user");
            }
        }
    }
};

module.exports = resolvers;
