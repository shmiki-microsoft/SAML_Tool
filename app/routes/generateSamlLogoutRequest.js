const express = require('express');
const router = express.Router();

const { createLogoutRequestUrl, extractSamlLogoutRequestDataFromLoginUrl } = require('../services/saml2jsHelperService');
const handleError = require('../utils/errorHandler');
const { initializeEnvironmentVariables_logout } = require('../utils/envUtils');
const logger = require('../utils/logger');


router.get('/generateSamlLogoutRequest', (req, res) => {
    logger.info('GET /generateSamlLogoutRequest called');
    const envVars = initializeEnvironmentVariables_logout();
    res.render('generateSamlLogoutRequest', envVars);
});

router.post('/generateSamlLogoutRequest', async (req, res) => {
    logger.info('POST /generateSamlLogoutRequest called');
    logger.debug('Request body:', req.body);

    try {
        const logoutUrl = await createLogoutRequestUrl(req);
        const { samlLogoutRequest, samlLogoutRequestEncodedUrl } = await extractSamlLogoutRequestDataFromLoginUrl(logoutUrl);

        logger.info('SAML Logout Request decoded successfully');
        logger.debug('Decoded SAML Logout Request:', samlLogoutRequest);

        const options = { ...req.body, samlLogoutRequest, samlLogoutRequestEncodedUrl };
        res.render('generateSamlLogoutRequest', options);
    } catch (err) {
        const statusCode = err.message.includes('SAMLRequest parameter is missing')
            ? 400
            : 500;
        handleError(res, err, statusCode, 'Failed to process SAML Logout Request');
    }
});

module.exports = router;