const express = require('express');
const router = express.Router();

const { createLoginRequestUrl, extractSamlRequestDataFromLoginUrl } = require('../services/saml2jsHelperService');
const handleError = require('../utils/errorHandler');
const { initializeEnvironmentVariables } = require('../utils/envUtils');
const logger = require('../utils/logger');


router.get('/generateSamlRequest', (req, res) => {
    logger.info('GET /generateSamlRequest called');
    const envVars = initializeEnvironmentVariables();
    res.render('generateSamlRequest', envVars);
});

router.post('/generateSamlRequest', async (req, res) => {
    logger.info('POST /generateSamlRequest called');
    logger.debug('Request body:', req.body);

    try {
        const loginUrl = await createLoginRequestUrl(req);
        const { samlRequest, samlRequestEncodedUrl } = await extractSamlRequestDataFromLoginUrl(loginUrl);

        logger.info('SAML request decoded successfully');
        logger.debug('Decoded SAML request:', samlRequest);

        const options = { ...req.body, samlRequest, samlRequestEncodedUrl };
        res.render('generateSamlRequest', options);
    } catch (err) {
        const statusCode = err.message.includes('SAMLRequest parameter is missing') ? 400 : 500;
        handleError(res, err, statusCode, 'Failed to process SAML Request');
    }
});

module.exports = router;