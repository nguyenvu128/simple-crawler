const connectDatabase = require('./database/database');
const crawlerProject = require('./services/project.crawler');
const crawlerPost = require('./services/post.crawler');

connectDatabase(() => {
    // Queue just one URL, with default callback
    crawlerPost();
    // crawlerProject();
});
