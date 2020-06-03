const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const userSchema = new Schema ({
    email: String,
    password: String,
    address: String,
    name: String,
    age: Number,
    phone: Number,
    gender: String,
    avatar: String,
    role: Number
});

const User = new mongoose.model("User", userSchema);
module.exports = User;