const Crawler = require('crawler');
const PostModel = require('../models/post.model');
const slug = require('slug');
const helper = require('./helper');
const POST_TYPES = require('../constant/post-type');
const VIP_TYPES = require('../constant/vip-type');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities()

const decodeStringToEmail = (encodeStr) => {
    const regex = /\'\>.*\<\/a\>/;
    return entities.decode(encodeStr.match(regex)[0].slice(2, -4));
};
const convertStringToDate = (str) => {
    const arrString = str.split('\r\n');
    const newDate = arrString[1].split('-');
    return new Date(newDate[2], newDate[1] - 1, newDate[0]);
};
const findVipType = (vipType) => {
    return VIP_TYPES[vipType];
};
const findPostTypeByTitle = (title) => {
  return POST_TYPES.find(pt => pt.title = title);
};
const crawlPrice = (str) => {
    return str.split(" ");
};
const numberOfRooms = (numb) => {
    let newNumb = '';
    if(numb === ""){
        newNumb = -1
    }else {
        newNumb = parseInt(numb);
    }
    return newNumb;
};
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
            const newPostType = findPostTypeByTitle(postType);
            if(newPostType === undefined){
                done();
                return;
            }
            const address = helper.removeBreakLineCharacter($('#product-other-detail > div:nth-child(2) > div.right').text());
            const bedrooms = helper.removeBreakLineCharacter($('#LeftMainContent__productDetail_roomNumber .right').text());
            const newBedrooms = numberOfRooms(bedrooms);
            const toilets = helper.removeBreakLineCharacter($('#LeftMainContent__productDetail_toilet .right').text());
            const newToilets = numberOfRooms(toilets);
            const contactName = helper.removeBreakLineCharacter($('.divContactName').text());
            const contactAddress = $('#LeftMainContent__productDetail_contactAddress .right').text();
            const contactEmail = helper.removeBreakLineCharacter($('#contactEmail > div.right.contact-email').html());
            var emailAfterDecoded;
            if(contactEmail === undefined){
                emailAfterDecoded = ''
            }else {
                emailAfterDecoded = decodeStringToEmail(contactEmail);
            }

            const code = helper.removeBreakLineCharacter($('#product-detail > div.prd-more-info > div > div').text());
            const vipPostType = findVipType($('#ltrVipType').text());
            const postedAt = helper.removeBreakLineCharacter($('#product-detail > div.prd-more-info > div:nth-child(3)').text());
            const newPostedAt = convertStringToDate(postedAt);
            const expiredAt = helper.removeBreakLineCharacter($('#product-detail > div.prd-more-info > div:nth-child(4)').text());
            const newExpiredAt = convertStringToDate(expiredAt);

            const post = new PostModel({
                title: title,
                price: newPrice[0],
                unit: newPrice[1],
                area: area,
                introduce: introduce,
                images: images,
                postType: newPostType.id,
                address: address,
                bedrooms: newBedrooms,
                toilets: newToilets,
                contactName: contactName,
                contactAddress: contactAddress,
                contactEmail: emailAfterDecoded,
                code: code,
                vipPostType: vipPostType,
                postedAt: newPostedAt,
                expiredAt: newExpiredAt,
                slug: titleSlug
            });
            console.log(title);

            PostModel.findOne({slug: titleSlug})
                .exec((err, duplicatedTitle) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    if(duplicatedTitle){
                        console.log('Duplicated title for rent: ', title);
                        done();
                        return;
                    }

                    post.save(function (err) {
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
            const links = $('.product-list.product-list-page.product-list-new > .Main .p-title a').map((index, ele) => {
                return 'https://batdongsan.com.vn' + ele.attribs.href;
            }).get();

            links.forEach(url => detailCrawler.queue(url));
        }
        done();
    }
});

module.exports = () => {
  POST_TYPES.forEach( pt => {
      for(let i = 1; i<=50; i++){
          listCrawler.queue(pt.link + i);
      }
  });

};