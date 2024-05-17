const { AxiosError } = require('axios');
const User = require('../../models/User');
const userService = require('../userService');
const authService = require('./authService');
const { getCurrentlyPlayingEpisode } = require('./playerService');
require('dotenv').config();

exports.startPollingForUser = async (spotifyAccessToken) => {
    console.log("Polling for user with access token:", spotifyAccessToken)
    var refreshId = setInterval(async () => {
        try {
            const episode = await getCurrentlyPlayingEpisode(spotifyAccessToken);
            console.log(`Polling again in ${parseInt(process.env.EPISODE_POLL_INTERVAL)} milliseconds`);
            if (episode) {
                console.log(`Currently playing episode: ${episode.item.name}`);
                await userService.addStream(spotifyAccessToken, episode.item.id);
            }
        } catch (error) {
            console.error("Error polling episodes for user:", error);
            if (error.response?.status === 401) {
                clearInterval(refreshId);
                console.log("Access token expired. Stopping polling for user.");
                userService.removeAccessToken(spotifyAccessToken);
            }
        } 
    }, parseInt(process.env.EPISODE_POLL_INTERVAL));
    
}

exports.listenForDatabaseChanges = () => {
    User.on('afterUpdate', function(user) {
        console.log("User updated: ", user)
        if (user.spotifyAccessToken) {
            this.startPollingForUser(user.spotifyAccessToken)
        }
    });
}

exports.pollEpisodesForAllUsers = async () => {
    try {
        const users = await userService.getAllUsers()
        users.forEach(async user => {
            if (user.spotifyAccessToken) {
                this.startPollingForUser(user.spotifyAccessToken)
            }
            else {
                this.checkForNewAccessToken(user)
            }
        })
        this.listenForDatabaseChanges();
        console.log('Database change listener started. (it does not work)');
    } catch (error) {
        console.log("Error polling episodes for all users:", error)
    }
}

exports.checkForNewAccessToken = async (user) => {
    if (user.spotifyRefreshToken) {
        try {
            const newAccessToken = await authService.requestRefreshToken(user.spotifyRefreshToken)
            if (!newAccessToken) {
                console.error("Error refreshing access token for user:", user.username)
                return
            }
            await userService.updateUser(user.username, { spotifyAccessToken: newAccessToken })
            this.startPollingForUser(newAccessToken)
        } catch (error) {
            if (error instanceof AxiosError)
            console.error("Error refreshing access token for user:", error.code)
        }
    }
}