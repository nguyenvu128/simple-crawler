const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const projectchema = new Schema ({
    name: String,
    address: String,
    introduce: String,
    image: []
}, {timestamps: true});
const Project = new mongoose.model('Project', projectchema);
module.exports = Project;