const User = require('../../models/User');
const userService = require('../userService');
const { getCurrentlyPlayingEpisode } = require('./playerService');
require('dotenv').config();

async function startPollingForUser(spotifyAccessToken) {
    setInterval(async () => {
        try {
            const episode = await getCurrentlyPlayingEpisode(spotifyAccessToken);
            console.log(`Polling again in ${parseInt(process.env.POLL_INTERVAL)} milliseconds`);
            if (episode) {
                await userService.addStream(spotifyAccessToken, episode.item.id);
            }
        } catch (error) {
            console.error("Error polling episodes for user:", error);
        } 
    }, parseInt(process.env.EPISODE_POLL_INTERVAL));



    // try {
    //     const episode = await getCurrentlyPlayingEpisode(spotifyAccessToken);
    //     console.log(`Polling again in ${parseInt(process.env.EPISODE_POLL_INTERVAL)} milliseconds`);
    //     if (episode) {
    //         await userService.addStream(spotifyAccessToken, episode.item.id);
    //     }
    // } catch (error) {
    //     console.error("Error polling episodes for user:", error);
    // } 
    // finally {
    //     // Wrap setTimeout in a Promise and await it before continuing
    //     await new Promise(resolve => {
    //         setTimeout(() => {
    //             resolve();
    //         }, parseInt(process.env.POLL_INTERVAL));
    //     })
    // }
    
}

async function listenForDatabaseChanges() {
    // Create change stream to monitor user documents
    // const userEventEmitter = User.watch();

    // Listen for changes in the user documents
    User.on('afterUpdate', function(user) {
        console.log("User updated: ", user)
        if (user.spotifyAccessToken) {
            startPollingForUser(user.spotifyAccessToken)
        }
    });
    // userEventEmitter.on('change', async (change) => {
    //     if (change.operationType === 'update' && change.updateDescription.updatedFields.spotifyAccessToken) {
    //         // If spotifyAccessToken field is updated, start polling with the new token
    //         const userId = change.documentKey._id;
    //         const { spotifyAccessToken } = change.updateDescription.updatedFields;

    //         console.log(`User ${userId} updated with Spotify access token. Starting polling...`);

    //         // Start polling with the new access token
    //         startPolling(spotifyAccessToken);
    //     }
    // });
}

exports.pollEpisodesForAllUsers = async () => {
    try {
        // await listenForDatabaseChanges();
        const users = await userService.getAllUsers()
        users.forEach(async user => {
            if (user.spotifyAccessToken) {
                startPollingForUser(user.spotifyAccessToken)
            }
        });
        console.log('Database change listener started.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}