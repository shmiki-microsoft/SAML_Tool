const express = require('express');
const router = express.Router();
const { decodeSamlResponse } = require('../utils/samlUtils');
const logger = require('../utils/logger');
const handleError = require('../utils/errorHandler');

function renderResponse(res, samlResponse = null, decodedResponse = null) {
    res.render('saml_response_decode', { samlResponse, decodedResponse });
}

router.get('/saml_response_decode', (req, res) => {
    logger.info('Received GET request on /saml_response_decode');
    renderResponse(res);
});

router.post('/saml_response_decode', (req, res) => {
    const { samlResponse } = req.body;
    logger.info('Received POST request on /saml_response_decode');
    logger.debug('Request body:', req.body);
    try {
        const decoded = decodeSamlResponse(samlResponse);
        logger.info('SAML response decoded successfully');
        logger.debug('Decoded SAML response:', decoded);
        renderResponse(res, samlResponse, decoded);
    } catch (err) {
        handleError(res, err, 500, 'Failed to decode SAML response');
    }
});

module.exports = router;