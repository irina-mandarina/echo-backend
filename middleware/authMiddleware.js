import {getUsername} from "../services/jwtService";

const authMiddleware = (req, res, next) => {
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