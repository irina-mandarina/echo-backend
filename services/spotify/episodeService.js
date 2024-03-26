const axios = require('axios')

async function getEpisodeById(id, spotifyAccessToken) {
    const response = await axios.get(`https://api.spotify.com/v1/episodes/${id}`, {
        headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    return response.data
}

module.exports = {  
    getEpisodeById
}