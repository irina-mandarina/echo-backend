const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

exports.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
})


exports.supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
})