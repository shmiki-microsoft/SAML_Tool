const express = require('express');
const router = express.Router();
const { buildSamlRequest,  buildSampleSamlRequest } = require('../services/samlService');
const handleError = require('../utils/errorHandler'); 
const logger = require('../utils/logger');

router.get('/generateAdvancedSamlRequest', async (req, res) => {
    
    logger.info('GET /generateAdvancedSamlRequest called');
    let xml = await buildSampleSamlRequest();
    res.render('generateAdvancedSamlRequest', { 
        samlRequestXml: xml, 
        relayState: null, 
        samlRequestEncodedUrl: null,
        includeIssuer: null,
        includeNameIDPolicy: null,
        includeAuthnContext: null,
        includeForceAuthn: null,
        includeIsPassive: null,
    });
});

router.post('/generateAdvancedSamlRequest', async (req, res) => {
    logger.info('POST /generateAdvancedSamlRequest called');
    logger.debug('Request body:', req.body);
    try {
        const { samlRequestXml, relayState, includeIssuer,  includeNameIDPolicy, includeAuthnContext, includeForceAuthn, includeIsPassive } = req.body;
        if (!samlRequestXml || samlRequestXml.trim() === '') {
            return handleError(res, new Error('SAML Request XML is required'), 400, 'SAML Request XML is required');
        }

        let loginUrl = await buildSamlRequest(samlRequestXml,relayState);
        res.render('generateAdvancedSamlRequest', {
            samlRequestEncodedUrl: loginUrl,
            samlRequestXml: samlRequestXml,
            relayState: relayState,
            includeIssuer: includeIssuer,
            includeNameIDPolicy: includeNameIDPolicy,
            includeAuthnContext: includeAuthnContext,
            includeForceAuthn: includeForceAuthn,
            includeIsPassive: includeIsPassive
        });
    } catch (err) {
        handleError(res, err, 500, 'Failed to process SAML request');
    }
});

router.post('/generateAdvancedSamlRequest/api/buildSampleSampleRequest', async (req, res) => {
    logger.info('POST /generateAdvancedSamlRequest/api/buildSampleSampleRequest called');
    try {
        const { includeIssuer, includeNameIDPolicy, includeAuthnContext, includeForceAuthn, includeIsPassive } = req.body;
        const samlXml = await buildSampleSamlRequest(includeIssuer, includeNameIDPolicy, includeAuthnContext, includeForceAuthn, includeIsPassive);
        return res.json({ samlRequest: samlXml });
    } catch (err) {
        handleError(res, err, 500, 'Failed to build sample SAML request');
    }
});
module.exports = router;