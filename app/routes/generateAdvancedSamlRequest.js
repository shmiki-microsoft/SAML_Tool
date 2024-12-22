const express = require('express');
const router = express.Router();
const { buildSamlRequest,  buildSampleSamlRequest } = require('../services/samlService');
const handleError = require('../utils/errorHandler'); 
const logger = require('../utils/logger');

router.get('/generateAdvancedSamlRequest', async (req, res) => {
    
    logger.info('GET /generateAdvancedSamlRequest called');
    const currentDateTime = new Date().toISOString();
    const issuer = req.query?.issuer === 'on' ? 'on' : 'off';
    const nameIDPolicy = req.query?.nameIDPolicy === 'on' ? 'on' : 'off';
    const authnContext = req.query?.authnContext === 'on' ? 'on' : 'off';
    const forceAuthn = req.query?.forceAuthn === 'on' ? 'on' : 'off';
    const isPassive = req.query?.isPassive === 'on' ? 'on' : 'off';

    let xml = await buildSampleSamlRequest(issuer, nameIDPolicy, authnContext,forceAuthn,isPassive);
    res.render('generateAdvancedSamlRequest', { 
        samlRequestXml: xml, 
        relayState: null, 
        samlRequestEncodedUrl: null,
        currentDateTime: currentDateTime,
        includeIssuer: issuer === 'on',
        includeNameIDPolicy: nameIDPolicy === 'on',
        includeAuthnContext: authnContext  === 'on',
        includeForceAuthn: forceAuthn  === 'on',
        includeIsPassive: isPassive  === 'on',
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

module.exports = router;