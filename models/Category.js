let mongoose = require('mongoose');
let categorySchema = require('../schemas/category');

module.exports = mongoose.model('Category',categorySchema);