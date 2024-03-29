const Crawler = require('crawler');
const PostModel = require('../models/post.model');
const ProjectModel = require('../models/project.model');
const slug = require('slug');
const helper = require('./helper');
const POST_TYPES = require('../constant/post-type');
const VIP_TYPES = require('../constant/vip-type');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
require('dotenv').config();

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
  return POST_TYPES.find(pt => pt.title === title);
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
    callback : async function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            const $ = res.$;
            const title = helper.removeBreakLineCharacter($('#product-detail > div.pm-title > h1').text());
            const titleSlug = slug(title).toLowerCase();
            const price = helper.removeBreakLineCharacter($('.kqchitiet > span > span.gia-title.mar-right-15 > strong').text());
            const url = res.options.uri;
            let newPrice = [];
            if(price == null || price === 'Thỏa thuận'){
                newPrice.push(-1);
                newPrice.push('');
            }else {
                 newPrice = crawlPrice(price);
            }

            const area = helper.removeBreakLineCharacter($('#product-detail span:nth-child(2) > strong').text());
            const newArea = [];
            if(area === null || area ==='Không xác định'){
                newArea.push(-1);
                newArea.push('Không xác định');
            }else {
                newArea.push(area.slice(0, -2));
                newArea.push(area.slice(-2));
            }
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
            const projectName = helper.removeBreakLineCharacter($('#project > div.table-detail > div:nth-child(1) > div.right').text()) ;
            const contactName = helper.removeBreakLineCharacter($('.divContactName').text());
            const contactPhone = helper.removeBreakLineCharacter($('#LeftMainContent__productDetail_contactMobile > div.right.contact-phone').text()) || ''; // string || null;
            const contactAddress = helper.removeBreakLineCharacter($('#LeftMainContent__productDetail_contactAddress .right').text());
            const contactEmail = helper.removeBreakLineCharacter($('#contactEmail > div.right.contact-email').html());
            const detailProject = $('#LeftMainContent__productDetail_linkProject').map((index, ele) => {
                return ele.attribs.href;
            }).get();

            let emailAfterDecoded;
            if(contactEmail === ''){
                emailAfterDecoded = '';
            }else {
                emailAfterDecoded = decodeStringToEmail(contactEmail);
            }
            const code = helper.removeBreakLineCharacter($('#product-detail > div.prd-more-info > div > div').text());
            const vipPostType = findVipType($('#ltrVipType').text());
            const postedAt = helper.removeBreakLineCharacter($('#product-detail > div.prd-more-info > div:nth-child(3)').text());
            const newPostedAt = convertStringToDate(postedAt);
            const expiredAt = helper.removeBreakLineCharacter($('#product-detail > div.prd-more-info > div:nth-child(4)').text());
            const newExpiredAt = convertStringToDate(expiredAt);
            const city = $('#divCity li.current').text();
            const district = $('#divDistrict li.current').text();
            const ward = $('#divWard li.current').text();
            const street = $('#divStreet li.current').text();

            const postData = {
                title: title,
                price: newPrice[0],
                priceUnit: newPrice[1],
                area: newArea[0],
                areaUnit: newArea[1],
                url: url,
                introduce: introduce,
                images: images,
                postType: newPostType.id,
                address: address,
                city: city,
                district: district,
                ward: ward,
                street: street,
                projectName: projectName,
                projectId: '',
                bedrooms: newBedrooms,
                toilets: newToilets,
                contactName: contactName,
                contactAddress: contactAddress,
                contactPhone: contactPhone,
                contactEmail: emailAfterDecoded,
                code: code,
                vipPostType: vipPostType,
                postedAt: newPostedAt,
                expiredAt: newExpiredAt,
                slug: titleSlug
            };
            console.log(title);
            try{
                const duplicatedTitle = await PostModel.findOne({slug: titleSlug}).exec();
                if(duplicatedTitle) {
                    throw new Error('Duplicated title for rent: ' + title);
                }
                const findProject = await ProjectModel.findOne({url: detailProject[0]}).exec();
                if(!findProject){
                    postData.projectId = null;
                }else {
                    postData.projectId = findProject._id;
                }
                const postModel = new PostModel(postData);
                await postModel.save();
            }catch (err){
                console.error(err);
            }finally {
                done();
            }
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
    const pages = parseInt(process.env.crawler_post_page);
  POST_TYPES.forEach( pt => {
      for(let i = 1; i <= pages; i++){
          listCrawler.queue(pt.link + i);
      }
  });
};