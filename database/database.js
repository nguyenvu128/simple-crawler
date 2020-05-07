const mongoose = require('mongoose');

module.exports = (callback) => {
    mongoose.connect(process.env.mongo_uri, {useNewUrlParser: true}, function(err){
        if(err) {
            console.log(err);
            //throw err;
        } else {
            console.log('Connect to database successfully');
            callback();
        }
    });
};
