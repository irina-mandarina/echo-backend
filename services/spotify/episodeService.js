const axios = require('axios')

exports.getEpisodeById = async (id, spotifyAccessToken) => {
    const response = await axios.get(`https://api.spotify.com/v1/episodes/${id}`, {
        headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    return response.data
}

exports.getEpisodesForUser = async (streamingData) => {
    if (!streamingData) return []

    const episodesPromises = streamingData.map(async (stream) => {
        const episodeId = stream.episodeId
        return await getEpisodeById(episodeId)
    })

    return await Promise.all(episodesPromises) ?? []
}
