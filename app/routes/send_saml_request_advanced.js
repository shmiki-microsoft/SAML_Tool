const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');
const zlib = require('zlib');

function compressAndEncodeSamlRequest(samlRequestXml, callback) {
    xml2js.parseString(samlRequestXml, (err, result) => {
        if (err) {
            return callback(new Error('Failed to parse SAML request XML'), null);
        }

        const authnRequest = result.AuthnRequest || result['samlp:AuthnRequest'];
        if (!authnRequest) {
            return callback(new Error('AuthnRequest element not found in SAML request'), null);
        }

        const destination = authnRequest.$.Destination || null;
        if (!destination) {
            return callback(new Error('Destination attribute not found in AuthnRequest'), null);        }

        const builder = new xml2js.Builder({ headless: true });
        const samlRequestXmlString = builder.buildObject(result);
        zlib.deflateRaw(samlRequestXmlString, (err, compressed) => {
            if (err) {
                //return callback(new Error('Failed to compress SAML request XML'), null);
                console.error({ err });
                return res.status(500).render('error', { message: err.message, error: err });

            }
            const encodedRequest = compressed.toString('base64');
            const loginUrl = `${destination}?SAMLRequest=${encodeURIComponent(encodedRequest)}`;
            callback(null, loginUrl);
        });
    });
}

router.get('/send_saml_request_advanced', (req, res) => {
    res.render('send_saml_request_advanced', { samlRequestXml: null, samlRequestEncoded: null });
});

router.post('/send_saml_request_advanced', (req, res) => {
    try {
        const { samlRequestXml, encodedSamlRequest } = req.body;
        if (encodedSamlRequest){
            return res.redirect(encodedSamlRequest);
        } if (!samlRequestXml || samlRequestXml.trim() === '') {
            return res.status(400).render('error', { message: "SAML Request XML is required" });
        }

        compressAndEncodeSamlRequest(samlRequestXml, (err, loginUrl) => {
            if (err) {
                console.error(err);
                return res.status(400).render('error', { message: err.message, error: err });
            }
            res.render('send_saml_request_advanced', {
                samlRequestEncoded: loginUrl,
                samlRequestXml: samlRequestXml
            });
        });
    }catch (err) {
        console.error({ err });
        res.status(500).render('error', { message: err.message, error: err });
    }
});

module.exports = router;
