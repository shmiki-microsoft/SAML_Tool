const express = require('express');
const router = express.Router();
const { parseXmlStringSync, encodeSamlRequest } = require('../utils/samlUtils');
const handleError = require('../utils/errorHandler'); 
const logger = require('../utils/logger');

async function buildSamlRequestSync(samlRequestXml) {
    try {
        logger.info('Parsing SAML request XML');
        const result = parseXmlStringSync(samlRequestXml);
        const authnRequest = result.AuthnRequest || result['samlp:AuthnRequest'];
        if (!authnRequest) {
            throw new Error('AuthnRequest element not found in SAML request');
        }

        const destination = authnRequest.$.Destination || null;
        if (!destination) {
            throw new Error('Destination attribute not found in AuthnRequest');
        }
        logger.info('Encoding SAML request');
        const encoded = await encodeSamlRequest(samlRequestXml);
        logger.info('SAML request built successfully'); 
        logger.debug('Encoded SAML request:', encoded);
        return `${destination}?SAMLRequest=${encodeURIComponent(encoded)}`;
    } catch (err) {
        throw new Error(`Failed to build SAML request: ${err.message}`);
    }
}

router.get('/generateAdvancedSamlRequest', (req, res) => {
    logger.info('Received GET request on /generateAdvancedSamlRequest');
    res.render('generateAdvancedSamlRequest', { samlRequestXml: null, relayState: null, samlRequestEncodedUrl: null });
});

router.post('/generateAdvancedSamlRequest', async (req, res) => {
    logger.info('Received POST request on /generateAdvancedSamlRequest');
    logger.debug('Request body:', req.body);
    try {
        const { samlRequestXml, relayState } = req.body;
        if (!samlRequestXml || samlRequestXml.trim() === '') {
            return handleError(res, new Error('SAML Request XML is required'), 400, 'SAML Request XML is required');
        }

        let loginUrl = await buildSamlRequestSync(samlRequestXml);
        if (relayState && relayState.trim() !== '') {
            loginUrl += `&RelayState=${encodeURIComponent(relayState)}`;
        }
        logger.info('Rendering generateAdvancedSamlRequest with encoded SAML request');
        logger.debug('Encoded SAML request URL:', loginUrl);
        res.render('generateAdvancedSamlRequest', {
            samlRequestEncodedUrl: loginUrl,
            samlRequestXml: samlRequestXml,
            relayState: relayState
        });
    } catch (err) {
        handleError(res, err, 500, 'Failed to process SAML request');
    }
});

module.exports = router;