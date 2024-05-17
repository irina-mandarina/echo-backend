const {gql} = require('apollo-server-express')

const typeDefs = gql`
    type User {
        username: String!
        bio: String
        dateOfRegistration: String
        streamingData: [Stream]
        spotifyConnected: Boolean
    }
    
    type Stream {
        episode: Episode!
        timestamps: [String]
    }
    
    type Episode {
        id: String!
        name: String!
        description: String
        release_date: String
        duration_ms: Int
        audio_preview_url: String
        uri: String
        images: [Image]
        show: Show
    }
    
    type Image {
        url: String
        width: Int
        height: Int
    }
    
    type Show {
        available_markets: [String]
        description: String
        html_description: String
        explicit: Boolean
        id: String
        images: [Image]
        is_externally_hosted: Boolean
        languages: [String]
        media_type: String
        name: String
        publisher: String
        type: String
        uri: String
        total_episodes: Int
    }
    
    type Query {
        getUser(username: String): User
        getUsers(query: String): [User]
        getCurrentlyPlaying: Episode
        getEpisodes(query: String, limit: Int, offset: Int): [Episode]
        getShows(query: String, limit: Int, offset: Int): [Show]
    }
    
    type AuthResponse {
        user: User
        jwt: String
        refreshToken: String
    }
    
    type Mutation {
        signUp(username: String!, email: String!, password: String!): AuthResponse
        logIn(identifier: String!, password: String!): AuthResponse
        updateUser(id: ID!, name: String, email: String, password: String): User
        deleteUser(id: ID!): User
    }
`

module.exports = typeDefs