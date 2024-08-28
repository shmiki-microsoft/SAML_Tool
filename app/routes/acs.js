const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');
const { decodeSamlResponse } = require('../utils/samlUtils');
const logger = require('../utils/logger');
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
    logger.info('Received POST request on /acs');
    logger.debug('Request body:', req.body);
    const { SAMLResponse, RelayState } = req.body;
    try {
        const decoded = decodeSamlResponse(SAMLResponse);
        logger.debug('Decoded SAML response:', decoded);
        const result = await parseXml(decoded);
        logger.info('SAML response processed successfully');
        res.render('acs', { samlResponse: result, decodedResponse: decoded, relayState: RelayState });
    } catch (err) {
        handleError(res, err, 500, 'Failed to process SAML response');
    }
});

module.exports = router;