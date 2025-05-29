const log4js = require('log4js');
const logLevel = process.env.LOG_LEVEL || 'debug';

log4js.configure({
    appenders: {
        out: { type: 'stdout' }
    },
    categories: {
        default: { appenders: ['out'], level: logLevel }
    }
});

const logger = log4js.getLogger();

module.exports = logger;