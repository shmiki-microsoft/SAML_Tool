const { buildSampleSamlRequest } = require('../services/samlService');

function initializeEnvironmentVariables() {
    return {
        issuer: null,
        destination: null,
        assertionConsumerServiceURL: null,
        nameIDFormat: null,
        forceAuthn: null,
        authnContext:null,
        relayState: null,
        _isGenerate: null,
        _isRequest: null,
        samlRequest: null,
        samlRequestEncodedUrl: null,
    };
}

async function initializeEnvironmentVariables_AdvancedSamlRequest() {
    let xml = await buildSampleSamlRequest();
    return { 
        samlRequestXml: xml, 
        relayState: null, 
        samlRequestEncodedUrl: null,
        includeIssuer: null,
        includeNameIDPolicy: null,
        includeAuthnContext: null,
        includeForceAuthn: null,
        includeIsPassive: null,
        includeScoping: null,
        includeSubject: null,
        queryStringKeys:[],
        queryStringValues:[]
    };
}

function initializeEnvironmentVariables_decodeSamlResponse() {
    return {
        samlResponse:null,
        decodedResponse:null,
        samlRequest:null,
        decodedRequest:null
    };
}

function initializeEnvironmentVariables_logout() {
    return { 
        logoutURL: null,
        issuer: null,
        nameID: null,
        samlLogoutRequest: null,
        samlLogoutRequestEncodedUrl: null
    };
}
module.exports = {
    initializeEnvironmentVariables,
    initializeEnvironmentVariables_AdvancedSamlRequest,
    initializeEnvironmentVariables_decodeSamlResponse,
    initializeEnvironmentVariables_logout
};