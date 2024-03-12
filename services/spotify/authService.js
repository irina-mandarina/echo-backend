const { getUsername } = require('../jwtService')

const querystring = require('querystring')
const axios = require('axios')
const { getUserByUsername, updateUser } = require('../userService')

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = 'http://localhost:8080/callback';

let accessToken = null;
let refreshToken = null;
let expiresIn = 0;

function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomString += charset[randomIndex];
    }
    return randomString;
}

function requestRefreshToken() {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        data: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64'))
        }
    };

    axios(authOptions)
        .then(function(response) {
            // Success, handle response
            const responseData = response.data;
            accessToken = responseData.access_token;
            expiresIn = responseData.expires_in;

            console.log("New Access Token:", accessToken);
            console.log("Expires In:", expiresIn);

            // Schedule the next token refresh before the current one expires
            setTimeout(requestRefreshToken, expiresIn * 1000); // Convert expiresIn to milliseconds
        })
        .catch(function(error) {
            // Error handling
            console.error('Error:', error);
            if (error.response) {
                console.error('Status code:', error.response.status);
                console.error('Response data:', error.response.data);
            }
        });
}

function spotifyLogIn(req, res) {

    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email user-read-playback-state user-read-currently-playing user-follow-read';

    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`);
}

// in callback
function requestToken(req, res) {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null) {
        res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    } else {
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            method: 'post',
            data: querystring.stringify({
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64'))
            }
        };

        axios(authOptions)
            .then(async function (response) {
                // Success, handle response
                const responseData = response.data;
                accessToken = responseData.access_token;
                expiresIn = responseData.expires_in;
                refreshToken = responseData.refresh_token;

                console.log("Access Token:", accessToken);
                console.log("Token Type:", responseData.token_type);
                console.log("Scope:", responseData.scope);
                console.log("Expires In:", expiresIn);
                console.log("Refresh Token:", refreshToken);

                // Schedule the next token refresh before the current one expires
                setTimeout(requestRefreshToken, expiresIn * 1000); // Convert expiresIn to milliseconds

                // save access and refresh tokens to mongoDB
                const user = await getUserByUsername(username)
                user.spotifyAccessToken = accessToken
                user.spotifyRefreshToken = refreshToken
                await updateUser(user)
            })
            .catch(function(error) {
                // Error handling
                console.error('Error:', error);
                if (error.response) {
                    console.error('Status code:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
            });
    }
}

module.exports = {
    spotifyLogIn,
    requestToken,
    requestRefreshToken,
}