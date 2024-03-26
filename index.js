const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer, gql } = require('apollo-server-express');
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/Resolvers");
const helmet = require('helmet');
const { spotifyLogIn, requestToken, getSpotifyLogInToken } = require("./services/spotify/authService");
const authMiddleware = require("./middleware/authMiddleware")
const bodyParser = require("body-parser")
const cors = require('cors')

const app = express();
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
        username: req.username,
        selection: req.selection
    })
})

async function startApolloServer() {
    await apolloServer.start()
    apolloServer.applyMiddleware({ app, cors: corsOptions })
}

// app.use(helmet.contentSecurityPolicy({
//     directives: {
//         defaultSrc: ["'self'"],
//         connectSrc: ["'self'", "http://localhost:8080/graphql"],
//     }
// }));

startApolloServer().then(() => {
    app.get('/spotify-login', spotifyLogIn)
    app.get('/spotify-callback', requestToken)
    app.get('/spotify-login-token', getSpotifyLogInToken)

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}/graphql`)
    });
});