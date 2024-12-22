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

module.exports = { initializeEnvironmentVariables };