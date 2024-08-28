const log4js = require('log4js');
const path = require("path");
const APP_ROOT = path.join(__dirname, "../");
const logFileName = process.env.LOG_FILE_NAME || 'application.log';
const logFilePath = process.env.LOG_FILE_PATH || 'logs';
const maxLogSize = parseInt(process.env.MAX_LOG_SIZE, 10) || 10485760; // Default to 10MB if not set
const backups = parseInt(process.env.LOG_ROTATE, 10) || 3; // Default to 3 backups if not set
const logLevel = process.env.LOG_LEVEL || 'debug'; // Default to 'debug' if not set

log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        app: { 
            type: 'dateFile',
            filename: path.join(APP_ROOT, logFilePath, logFileName),
            pattern: '.yyyy-MM-dd.log',
            //maxLogSize: maxLogSize,
            numBackups: backups, // Replaced daysToKeep with numBackups
            alwaysIncludePattern : true,

        }
    },
    categories: {
        default: { appenders: ['out', 'app'], level: logLevel}
    }
});

const logger = log4js.getLogger();

module.exports = logger;