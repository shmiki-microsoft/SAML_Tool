const logger = require('./logger');
function handleError(res, err, status, message) {
    logger.error(message,err.stack);
    logger.debug('Error input:', err.input);
    res.status(status).render('error', { message, error: err });
}

module.exports = handleError;