const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('send_saml_request', {
        issuer:null,
        destination:null,
        assertionConsumerServiceURL:`${process.env.host}/acs`,
        nameIDFormat:null,
        forceAuthn:null,
        _isGenerate:null,
        _isRequest:null,
        samlRequest: null
    });
});

module.exports = router;