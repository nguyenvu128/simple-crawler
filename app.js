require('dotenv').config();
const schedule = require('node-schedule');
const connectDatabase = require('./database/database');
const crawlerProject = require('./services/project.crawler');
const crawlerPost = require('./services/post.crawler');

connectDatabase(() => {
    schedule.scheduleJob('17 * * *', () => {
        console.log('Job: ', new Date());
        crawlerPost();
        crawlerProject();
    });
});

