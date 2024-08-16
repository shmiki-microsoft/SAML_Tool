const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');

function decodeSamlResponse(samlResponse) {
    return Buffer.from(samlResponse, 'base64').toString('utf8');
}

function parseXml(xml, callback) {
    xml2js.parseString(xml, (err, result) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
}

router.post('/acs', (req, res) => {
    const { SAMLResponse } = req.body;
    try {
        const decoded = decodeSamlResponse(SAMLResponse);
        //res.render('saml_response_decode', { samlResponse: SAMLResponse,decodedResponse:decoded});
        parseXml(decoded, (err, result) => {
            if (err) {
                return res.status(500).render('error', { message: err.message, error: err });
            }
            res.render('acs', { samlResponse: result, decodedResponse: decoded });
        });
    } catch (err) {
        console.error({ err });
        res.status(500).render('error', { message: err.message, error: err });
    }
});

module.exports = router;