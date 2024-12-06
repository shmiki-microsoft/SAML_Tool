const express = require('express');
const router = express.Router();
const { buildSamlRequest } = require('../services/samlService');
const handleError = require('../utils/errorHandler'); 
const logger = require('../utils/logger');

router.get('/generateAdvancedSamlRequest', (req, res) => {
    logger.info('GET /generateAdvancedSamlRequest called');
    const currentDateTime = new Date().toISOString();
    res.render('generateAdvancedSamlRequest', { 
        samlRequestXml: null, 
        relayState: null, 
        samlRequestEncodedUrl: null,
        currentDateTime: currentDateTime
    });
});

router.post('/generateAdvancedSamlRequest', async (req, res) => {
    logger.info('POST /generateAdvancedSamlRequest called');
    logger.debug('Request body:', req.body);
    try {
        const { samlRequestXml, relayState } = req.body;
        if (!samlRequestXml || samlRequestXml.trim() === '') {
            return handleError(res, new Error('SAML Request XML is required'), 400, 'SAML Request XML is required');
        }

        let loginUrl = await buildSamlRequest(samlRequestXml,relayState);
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