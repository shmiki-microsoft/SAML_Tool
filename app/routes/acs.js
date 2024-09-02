const express = require('express');
const router = express.Router();
const { decodeSamlResponse } = require('../services/samlService');
const { parseXmlString } = require('../utils/xmlUtils');
const logger = require('../utils/logger');
const handleError = require('../utils/errorHandler');

router.post('/acs', async (req, res) => {
    logger.info('Received POST request on /acs');
    logger.debug('Request body:', req.body);
    const { SAMLResponse, RelayState } = req.body;
    try {
        const decoded = decodeSamlResponse(SAMLResponse);
        logger.debug('Decoded SAML response:', decoded);
        const result = await parseXmlString(decoded);
        logger.info('SAML response processed successfully');
        res.render('acs', { samlResponse: result, decodedResponse: decoded, relayState: RelayState });
    } catch (err) {
        handleError(res, err, 500, 'Failed to process SAML response');
    }
});

module.exports = router;