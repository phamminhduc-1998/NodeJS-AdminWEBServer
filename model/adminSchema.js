let mongoose = require('mongoose');//cau hinh mongoose
let adminSchema = new mongoose.Schema({
    Username: String,
    EmailAddress: String,
    Password: String,
    ConfirmPassword: String,
})

module.exports = adminSchema;