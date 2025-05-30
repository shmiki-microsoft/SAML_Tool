const logger = require('./logger');
function handleError(res, err, status, message) {
    logger.error(message,err.stack);
    logger.debug('Error input:', err.input);
    res.status(status).render('error', { message, error: err });
}

async function handleErrorAsync(operation, error) {
    const errorMessage = `Failed to ${operation}: ${error.message || error}`;
    throw new Error(errorMessage);
}

module.exports ={
    handleError,
    handleErrorAsync
}