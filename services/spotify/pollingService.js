const User = require('../../models/User');
const userService = require('../userService');
const { getCurrentlyPlayingEpisode } = require('./playerService');
require('dotenv').config();

async function startPollingForUser(spotifyAccessToken) {
    console.log("Polling for user with access token:", spotifyAccessToken)
    var refreshId = setInterval(async () => {
        try {
            const episode = await getCurrentlyPlayingEpisode(spotifyAccessToken);
            console.log(`Polling again in ${parseInt(process.env.POLL_INTERVAL)} milliseconds`);
            if (episode) {
                await userService.addStream(spotifyAccessToken, episode.item.id);
            }
        } catch (error) {
            console.error("Error polling episodes for user:", error);
            if (error.response?.status === 401) {
                clearInterval(refreshId);
            }
        } 
    }, parseInt(process.env.EPISODE_POLL_INTERVAL));
    
}

async function listenForDatabaseChanges() {
    User.on('afterUpdate', function(user) {
        console.log("User updated: ", user)
        if (user.spotifyAccessToken) {
            startPollingForUser(user.spotifyAccessToken)
        }
    });
}

exports.pollEpisodesForAllUsers = async () => {
    try {
        const users = await userService.getAllUsers()
        users.forEach(async user => {
            if (user.spotifyAccessToken) {
                startPollingForUser(user.spotifyAccessToken)
            }
        })
        listenForDatabaseChanges();
        console.log('Database change listener started. (it does not work)');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}