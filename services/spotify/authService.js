const querystring = require('querystring')
const axios = require('axios')
const { getUserByUsername, updateUser, saveState, getUsernameBySpotifyState} = require('../userService')
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

exports.requestRefreshToken = async (refreshToken) => {
    console.log("Requesting refresh token...")
    const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8').toString('base64')

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        data: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            clientId: clientId,
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${encodedCredentials}`
        }
    }

    axios(authOptions)
        .then(function(response) {
            // Success, handle response
            const responseData = response.data
            accessToken = responseData.access_token
            expiresIn = responseData.expires_in

            console.log("New Access Token:", accessToken)
            console.log("Expires In:", expiresIn)

            // Schedule the next token refresh before the current one expires
            // setTimeout(this.requestRefreshToken, expiresIn * 1000) // Convert expiresIn to milliseconds
        })
        .catch(function(error) {
            // Error handling
            console.error('Error:', error)
            if (error.response) {
                console.error('Status code:', error.response.status)
                console.error('Response data:', error.response.data)
            }
        })
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

        console.log("Successfully connected to Spotify")

        // Schedule the next token refresh before the current one expires
        setTimeout(this.requestRefreshToken, expiresIn * 1000) // Convert expiresIn to milliseconds

        // save access and refresh tokens to mongoDB
        user = await getUserByUsername(user.username)
        user.spotifyAccessToken = accessToken
        user.spotifyRefreshToken = refreshToken
        await updateUser(user.username, user)
    }
    catch (error) {
        console.error('Error:', error)
        res.redirect(process.env.CLIENT_URL + '/error')
    }
}

// in callback
// exports.requestToken = async (req, res) => {
//     try {
//         const code = req.query.code || null
//         const state = req.query.state || null
//         const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8').toString('base64')

//         const user = await getUsernameBySpotifyState(state)
//         if (!user) {
//             return res.send("Invalid state")
//         }

//         const username = user.username

//         if (state === null) {
//             res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }))
//         } else {
//             const authOptions = {
//                 url: 'https://accounts.spotify.com/api/token',
//                 method: 'post',
//                 data: {
//                     code: code,
//                     redirect_uri: redirectUri,
//                     grant_type: 'authorization_code'
//                 },
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                     'Authorization': `Basic ${encodedCredentials}`
//                 },
//                 json: true
//             }

//             axios(authOptions)
//                 .then(async function (response) {
//                     // Success, handle response
//                     const responseData = response.data
//                     accessToken = responseData.access_token
//                     expiresIn = responseData.expires_in
//                     refreshToken = responseData.refresh_token

//                     console.log("Access Token:", accessToken)
//                     console.log("Token Type:", responseData.token_type)
//                     console.log("Scope:", responseData.scope)
//                     console.log("Expires In:", expiresIn)
//                     console.log("Refresh Token:", refreshToken)

//                     // Schedule the next token refresh before the current one expires
//                     setTimeout(this.requestRefreshToken, expiresIn * 1000) // Convert expiresIn to milliseconds
//                     // save access and refresh tokens to mongoDB
//                     const user = await getUserByUsername(username)
//                     user.spotifyAccessToken = accessToken
//                     user.spotifyRefreshToken = refreshToken
//                     await updateUser(username, user)

//                     // Schedule polling for episodes
//                     // pollEpisodesForUser(username, accessToken)
//                 })
//                 .catch(function(error) {
//                     // Error handling
//                     console.error('Error requesting access token:', error)
//                     if (error.response) {
//                         console.error('Status code:', error.response.status)
//                         console.error('Response data:', error.response.data)
//                     }
//                 })
//         }
//     }
//     catch (error) {
//         console.error('Error:', error)
//         res.redirect(process.env.CLIENT_URL + '/error')
//     }
// }
