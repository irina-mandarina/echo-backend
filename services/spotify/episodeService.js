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

exports.getEpisodesForUser = async (streamingData, spotifyAccessToken) => {
    if (!streamingData) return []
    if (!spotifyAccessToken) throw new Error("No access token provided")
    // console.log("Streaming data:", streamingData)
    const episodesPromises = streamingData.map(async (stream) => {
        // console.log("Getting episode for stream", stream)
        try {
            const episode = await this.getEpisodeById(stream.episodeId, spotifyAccessToken)
            console.log("Episode:", episode.name)
            return episode
        } catch (error) {
            console.error("Error fetching episode:", stream.episode, "Error:", error.response?.data)
        }
    })
    const episodes = await Promise.all(episodesPromises)
    console.log("Episodes promises:", episodes.length)
    return episodes ?? []
}

exports.getEpisodes = async (query, limit, offset, spotifyAccessToken) => {
    const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        params: {
            q: query,
            limit: limit,
            offset: offset,
            type: "episode"
        }
    })
    console.log("Episodes response:", response.data)
    return response.data.items
}

exports.getShows = async (query, limit, offset, spotifyAccessToken) => {
    const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        params: {
            q: query,
            limit: limit,
            offset: offset,
            type: "show"
        }
    })
    console.log("Shows response:", response.data)
    return response.data.items
}
