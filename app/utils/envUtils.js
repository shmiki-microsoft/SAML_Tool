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

function initializeEnvironmentVariables_logout() {
    return {
        logoutURL: null,
        issuer: null,
        nameID: null,
        samlLogoutRequest: null,
        samlLogoutRequestEncodedUrl: null,
    };
}
module.exports = { initializeEnvironmentVariables,initializeEnvironmentVariables_logout };