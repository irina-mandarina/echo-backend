const { supabase } = require('../supabaseClient')

const authMiddleware = async (req, res, next) => {
    if (req.body?.query?.toLowerCase().replace(/\s/g, '').startsWith('mutationsignup')
            || 
        req.body?.query?.toLowerCase().replace(/\s/g, '').startsWith('mutationlogin')) {
        return next()
    }
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]
        // console.log('Token:', token)
        if (token && token !== 'null' && token !== 'undefined') {
            try {
                const { data: { user }, error } = await supabase.auth.getUser(token)
                if (error) throw error
                req.supaId = user.id
                console.log("User authenticated: ", user.id)
                return next()
            }
            catch(err) {
                console.error('Error:', err)
                return res.status(401).json({ error: 'Unauthorized' })
            }
        }
    }

    return res.status(401).json({ error: 'Unauthorized' })
}

module.exports = authMiddleware