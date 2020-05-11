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
    city: String,
    district: String,
    ward: String,
    street: String,
    url: String,
    projectName: String,
    projectId: ObjectId,
    bedrooms: Number,
    toilets: Number,
    contactName: String,
    contactAddress: String,
    contactEmail: String,
    code: String,
    vipPostType: Number,
    postedAt: Date,
    expiredAt: Date,
    slug: String
}, {timestamps: true});

const Post = new mongoose.model('Post', postSchema);
module.exports = Post;