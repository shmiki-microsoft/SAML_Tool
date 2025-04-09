const express = require('express');
const router = express.Router();
const { initializeEnvironmentVariables } = require('../utils/envUtils'); 
const logger = require('../utils/logger');

router.get('/', (req, res) => {
    logger.info('Received GET request on /');
    // const envVars = initializeEnvironmentVariables();
    // logger.debug('Environment variables:', envVars);
    // res.render('generateSamlRequest', envVars);
    res.render('index',{WIKI_LINK:process.env.WIKI_LINK})
});

module.exports = router;