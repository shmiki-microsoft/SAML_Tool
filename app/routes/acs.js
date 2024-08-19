const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');
const { decodeSamlResponse } = require('../utils/samlUtils');
const handleError = require('../utils/errorHandler');

function parseXml(xml) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

router.post('/acs', async (req, res) => {
    const { SAMLResponse } = req.body;
    try {
        const decoded = decodeSamlResponse(SAMLResponse);
        const result = await parseXml(decoded);
        res.render('acs', { samlResponse: result, decodedResponse: decoded });
    } catch (err) {
        handleError(res, err, 'Failed to process SAML response');
    }
});

module.exports = router;