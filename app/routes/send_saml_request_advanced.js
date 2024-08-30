const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');
const zlib = require('zlib');
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

router.get('/send_saml_request_advanced', (req, res) => {
    logger.info('Received GET request on /send_saml_request_advanced');
    res.render('send_saml_request_advanced', { samlRequestXml: null, samlRequestEncodedUrl: null });
});

router.post('/send_saml_request_advanced', async (req, res) => {
    logger.info('Received POST request on /send_saml_request_advanced');
    logger.debug('Request body:', req.body);
    try {
        const { samlRequestXml} = req.body;
        if (!samlRequestXml || samlRequestXml.trim() === '') {
            return handleError(res, new Error('SAML Request XML is required'), 400, 'SAML Request XML is required');
        }

        const loginUrl = await buildSamlRequestSync(samlRequestXml);
        logger.info('Rendering send_saml_request_advanced with encoded SAML request');
        logger.debug('Encoded SAML request URL:', loginUrl);
        res.render('send_saml_request_advanced', {
            samlRequestEncodedUrl: loginUrl,
            samlRequestXml: samlRequestXml
        });
    } catch (err) {
        handleError(res, err, 500, 'Failed to process SAML request');
    }
});

module.exports = router;