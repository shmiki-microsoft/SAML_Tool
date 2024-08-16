const express = require('express');
const router = express.Router();
const saml2 = require('saml2-js');
const path = require('path');
const fs = require('fs');

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

router.get('/send_saml_request', (req, res) => {
    res.render('send_saml_request', { default_acs: `${process.env.host}/acs` });
});

router.post('/send_saml_request', (req, res) => {
    const spOptions = getSpOptions(req);
    const idpOptions = getIdpOptions(req);

    const sp = new saml2.ServiceProvider(spOptions);
    const idp = new saml2.IdentityProvider(idpOptions);

    sp.create_login_request_url(idp, {}, (err, login_url, request_id) => {
        if (err) {
            console.error({ err });
            return res.status(500).render('error', { message: err.message, error: err });
        }
        res.redirect(login_url);
    });
});

module.exports = router;