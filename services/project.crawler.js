const Crawler = require("crawler");
const ProjectModel = require('../models/project.model');
const slug = require('slug');
const helper = require('./helper');
require('dotenv').config();


const detailCrawler = new Crawler({
    rateLimit: 2000,
    maxConnections : 1,
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            const $ = res.$;
            const projectName = helper.removeBreakLineCharacter($('div.prj-right > div:nth-child(2) > div.fr').text());
            const projectSlug = slug(projectName).toLowerCase();
            const address = helper.removeBreakLineCharacter($('div.prj-right > div:nth-child(3) > div.fr').text());
            const introduce = helper.removeBreakLineCharacter($('div.prj-noidung.a1').text());
            const url = '/' + res.options.uri.split('/').pop();
            const image = $('#imgslide img').map((index, ele) => {
                return ele.attribs.src;
            }).get();

            // const gallery = $('').map((index, ele) => {
            //     console.log(ele)
            //     return ele.attribs.src;
            // }).get();

            const project = new ProjectModel({
                name: projectName,
                address: address,
                introduce: introduce,
                url: url,
                image: image,
                //gallery: gallery,
                slug: projectSlug
            });
            console.log(projectName);

            ProjectModel.findOne({slug: projectSlug})
                .exec((err, duplicatedProject) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    if(duplicatedProject){
                        console.log('Duplicated project name: ', projectName);
                        done();
                        return;
                    }

                    project.save(function (err) {
                        if(err){
                            console.error(err);
                            return;
                        }
                        done();
                    });
            })
        }
    }
});

const listCrawler = new Crawler({
    rateLimit: 2000,
    maxConnections : 1,
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            const $ = res.$;
            const links = $('.prj-list ul > li > div.thumb > a').map((index, ele) => {
                return 'https://batdongsan.com.vn' + ele.attribs.href;
            }).get();
            links.forEach(url => detailCrawler.queue(url));
        }
        done();
    }
});
module.exports = () => {
    const pagePatern = 'https://batdongsan.com.vn/can-ho-chung-cu/p';
    const pages = parseInt(process.env.crawler_project_page);
    for(let i = 1; i <= pages; i++) {
        listCrawler.queue(pagePatern + i);
    }
}