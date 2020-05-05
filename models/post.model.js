const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const postSchema = new Schema({
    title: String,
    price: Number,
    unit: String,
    area: String,
    introduce: String,
    images: [String],
    postType: String,
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

const Post = new mongoose.model('Post', postSchema);
module.exports = Post;