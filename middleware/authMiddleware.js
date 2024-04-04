const {getUsername} = require('../services/jwtService')

const authMiddleware = (req, res, next) => {
    if (req.body?.query?.toLowerCase().replace(/\s/g, '').startsWith('mutationsignup')
            || 
        req.body?.query?.toLowerCase().replace(/\s/g, '').startsWith('mutationlogin')) {
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
        console.log('Token:', token)
        if (token) {
            try {
                const username = getUsername(token)
                req.username = username;
                return next();
            }
            catch(err) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }
    }

    return res.status(401).json({ error: 'Unauthorized' });
};

module.exports = authMiddleware;