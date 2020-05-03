const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const projectSchema = new Schema ({
    name: String,
    address: String,
    introduce: String,
    image: [String],
    //gallery: [String],
    slug:String
}, {timestamps: true});
const Project = new mongoose.model('Project', projectSchema);

module.exports = Project;