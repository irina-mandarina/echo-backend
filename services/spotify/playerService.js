const axios = require('axios')
const { getUserByUsername } = require('../userService')
require('dotenv').config()

const accessToken = process.env.REFRESH_TOKEN

async function getCurrentlyPlayingEpisode() {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing?additional_types=episode', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    console.log(response.data)
    return response.data
}

async function pollEpisodes() {
    const episode = await getCurrentlyPlayingEpisode()
    if (episode) {

    }
}

async function getEpisodeById(id) {
    const response = await axios.get(`https://api.spotify.com/v1/episodes/${id}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    return response.data
}


module.exports = {
    getCurrentlyPlayingEpisode,
    pollEpisodes,
    getEpisodeById
}