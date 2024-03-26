const {getUsername} = require('../services/jwtService')

const authMiddleware = (req, res, next) => {
    if (req.body?.query?.toLowerCase().startsWith('mutation signup') || req.body?.query?.toLowerCase().startsWith('mutation login')) {
        console.log(next)
        return next();
    }
    if (req.method === 'OPTIONS') {
        if (req.headers.origin !== process.env.CLIENT_URL) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        return next();
    }
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];

        if (token) {
            const username = getUsername(token);
            req.username = username;
            return next();
        }
    }

    return res.status(401).json({ error: 'Unauthorized' });
};

module.exports = authMiddleware;