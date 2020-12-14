let mongoose = require('mongoose');
let sanPhamSchema = new mongoose.Schema({
    Name: String,
    User: String,
    Pass: String,
    Phone: String,
    Adress: String,
})
module.exports = sanPhamSchema;

