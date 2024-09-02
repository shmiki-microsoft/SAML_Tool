const express = require('express');
const router = express.Router();
const { decodeSamlResponse } = require('../services/samlService');
const logger = require('../utils/logger');
const handleError = require('../utils/errorHandler');

router.get('/decodeSamlResponse', (req, res) => {
    logger.info('Received GET request on /decodeSamlResponse');
    res.render('decodeSamlResponse', { samlResponse:null, decodedResponse:null });
});

router.post('/decodeSamlResponse', (req, res) => {
    const { samlResponse } = req.body;
    logger.info('Received POST request on /decodeSamlResponse');
    logger.debug('Request body:', req.body);
    try {
        const decodedResponse = decodeSamlResponse(samlResponse);
        logger.info('SAML response decoded successfully');
        logger.debug('Decoded SAML response:', decodedResponse);
        res.render('decodeSamlResponse', { samlResponse, decodedResponse});
    } catch (err) {
        handleError(res, err, 500, 'Failed to decode SAML response');
    }
});

module.exports = router;