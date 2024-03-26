const axios = require('axios')
const userService = require('../userService')
require('dotenv').config()

async function getCurrentlyPlayingEpisode(spotifyAccessToken) {
    try {
        const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing?additional_types=episode', {
            headers: {
                Authorization: `Bearer ${spotifyAccessToken}`
            }
        })
        console.log(response.data)
        return response.data
    }
    catch (error) {
        console.error("Error getting currently playing episode:", error)
        throw error
    }
}

async function pollEpisodesForUser(username, spotifyAccessToken) {
    try {
        const episode = await getCurrentlyPlayingEpisode(spotifyAccessToken);
        console.log(`Polling again in ${parseInt(process.env.EPISODE_POLL_INTERVAL)} milliseconds`);
        if (episode) {
            console.log(`Currently playing episode for ${username}: ${episode.item.name}`);
            await userService.addStream(username, episode.item.id);
        }
    } catch (error) {
        console.error("Error polling episodes for user:", error);
    } 
    finally {
        // Wait for the specified interval before polling again
        setTimeout(() => pollEpisodesForUser(username, spotifyAccessToken), parseInt(process.env.POLL_INTERVAL));
    }
}



module.exports = {
    getCurrentlyPlayingEpisode,
    pollEpisodesForUser
}