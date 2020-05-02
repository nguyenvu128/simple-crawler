const connectDatabase = require('./database/database');
const crawlerProject = require('./services/crawler-project');

connectDatabase(() => {
    // Queue just one URL, with default callback
    crawlerProject();
});
