const Crawler = require('crawler');
const HouseForRentModel = require('../models/houses-for-rent.model');
const slug = require('slug');

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
            const title = $('#product-detail > div.pm-title > h1').text();
            const titleSlug = slug(title).toLowerCase();
            const price = $('.kqchitiet > span > span.gia-title.mar-right-15 > strong').text();
            const area = $('#product-detail span:nth-child(2) > strong').text();
            const introduce = $('#product-detail > div.pm-content > div.pm-desc').text();
            const images = $('#thumbs img').map((index, ele) => {
                return ele.attribs.src;
            }).get();
            const postType = $('#product-other-detail > div:nth-child(1) > div.right').text();
            const address = $('#product-other-detail > div:nth-child(2) > div.right').text();
            const bedrooms = $('#LeftMainContent__productDetail_roomNumber .right').text();
            const toilets = $('#LeftMainContent__productDetail_toilet .right').text();
            const contactName = $('.divContactName').text();
            const contactAddress = $('#LeftMainContent__productDetail_contactAddress .right').text();
            const contactEmail = $('#contactEmail > div.right.contact-email > a').text();
            const code = $('#product-detail > div.prd-more-info > div > div').text();
            const vipPostType = $('#ltrVipType').text();
            // const postedAt = $('').text();
            // const expiredAt = $('').text();

            const houseForRent = new HouseForRentModel({
                title: title,
                price: price,
                area: area,
                introduce: introduce,
                images: images,
                postTypes: postType,
                address: address,
                bedrooms: bedrooms,
                toilets: toilets,
                contactName: contactName,
                contactAddress: contactAddress,
                contactEmail: contactEmail,
                code: code,
                vipPostType: vipPostType,
                postedAt: "",
                expiredAt: "",
                slug: titleSlug
            });
            console.log(title);

            HouseForRentModel.findOne({slug: titleSlug})
                .exec((err, duplicatedTitle) => {
                    if(err){
                        console.error(err);
                    }
                    if(duplicatedTitle){
                        console.log('Duplicated title for rent: ', title);
                        done();
                        return;
                    }

                    houseForRent.save(function (err) {
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

  //vì 1 page có 20 title nên chỉ cho chạy 5 page
  for(let i = 1; i<=5; i++){
      listCrawler.queue(pagePatern + i);
  }
};