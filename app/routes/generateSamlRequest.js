const express = require('express');
const router = express.Router();
const { createLoginRequestUrl } = require('../services/samlService');
const handleError = require('../utils/errorHandler');
const { initializeEnvironmentVariables } = require('../utils/envUtils');
const logger = require('../utils/logger');


router.get('/generateSamlRequest', (req, res) => {
    logger.info('GET /generateSamlRequest called');
    const envVars = initializeEnvironmentVariables();
    res.render('generateSamlRequest', envVars);
});

router.post('/generateSamlRequest/api/sendRequest', async (req, res) => {
    logger.info('POST /generateSamlRequest/api/sendRequestcalled');
    logger.debug('Request body:', req.body);

    try {
        const loginUrl = await createLoginRequestUrl(req.body);
        return res.json({ loginUrl });
    } catch (err) {
        const statusCode = err.message.includes('SAMLRequest parameter is missing') ? 400 : 500;
        handleError(res, err, statusCode, 'Failed to process SAML Request');
    }
});
module.exports = router;