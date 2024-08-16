const express = require('express');
const router = express.Router();

function decodeSamlResponse(samlResponse) {
    return Buffer.from(samlResponse, 'base64').toString('utf8');
}

router.get('/saml_response_decode', (req, res) => {
    res.render('saml_response_decode', { samlResponse: null, decodedResponse: null });
});

router.post('/saml_response_decode', (req, res) => {
    const { samlResponse } = req.body;

    try {
        const decoded = decodeSamlResponse(samlResponse);
        res.render('saml_response_decode', { samlResponse: samlResponse, decodedResponse: decoded });
    } catch (err) {
        console.error({ err });
        res.status(500).render('error', { message: err.message, error: err });
    }
});

module.exports = router;