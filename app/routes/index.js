const express = require('express');
const router = express.Router();

function getEnvironmentVariables() {
    return {
        issuer: null,
        destination: null,
        assertionConsumerServiceURL: `${process.env.host}/acs`,
        nameIDFormat: null,
        forceAuthn: null,
        relayState: null,
        _isGenerate: null,
        _isRequest: null,
        samlRequest: null
    };
}

function renderResponse(res) {
    const envVars = getEnvironmentVariables();
    res.render('send_saml_request', envVars);
}

router.get('/', (req, res) => {
    renderResponse(res);
});

module.exports = router;