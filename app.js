require('dotenv').config();
const schedule = require('node-schedule');
const connectDatabase = require('./database/database');
const crawlerProject = require('./services/project.crawler');
const crawlerPost = require('./services/post.crawler');
const findProject = require('./services/findAndUpdateProject');

connectDatabase(() => {
    if(process.env.dev === 'true'){
        // crawlerPost();
        // crawlerProject();
        findProject();
    }else {
        schedule.scheduleJob(process.env.cron_jobs_start_at, function(){
            // Queue just one URL, with default callbackadd
            crawlerPost();
            crawlerProject();
        });
        schedule.scheduleJob(process.env.update_projectId_start_at, function(){
            findProject();
        })
    }
});



