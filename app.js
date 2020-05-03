const connectDatabase = require('./database/database');
const crawlerProject = require('./services/crawler-project');
const crawlerHouseForRent = require('./services/crawler.houseforrent');

connectDatabase(() => {
    // Queue just one URL, with default callback
    crawlerHouseForRent();
    crawlerProject();
});
