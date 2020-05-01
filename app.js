var Crawler = require("crawler");
const connectDatabase = require('./database/database');
const projectModel = require('./models/project.model');
var c = new Crawler({
    maxConnections : 10,
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            const projectName = $('div.prj-right > div:nth-child(2) > div.fr').text();

            const address = $('div.prj-right > div:nth-child(3) > div.fr').text();

            const introduce = $('div.prj-noidung.a1').text();

            const image = $('#imgslide img').map((index, ele) => {
                return ele.attribs.src;
            }).get();

            const project = new projectModel({
                name: projectName,
                address: address,
                introduce: introduce,
                image: image
            });
            console.log(project);
            project.save();
        }
        done();
    }
});

connectDatabase(() => {
    // Queue just one URL, with default callback
    c.queue('https://batdongsan.com.vn/can-ho-chung-cu-dong-da/chung-cu-green-building-pj4886');
});
