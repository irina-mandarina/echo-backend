const User = require("../models/User")
const userService = require("../services/userService")
const playerService = require("../services/spotify/playerService")
const graphqlFields = require('graphql-fields') 
const { GraphQLError } = require('graphql')
// const { EchoError } = require("../util/errors")

exports.resolvers = {
    Query: {
        getUser: async (parent, args, { userSupaId }, info) => {
            try {
                const topLevelFields = graphqlFields(info)

                const streamingDataRequested = 'streamingData' in Object.keys(topLevelFields)
                const usernameRequested = 'username' in Object.keys(topLevelFields)

                let user = null

                if (usernameRequested) {
                    user = userService.getUserByUsername(args.username, streamingDataRequested)
                }
                else {
                    user = await userService.getUserBySupaId(userSupaId, streamingDataRequested)
                }

                if (user.spotifyState) {
                    user.spotifyConnected = true
                }
                else {
                    user.spotifyConnected = false
                }
                return user
            } catch (err) {
                console.error("Error retrieving user:", err)
                throw new Error("Failed to retrieve user")
            }
        },
        getUsers: async () => {
            try {
                return userService.getAllUsers()
            } catch (err) {
                console.error("Error retrieving users:", err)
                throw new Error("Failed to retrieve users")
            }
        },
        getCurrentlyPlaying: async (parent, args, { userSupaId }, info) => {
            try {
                const episode = playerService.getCurrentlyPlayingEpisode(userSupaId)
                return episode
            } catch (err) {
                console.error("Error retrieving currently playing episode:", err)
                throw new Error("Failed to retrieve currently playing episode")
            }
        }
    },
    Mutation: {
        signUp: async (_, { username, email, password }) => {
            if (!username)
                throw new Error("No username provided")
            if (!email)
                throw new Error("No email provided")
            if (!password)
                throw new Error("No password provided")
            
            try {
                console.log("Signing up:", username, email)
                const res = await userService.signUp(username, email, password)
                return res
            } catch (error) {
                throw new GraphQLError(error.message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                })
            }
        },
        logIn: async (_, { identifier, password }) => {
            try {
                
                if (!identifier)
                    throw new Error("No identifier provided")
                if (!password)
                    throw new Error("No password provided")

                console.log("Logging in:", identifier)
                const res = await userService.logIn(identifier, password)
                return res
            } catch (error) {
                throw new GraphQLError(error.message, {
                    extensions: {
                        code: 'UNAUTHORISED',
                    },
                })
            }
        },
        updateUser: async (_, { password, bio }, { userSupaId }) => {
            try {
                console.log("Updating user:", userSupaId)
                return userService.updateUser(userSupaId, { password, bio })
            } catch (err) {
                console.error("Error updating user:", err)
                throw new Error("Failed to update user")
            }
        },
        deleteUser: async (_, { id }) => {
            try {
                console.log("Deleting user:", id)
                const user = await User.findByIdAndRemove(id)
                return user
            } catch (err) {
                console.error("Error deleting user:", err)
                throw new Error("Failed to delete user")
            }
        }
    }
}
