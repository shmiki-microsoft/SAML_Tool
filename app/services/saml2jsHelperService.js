const fs = require('fs');
const path = require('path');
const saml2 = require('saml2-js');
const { decodeSamlRequest } = require('../services/samlService');
const querystring = require('querystring');
const logger = require('../utils/logger');

function getSpOptions(req) {
    return {
        entity_id: req.body.issuer,
        assert_endpoint: req.body.assertionConsumerServiceURL || `${process.env.host}/acs`,
        nameid_format: req.body.nameIDFormat,
        force_authn: req.body.forceAuthn,
        private_key: fs.readFileSync(path.join(__dirname, `../keys/SP/${process.env.SP_PRIVATE_KEY_FILE}`)).toString(),
        certificate: fs.readFileSync(path.join(__dirname, `../keys/SP/${process.env.SP_CERT_FILE}`)).toString(),
        allow_unencrypted_assertion: true,
        auth_context: { comparison: "exact", class_refs: [req.body.authnContext] },
    };
}

function getIdpOptions(req) {
    return {
        sso_login_url: req.body.destination,
        sso_logout_url: req.body.logoutURL
    };
}

async function createLoginRequestUrl(req) {
    const spOptions = getSpOptions(req);
    const idpOptions = getIdpOptions(req);
    const sp = new saml2.ServiceProvider(spOptions);
    const idp = new saml2.IdentityProvider(idpOptions);

    return new Promise((resolve, reject) => {
        sp.create_login_request_url(idp, req.body.relayState ? { relay_state: req.body.relayState } : {}, (err, url) => {
            if (err) {
                reject(err);
            } else {
                logger.info('Login request URL created');
                logger.debug('URL:', url);
                resolve(url);
            }
        });
    });
}

async function extractSamlRequestDataFromLoginUrl(loginUrl) {
    const urlParts = new URL(loginUrl);
    const samlRequestEncoded = querystring.parse(urlParts.search.slice(1)).SAMLRequest;

    if (!samlRequestEncoded) {
        throw new Error('SAMLRequest parameter is missing in the URL');
    }

    const samlRequest = await decodeSamlRequest(samlRequestEncoded);
    return { samlRequest, samlRequestEncodedUrl: loginUrl };
}

async function createLogoutRequestUrl(req) {
    const spOptions = getSpOptions(req);
    const idpOptions = getIdpOptions(req);
    const sp = new saml2.ServiceProvider(spOptions);
    const idp = new saml2.IdentityProvider(idpOptions);

    return new Promise((resolve, reject) => {
        sp.create_logout_request_url(idp, { name_id: req.body.nameID }, (err, logoutUrl) => {
            if (err) {
                logger.error('Error creating logout request URL:', err);
                return reject(err);
            }
            resolve(logoutUrl);
        });
    });
}

async function extractSamlLogoutRequestDataFromLoginUrl(logoutUrl) {
    const urlParts = new URL(logoutUrl);
    const samlLogoutRequestEncoded = querystring.parse(urlParts.search.slice(1)).SAMLRequest;

    if (!samlLogoutRequestEncoded) {
        throw new Error('SAMLRequest parameter is missing in the URL');
    }

    const samlLogoutRequest = await decodeSamlRequest(samlLogoutRequestEncoded);
    return { samlLogoutRequest, samlLogoutRequestEncodedUrl: logoutUrl };
}
module.exports = {
    getSpOptions,
    getIdpOptions,
    createLoginRequestUrl,
    extractSamlRequestDataFromLoginUrl,
    createLogoutRequestUrl,
    extractSamlLogoutRequestDataFromLoginUrl
};