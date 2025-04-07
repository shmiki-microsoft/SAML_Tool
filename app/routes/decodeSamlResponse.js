const express = require('express');
const router = express.Router();
const { decodeSamlResponse,decodeSamlRequest } = require('../services/samlService');
const logger = require('../utils/logger');
const handleError = require('../utils/errorHandler');

router.get('/decodeSamlRequestandResponse', (req, res) => {
    logger.info('Received GET request on /decodeSamlRequestandResponse');
    res.render('decodeSamlRequestandResponse', { samlResponse:null, decodedResponse:null, samlRequest:null, decodedRequest:null});
});

router.post('/decodeSamlResponse', (req, res) => {
    const { samlResponse } = req.body;
    logger.info('Received POST request on /decodeSamlResponse');
    logger.debug('Request body:', req.body);
    try {
        const decodedResponse = decodeSamlResponse(samlResponse);
        logger.info('SAML response decoded successfully');
        logger.debug('Decoded SAML response:', decodedResponse);
        res.render('decodeSamlRequestandResponse', { samlResponse, decodedResponse, samlRequest:null,decodedRequest:null});
    } catch (err) {
        handleError(res, err, 500, 'Failed to decode SAML response');
    }
});

router.post('/decodeSamlRequest', async (req, res) => {
    const { samlRequest } = req.body;
    logger.info('Received POST request on /decodeSamlResponse');
    logger.debug('Request body:', req.body);
    try {
        const decodedRequest = await decodeSamlRequest(samlRequest);
        logger.info('SAML response decoded successfully');
        logger.debug('Decoded SAML response:', decodedRequest);
        res.render('decodeSamlRequestandResponse', { samlResponse:null, decodedResponse:null, samlRequest, decodedRequest});
    } catch (err) {
        handleError(res, err, 500, 'Failed to decode SAML response');
    }
});

module.exports = router;