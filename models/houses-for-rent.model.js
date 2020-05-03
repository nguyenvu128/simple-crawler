const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const housesForRentSchema = new Schema({
    title: String,
    price: String,
    area: String,
    introduce: String,
    images: [String],
    postTypes: String,
    address: String,
    bedrooms: String,
    toilets: String,
    contactName: String,
    contactAddress: String,
    contactEmail: String,
    code: String,
    vipPostType: String,
    postedAt: String,
    expiredAt: String,
    slug: String
}, {timestamps: true});

const HouseForRent = new mongoose.model('HouseForRent', housesForRentSchema);
module.exports = HouseForRent;