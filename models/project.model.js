const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const projectchema = new Schema ({
    id: ObjectId,
    name: String,
    address: string,
    introduce: String,
    image: String
}, {timestamps: true});
const Project = new mongoose.model('Project', projectchema);
module.exports = Project;