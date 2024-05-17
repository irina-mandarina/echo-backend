const User = require("../models/User")
const userService = require("../services/userService")
const playerService = require("../services/spotify/playerService")
const episodeService = require("../services/spotify/episodeService")
const graphqlFields = require('graphql-fields') 
const { GraphQLError } = require('graphql')
// const { EchoError } = require("../util/errors")

exports.resolvers = {
    Query: {
        getUser: async (parent, args, { supaId }, info) => {
            try {
                const topLevelFields = graphqlFields(info)

                const streamingDataRequested = 'streamingData' in topLevelFields
                const usernameRequested = 'username' in Object.keys(args)
                
                let user = null

                if (usernameRequested) {
                    user = userService.getUserByUsername(args.username, streamingDataRequested)
                }
                else {
                    user = await userService.getUserBySupaId(supaId, streamingDataRequested)
                }

                if (user.spotifyAccessToken) {
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
        getUsers: async (parent, args, {supaId}, info) => {
            try {
                return userService.getAllUsers(args.query)
            } catch (err) {
                console.error("Error retrieving users:", err)
                throw new Error("Failed to retrieve users")
            }
        },
        getCurrentlyPlaying: async (parent, args, { supaId }, info) => {
            try {
                const episode = playerService.getCurrentlyPlayingEpisode(supaId)
                return episode
            } catch (err) {
                console.error("Error retrieving currently playing episode:", err)
                throw new Error("Failed to retrieve currently playing episode")
            }
        },
        getEpisodes: async (parent, { query, limit, offset}, { supaId }, info) => {
            try {
                const user = await userService.getUserBySupaId(supaId, false)
                if (!user.spotifyAccessToken) {
                    throw new Error("User has not connected their Spotify account")
                }    
                return episodeService.getEpisodes(query, limit, offset, user.spotifyAccessToken)
            } catch (err) {
                console.error("Error retrieving episodes:", err)
                throw new Error("Failed to retrieve episodes")
            }
        },
        getShows: async (parent, { query, limit, offset }, { supaId }, info) => {
            try {
                const user = await userService.getUserBySupaId(supaId, false)
                if (!user.spotifyAccessToken) {
                    throw new Error("User has not connected their Spotify account")
                }
                return episodeService.getShows(query, limit, offset, user.spotifyAccessToken)
            } catch (err) {
                console.error("Error retrieving shows:", err)
                throw new Error("Failed to retrieve shows")
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
        logIn: async (_, { identifier, password }, __, info) => {
            try {
                if (!identifier)
                    throw new Error("No identifier provided")
                if (!password)
                    throw new Error("No password provided")

                const topLevelFields = graphqlFields(info)

                const streamingDataRequested = 'streamingData' in Object.keys(topLevelFields)

                const { user, jwt } = await userService.logIn(identifier, password)

                if (user.spotifyAccessToken) {
                    user.spotifyConnected = true
                    if (streamingDataRequested) {
                        try {
                            user.streamingData = await episodeService.getEpisodesForUser(user.streamingData, user.spotifyAccessToken)
                        } catch (error) {
                            if (error.message === "No access token provided") {
                                user.streamingData = []
                            }
                        }
                    }
                    else{
                        user.streamingData = []
                    }
                }
                else {
                    user.spotifyConnected = false
                }

                

                // console.log("Logged in:", user)
                // console.log(user.streamingData)

                return { user, jwt }
            } catch (error) {
                throw new GraphQLError(error.message, {
                    extensions: {
                        code: 'UNAUTHORISED',
                    },
                })
            }
        },
        updateUser: async (_, { password, bio }, { supaId }) => {
            try {
                console.log("Updating user:", supaId)
                return userService.updateUser(supaId, { password, bio })
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
