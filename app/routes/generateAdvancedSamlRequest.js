const express = require('express');
const router = express.Router();
const { buildSamlRequest,  buildSampleSamlRequest } = require('../services/samlService');
const { initializeEnvironmentVariables_AdvancedSamlRequest } = require('../utils/envUtils');
const {handleError} = require('../utils/errorHandler'); 
const logger = require('../utils/logger');

router.get('/generateAdvancedSamlRequest', async (req, res) => {
    
    logger.info('GET /generateAdvancedSamlRequest called');
    const envVars = await initializeEnvironmentVariables_AdvancedSamlRequest();
    res.render('generateAdvancedSamlRequest', envVars);
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
        const keysArray = Array.isArray(queryStringKeys) ? queryStringKeys : (queryStringKeys ? [queryStringKeys] : []);
        const valuesArray = Array.isArray(queryStringValues) ? queryStringValues : (queryStringValues ? [queryStringValues] : []);

        let loginUrl = await buildSamlRequest(samlRequestXml, relayState, keysArray, valuesArray);
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
            queryStringKeys:keysArray,
            queryStringValues:valuesArray
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