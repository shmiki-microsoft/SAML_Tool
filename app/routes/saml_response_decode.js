const express = require('express');
const router = express.Router();
const { decodeSamlResponse } = require('../utils/samlUtils');
const handleError = require('../utils/errorHandler');

function renderResponse(res, samlResponse = null, decodedResponse = null) {
    res.render('saml_response_decode', { samlResponse, decodedResponse });
}

router.get('/saml_response_decode', (req, res) => {
    renderResponse(res);
});

router.post('/saml_response_decode', (req, res) => {
    const { samlResponse } = req.body;

    try {
        const decoded = decodeSamlResponse(samlResponse);
        renderResponse(res, samlResponse, decoded);
    } catch (err) {
        handleError(res, err, 'Failed to decode SAML response');
    }
});

module.exports = router;