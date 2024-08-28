const express = require('express');
const router = express.Router();
const saml2 = require('saml2-js');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const { decodeSamlRequest } = require('../utils/samlUtils');
const handleError = require('../utils/errorHandler');
const { initializeEnvironmentVariables } = require('../utils/envUtils'); 

function getSpOptions(req) {
    return {
        entity_id: req.body.issuer,
        assert_endpoint: req.body.assertionConsumerServiceURL || `${process.env.host}/acs`,
        nameid_format: req.body.nameIDFormat,
        force_authn: req.body.forceAuthn,
        private_key: fs.readFileSync(path.join(__dirname, `../keys/SP/${process.env.SP_PRIVATE_KEY_FILE}`)).toString(),
        certificate: fs.readFileSync(path.join(__dirname, `../keys/SP/${process.env.SP_CERT_FILE}`)).toString(),
        allow_unencrypted_assertion: true,
    };
}

function getIdpOptions(req) {
    return {
        sso_login_url: req.body.destination,
    };
}

function renderResponse(res) {
    const envVars = initializeEnvironmentVariables();
    res.render('send_saml_request', envVars);
}

router.get('/send_saml_request', (req, res) => {
    renderResponse(res);
});

router.post('/send_saml_request', (req, res) => {
    const spOptions = getSpOptions(req);
    const idpOptions = getIdpOptions(req);

    const sp = new saml2.ServiceProvider(spOptions);
    const idp = new saml2.IdentityProvider(idpOptions);

    sp.create_login_request_url(idp, req.body.relayState ? { relay_state: req.body.relayState } : {}, async (err, login_url, request_id) => {
        if (err) {
            return handleError(res, err, 'Failed to create login request URL');
        }
    
        if (req.body._isGenerate === "true") {
            try {
                const urlParts = new URL(login_url);
                const samlRequestEncoded = querystring.parse(urlParts.search.slice(1)).SAMLRequest;
    
                if (!samlRequestEncoded) {
                    return res.status(400).render('error', { message: "SAMLRequest parameter is missing in the URL" });
                }
    
                const samlRequest = await decodeSamlRequest(samlRequestEncoded);
                const option = { ...req.body, samlRequest };
    
                return res.render('send_saml_request', option);
            } catch (err) {
                return handleError(res, err, 'Failed to process SAML Request');
            }
        } else {
            return res.redirect(login_url);
        }
    });
});

module.exports = router;