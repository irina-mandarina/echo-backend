const express = require("express")
const mongoose = require("mongoose")
const { ApolloServer, gql } = require('apollo-server-express')
const typeDefs = require("./graphql/typeDefs")
const { resolvers } = require("./graphql/Resolvers")
const authService = require("./services/spotify/authService")
const authMiddleware = require("./middleware/authMiddleware")
const { pollEpisodesForAllUsers } = require("./services/spotify/pollingService")
const bodyParser = require("body-parser")
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = parseInt(process.env.PORT)

const corsOptions = {
    origin: process.env.CLIENT_URL,
    optionsSuccessStatus: 200
}

mongoose.connect("mongodb://127.0.0.1:27017/echo")
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
})

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(['/graphql', '/spotify-login-token'], authMiddleware)

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context:  ({ req }) => ({
        userSupaId: req.userSupaId,
        selection: req.selection
    }),
    // formatError: (error) => {
    //     // Call your middleware function after formatting the error
    //     // errorHandlerMiddleware(error, context);
    //     console.log("In formaterror")
    //     // Return the formatted error
    //     return error;
    //   }
})

async function startApolloServer() {
    await apolloServer.start()
    apolloServer.applyMiddleware({ app, cors: corsOptions })
}

startApolloServer().then(() => {
    pollEpisodesForAllUsers()
    app.get('/spotify-login', authService.spotifyLogIn)
    app.get('/spotify-callback', authService.requestToken)
    app.get('/spotify-login-token', authService.getSpotifyLogInToken)

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}/graphql`)
    })
})