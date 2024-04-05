const { supabase } = require('../supabaseClient')

const authMiddleware = (req, res, next) => {
    if (req.body?.query?.toLowerCase().replace(/\s/g, '').startsWith('mutationsignup')
            || 
        req.body?.query?.toLowerCase().replace(/\s/g, '').startsWith('mutationlogin')) {
        return next()
    }
    // if (req.method === 'OPTIONS') {
    //     if (req.headers.origin !== process.env.CLIENT_URL) {
    //         return res.status(403).json({ error: 'Forbidden' })
    //     }
    //     return next()
    // }
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]
        console.log('Token:', token)
        if (token) {
            try {
                const { user, error } = supabase.auth.api.getUser(token)
                if (error) throw error
                req.userSupaId = user.id
                return next()
            }
            catch(err) {
                return res.status(401).json({ error: 'Unauthorized' })
            }
        }
    }

    return res.status(401).json({ error: 'Unauthorized' })
}

module.exports = authMiddleware