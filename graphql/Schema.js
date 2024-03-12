const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type User {
    id: ID!
    username: String!
    email: String!
    bio: String
    dateOfRegistration: String
    streamingData: [Stream]
  }
  
  type Stream {
    episode: Episode!
    timestamp: String!
  }
  
  type Episode {
    id: ID!
    title: String!
    description: String
    audioPreviewUrl: String
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
    id: ID!
    uri: String!
    name: String!
    publisher: String
    description: String
    totalEpisodes: Int
    images: [Image]
  }

  type Query {
    getUser(username: String): User
    getUsers: [User]
    getCurrentlyPlaying: Episode
  }
  
  type AuthResponse {
    user: User
    accessToken: String
    refreshToken: String
  }

  type Mutation {
    signUp(username: String!, email: String!, password: String!): AuthResponse
    logIn(email: String!, password: String!): AuthResponse
    updateUser(id: ID!, name: String, email: String, password: String): User
    deleteUser(id: ID!): User
  }
`);

module.exports = schema;