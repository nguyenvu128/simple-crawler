require('dotenv').config();
const schedule = require('node-schedule');
const connectDatabase = require('./database/database');
const crawlerProject = require('./services/project.crawler');
const crawlerPost = require('./services/post.crawler');

schedule.scheduleJob('17 * * * *', connectDatabase(() => {
    // Queue just one URL, with default callbackadd
    crawlerPost();
    crawlerProject();
}));

