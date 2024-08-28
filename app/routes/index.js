const express = require('express');
const router = express.Router();
const { initializeEnvironmentVariables } = require('../utils/envUtils'); 

function renderResponse(res) {
    const envVars = initializeEnvironmentVariables();
    res.render('send_saml_request', envVars);
}

router.get('/', (req, res) => {
    renderResponse(res);
});

module.exports = router;