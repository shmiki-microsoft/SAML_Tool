const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');
const zlib = require('zlib');
const { parseXmlStringSync, encodeSamlRequest } = require('../utils/samlUtils');
const handleError = require('../utils/errorHandler'); 

async function buildSamlRequestSync(samlRequestXml) {
    try {
        const result = parseXmlStringSync(samlRequestXml);
        const authnRequest = result.AuthnRequest || result['samlp:AuthnRequest'];
        if (!authnRequest) {
            throw new Error('AuthnRequest element not found in SAML request');
        }

        const destination = authnRequest.$.Destination || null;
        if (!destination) {
            throw new Error('Destination attribute not found in AuthnRequest');
        }

        const encoded = await encodeSamlRequest(samlRequestXml);
        return `${destination}?SAMLRequest=${encodeURIComponent(encoded)}`;
    } catch (err) {
        throw new Error(`Failed to build SAML request: ${err.message}`);
    }
}

router.get('/send_saml_request_advanced', (req, res) => {
    res.render('send_saml_request_advanced', { samlRequestXml: null, samlRequestEncoded: null });
});

router.post('/send_saml_request_advanced', async (req, res) => {
    try {
        const { samlRequestXml, encodedSamlRequest } = req.body;
        if (encodedSamlRequest) {
            return res.redirect(encodedSamlRequest);
        }
        if (!samlRequestXml || samlRequestXml.trim() === '') {
            return res.status(400).render('error', { message: "SAML Request XML is required" });
        }

        const loginUrl = await buildSamlRequestSync(samlRequestXml);
        res.render('send_saml_request_advanced', {
            samlRequestEncoded: loginUrl,
            samlRequestXml: samlRequestXml
        });
    } catch (err) {
        handleError(res, err, 'Failed to process SAML request');
    }
});

module.exports = router;