var Crawler = require("crawler");
const connectDatabase = require('./database/database');
var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($("title").text());
        }
        done();
    }
});

connectDatabase(() => {
    // Queue just one URL, with default callback
    c.queue('https://batdongsan.com.vn/can-ho-chung-cu-dong-da/chung-cu-green-building-pj4886');
});
