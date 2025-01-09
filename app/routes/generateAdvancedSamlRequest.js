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
        includeScoping: null,
        includeSubject: null,
        queryStringKeys:[],
        queryStringValues:[]
    });
});

router.post('/generateAdvancedSamlRequest', async (req, res) => {
    logger.info('POST /generateAdvancedSamlRequest called');
    logger.debug('Request body:', req.body);
    try {
        const {
            samlRequestXml,
            relayState,
            includeIssuer,
            includeNameIDPolicy,
            includeAuthnContext,
            includeForceAuthn,
            includeIsPassive,
            includeScoping,
            includeSubject,
            queryStringKeys,
            queryStringValues
        } = req.body;

        if (!samlRequestXml || samlRequestXml.trim() === '') {
            return handleError(res, new Error('SAML Request XML is required'), 400, 'SAML Request XML is required');
        }

        let loginUrl = await buildSamlRequest(samlRequestXml,relayState,queryStringKeys,queryStringValues);
        res.render('generateAdvancedSamlRequest', {
            samlRequestEncodedUrl: loginUrl,
            samlRequestXml,
            relayState,
            includeIssuer,
            includeNameIDPolicy,
            includeAuthnContext,
            includeForceAuthn,
            includeIsPassive,
            includeScoping,
            includeSubject,
            queryStringKeys,
            queryStringValues
        });      
    } catch (err) {
        handleError(res, err, 500, 'Failed to process SAML request');
    }
});

router.post('/generateAdvancedSamlRequest/api/buildSampleSampleRequest', async (req, res) => {
    logger.info('POST /generateAdvancedSamlRequest/api/buildSampleSampleRequest called');
    try {
        const {
            includeIssuer,
            includeNameIDPolicy,
            includeAuthnContext,
            includeForceAuthn,
            includeIsPassive,
            includeScoping,
            includeSubject
        } = req.body;

        const samlXml = await buildSampleSamlRequest(
            includeIssuer,
            includeNameIDPolicy,
            includeAuthnContext,
            includeForceAuthn,
            includeIsPassive,
            includeScoping,
            includeSubject
        );
        return res.json({ samlRequest: samlXml });
    } catch (err) {
        handleError(res, err, 500, 'Failed to build sample SAML request');
    }
});
module.exports = router;