let mongoose = require('mongoose');
let productSchema = new mongoose.Schema({
    Type:String,
    Name:String,
    Price:String,
    Img:String,

})
module.exports = productSchema;