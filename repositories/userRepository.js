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

exports.updateUserModel = async (filter, updatedUser) => {
    const user = await User.findOneAndUpdate(
        filter,
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

exports.searchUsersByUsername = async (query) => {
    const regexPattern = new RegExp("^" + query, "i"); // "i" flag for case-insensitive matching

    return User.find({ username: { $regex: regexPattern } })
}

