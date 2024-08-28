const express = require('express');
const router = express.Router();
const { initializeEnvironmentVariables } = require('../utils/envUtils'); 
const logger = require('../utils/logger');

function renderResponse(res) {
    const envVars = initializeEnvironmentVariables();
    logger.debug('Environment variables:', envVars);
    res.render('send_saml_request', envVars);
}

router.get('/', (req, res) => {
    logger.info('Received GET request on /');
    renderResponse(res);
});

module.exports = router;