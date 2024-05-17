const querystring = require('querystring')
const axios = require('axios')
const { getUserByUsername, updateUser, saveState, getUsernameBySpotifyState} = require('../userService')
const { getUserModelByField } = require('../../repositories/userRepository')
require('dotenv').config()

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const redirectUri = 'http://localhost:8080/spotify-callback'

let accessToken = null
let refreshToken = null
let expiresIn = 0

exports.generateRandomString = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let randomString = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        randomString += charset[randomIndex]
    }
    return randomString
}

exports.saveNewSpotifyAccessToken = async (refreshToken) => {
    console.log("Requesting access token. Refresh token: ", refreshToken)
    const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8').toString('base64')

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                clientId
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${encodedCredentials}`
                }
            }
        )

        const responseData = response.data
        accessToken = responseData.access_token
        expiresIn = responseData.expires_in

        console.log("New Access Token:", accessToken)
        console.log("Expires In:", expiresIn)

        // save access and refresh tokens to mongoDB
        const user = await getUserModelByField('spotifyRefreshToken', refreshToken)
        if (!user) {
            console.error("User not found with refresh token:", refreshToken)
            return null
        }
        updateUser(user.username, { spotifyAccessToken: accessToken, spotifyRefreshToken: refreshToken })

        return accessToken
    }
    catch (error) {
        console.error("Error refreshing access token. Description:", error.response?.data?.error_description)
        return null
    }
}

exports.getSpotifyLogInToken = async (req, res) => {
    const state = this.generateRandomString(16)
    await saveState(req.supaId, state)
    console.log("State:", state)
    console.log("Supabase User Id:", req.supaId)
    res.send({ state })
}

exports.spotifyLogIn = async (req, res) => {
    const scope = 'user-read-private user-read-email user-read-playback-state user-read-currently-playing user-follow-read'
    const state = req.query.state
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`)
}

exports.requestToken = async (req, res) => {
    const code = req.query.code || null
    const state = req.query.state || null
    if (state === null) {
        res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }))
    }
    const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8').toString('base64')

    let user = await getUsernameBySpotifyState(state)
    if (!user) {
        return res.send("Invalid state")
    }

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token', 
            {
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${encodedCredentials}`
                },
                json: true        
            }
        )

        const responseData = response.data
        accessToken = responseData.access_token
        expiresIn = responseData.expires_in
        refreshToken = responseData.refresh_token

        console.log("[requestToken] Refresh Token:", refreshToken)
        // Schedule the next token refresh before the current one expires
        setTimeout(() => this.saveNewSpotifyAccessToken(refreshToken), expiresIn * 1000) // Convert expiresIn to milliseconds

        // save access and refresh tokens to mongoDB
        user = await getUserByUsername(user.username)
        user.spotifyAccessToken = accessToken
        user.spotifyRefreshToken = refreshToken
        await updateUser(user.username, user)

        console.log("Successfully connected to Spotify")
    }
    catch (error) {
        if (error instanceof axios.AxiosError)
            console.error("Error requesting access token. Description:", error.response?.data)
        else 
            console.error("Error requesting access token. Description:", error)
        res.redirect(process.env.CLIENT_URL + '/error')
    }
}