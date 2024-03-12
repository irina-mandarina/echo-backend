const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer, gql } = require('apollo-server-express');
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/Resolvers");
const helmet = require('helmet');
const { spotifyLogIn, requestToken } = require("./services/spotify/authService");
const authMiddleware = require("./middleware/authMiddleware");
const bodyParser = require("body-parser");
//
const app = express();
const PORT = 8080;

mongoose.connect("mongodb://127.0.0.1:27017/echo");
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
});

app.use(bodyParser.json());
app.use(authMiddleware);


const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context:  ({ req }) => ({
        username: req.username,
        selection: req.selection
    })
});

async function startApolloServer() {
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
}

// app.use(helmet.contentSecurityPolicy({
//     directives: {
//         defaultSrc: ["'self'"],
//         connectSrc: ["'self'", "http://localhost:8080/graphql"],
//     }
// }));

startApolloServer().then(() => {
    app.get('/login', spotifyLogIn);
    app.get('/callback', requestToken);

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}/graphql`);
    });
});

//
// const express = require('express');
// const { ApolloServer, gql } = require('apollo-server-express');
//
// // Define your GraphQL schema
// const typeDefs = gql`
//     type User {
//         id: ID!
//         username: String!
//         email: String!
//     }
//
//     type Query {
//         getUser(id: ID!): User
//     }
// `;
//
// // Define your resolver function
// const resolvers = {
//     Query: {
//         getUser:  (_, { id }) => {
//             try {
//                 // Call the getUserById function from userService
//                 const user =  { id: 1, username: 'test', email: 'fnkejfref'};
//                 return user;
//             } catch (error) {
//                 console.error('Error retrieving user:', error);
//                 throw new Error('Failed to retrieve user');
//             }
//         }
//     }
// };
//
// // Create an Express app
// const app = express();
//
// // Create an ApolloServer instance and apply it to the Express app
// const server = new ApolloServer({
//     typeDefs,
//     resolvers,
// });
//
// async function startApolloServer() {
//     await server.start();
// }
//
// startApolloServer().then(() => {
//     // Apply ApolloServer middleware to the Express app
//     server.applyMiddleware({ app });
//
//     // Start the server
//     const PORT = process.env.PORT || 4000;
//     app.listen(PORT, () => {
//         console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
//     });
// });
