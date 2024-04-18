const User = require("../models/User")

exports.getAllUserModels = async () => {
    const users = await User.find()
    return users
}

exports.getUserModelByUsername = async (username) => {
    const user = await User.findOne({ username: username })
    return user
}

exports.getUserBySupaId = async (supaId) => {
    const user = await User.findOne({ supaId: supaId })
    return user
}

exports.updateUserModel = async (username, updatedUser) => {
    const user = await User.findOneAndUpdate(
        { username: username },
        updatedUser,
        { new: true }
    )
    return user
}

exports.createUserModel = async (username, supaId) => {
    const user = new User({
        username: username,
        supaId
    })
    await user.save()
    return user
}

exports.getUserModelByField = async (field, value) => {
    let query = {}
    query[field] = value
    const user = await User.findOne(query)

    return user
}

