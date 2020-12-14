let mongoose = require('mongoose');//cau hinh mongoose
let billSchema = new mongoose.Schema({
    NameProducts: String,
    User: String,
    Price: String,
    
})

module.exports = billSchema;