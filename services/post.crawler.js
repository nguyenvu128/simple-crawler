const Crawler = require('crawler');
const PostModel = require('../models/post.model');
const slug = require('slug');
const helper = require('./helper');

const crawlPrice = (str) => {
    return str.split(" ");
}

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
            const title = helper.removeBreakLineCharacter($('#product-detail > div.pm-title > h1').text());
            const titleSlug = slug(title).toLowerCase();
            const price = helper.removeBreakLineCharacter($('.kqchitiet > span > span.gia-title.mar-right-15 > strong').text());

            let newPrice = [];
            if(price == null || price === 'Thỏa thuận'){
                newPrice.push(-1);
                newPrice.push('');
            }else {
                 newPrice = crawlPrice(price);
            }

            const area = helper.removeBreakLineCharacter($('#product-detail span:nth-child(2) > strong').text());
            const introduce = helper.removeBreakLineCharacter($('#product-detail > div.pm-content > div.pm-desc').text());
            const images = $('#thumbs img').map((index, ele) => {
                return ele.attribs.src;
            }).get();
            const postType = helper.removeBreakLineCharacter($('#product-other-detail > div:nth-child(1) > div.right').text());
            const address = helper.removeBreakLineCharacter($('#product-other-detail > div:nth-child(2) > div.right').text());
            const bedrooms = helper.removeBreakLineCharacter($('#LeftMainContent__productDetail_roomNumber .right').text());
            const toilets = helper.removeBreakLineCharacter($('#LeftMainContent__productDetail_toilet .right').text());
            const contactName = helper.removeBreakLineCharacter($('.divContactName').text());
            let contactAddress = $('#LeftMainContent__productDetail_contactAddress .right').text();

            const contactEmail = helper.removeBreakLineCharacter($('#contactEmail > div.right.contact-email').html());
            const code = helper.removeBreakLineCharacter($('#product-detail > div.prd-more-info > div > div').text());
            const vipPostType = $('#ltrVipType').text();
            const postedAt = helper.removeBreakLineCharacter($('#product-detail > div.prd-more-info > div:nth-child(3)').text());
            const expiredAt = helper.removeBreakLineCharacter($('#product-detail > div.prd-more-info > div:nth-child(4)').text());

            const post = new PostModel({
                title: title,
                price: newPrice[0],
                unit: newPrice[1],
                area: area,
                introduce: introduce,
                images: images,
                postType: postType,
                address: address,
                bedrooms: bedrooms,
                toilets: toilets,
                contactName: contactName,
                contactAddress: contactAddress,
                contactEmail: contactEmail,
                code: code,
                vipPostType: vipPostType,
                postedAt: postedAt,
                expiredAt: expiredAt,
                slug: titleSlug
            });
            console.log(title);

            PostModel.findOne({slug: titleSlug})
                .exec((err, duplicatedTitle) => {
                    if(err){
                        console.error(err);
                    }
                    if(duplicatedTitle){
                        console.log('Duplicated title for rent: ', title);
                        done();
                        return;
                    }

                    post.save(function (err) {
                        if(err){
                            console.error(err);
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
            const links = $('.product-list.product-list-page.product-list-new > .Main .p-title a').map((index, ele) => {
                return 'https://batdongsan.com.vn' + ele.attribs.href;
            }).get();

            links.forEach(url => detailCrawler.queue(url));
        }
        done();
    }
});

module.exports = () => {
  const pagePatern = 'https://batdongsan.com.vn/cho-thue-can-ho-chung-cu/p';
  for(let i = 1; i<=50; i++){
      listCrawler.queue(pagePatern + i);
  }
};