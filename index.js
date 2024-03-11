const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer, gql } = require('apollo-server-express');
const schema = require("./graphql/Schema");
const resolvers = require("./graphql/Resolvers");
const helmet = require('helmet');
const { spotifyLogIn, requestToken } = require("./services/spotify/authService");

const app = express();
const PORT = 8080;

mongoose.connect("mongodb://127.0.0.1:27017/echo", {
    useNewUrlParser: true
});
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
});

const apolloServer = new ApolloServer({
    schema,
    resolvers,
    context: ({ req }) => ({ username: req.username })
});

async function startApolloServer() {
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
}

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:8080"]
    }
}));

startApolloServer().then(() => {
    app.get('/login', spotifyLogIn);
    app.get('/callback', requestToken);

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}/`);
    });
});
