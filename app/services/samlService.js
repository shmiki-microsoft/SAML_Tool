const zlib = require('zlib');
const logger = require('../utils/logger');
const { promisify } = require('util');
const { base64Decode } = require('../utils/base64Utils');
const {removeEscapeCharacters, parseXmlString} = require('../utils/xmlUtils');
const inflateRawAsync = promisify(zlib.inflateRaw);
const deflateRawAsync = promisify(zlib.deflateRaw);
const builder = require('xmlbuilder');
const { handleErrorAsync } = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');
const querystring = require('querystring');

async function processString(string, operation) {
    try {
        const processed = await operation(string);
        return processed
    } catch (err) {
        await handleErrorAsync('process string', err);
    }
}

async function decompressString(compressedString) {
    return processString(compressedString, inflateRawAsync);
}

async function compressString(string) {
    return processString(string, deflateRawAsync);
}

async function decodeSamlRequest(samlRequestEncoded) {
    try {
        const buffer = Buffer.from(samlRequestEncoded, 'base64');
        const decoded = await decompressString(buffer);
        return removeEscapeCharacters(decoded.toString('utf8'));
    } catch (err) {
        await handleErrorAsync('decode SAML request', err);
    }
}

function decodeSamlResponse(samlResponse) {
    try {
        const decodedResponse = base64Decode(samlResponse);
        return removeEscapeCharacters(decodedResponse);
    } catch (err) {
        handleErrorAsync('decode SAML response', err);
    }
}

async function encodeSamlRequest(samlRequestXml) {
    try {
        const compressed = await compressString(samlRequestXml);
        return Buffer.from(compressed, 'utf8').toString('base64');
    } catch (err) {
        await handleErrorAsync('encode SAML request', err);
    }
}

async function buildSamlRequest(samlRequestXml, relayState, queryStringKeys, queryStringValues) {
    try {
        logger.info('Parsing SAML request XML');
        const result = await parseXmlString(samlRequestXml);
        const authnRequest = result.AuthnRequest || result['samlp:AuthnRequest'];

        if (!authnRequest) {
            throw new Error('AuthnRequest element not found in SAML request');
        }

        const destination = authnRequest.$.Destination || null;
        if (!destination) {
            throw new Error('Destination attribute not found in AuthnRequest');
        }

        logger.info('Encoding SAML request');
        const encoded = await encodeSamlRequest(samlRequestXml);

        let loginUrl = `${destination}?SAMLRequest=${encodeURIComponent(encoded)}`;
        if (relayState && relayState.trim() !== '') {
            loginUrl += `&RelayState=${encodeURIComponent(relayState)}`;
        }

        for (let i = 0; i < queryStringKeys.length; i++) {
            if (queryStringKeys[i] && queryStringKeys[i].trim() !== '' && queryStringValues[i] && queryStringValues[i].trim() !== '') {
                loginUrl += `&${encodeURIComponent(queryStringKeys[i])}=${encodeURIComponent(queryStringValues[i])}`;
            }
        }

        logger.info('SAML request built successfully');
        logger.debug('Encoded SAML request:', encoded);

        return loginUrl;
    } catch (err) {
        await handleErrorAsync('build SAML request', err);
    }
}

async function buildSampleSamlRequest(includeIssuer = 'off', includeNameIDPolicy = 'off', 
    includeAuthnContext = 'off', includeForceAuthn = 'off', includeIsPassive = 'off',
    includeScoping = 'off', includeSubject = 'off') {
    const doc = builder.create('samlp:AuthnRequest', { version: '1.0' })
        .att('xmlns:samlp', 'urn:oasis:names:tc:SAML:2.0:protocol')
        .att('xmlns:saml', 'urn:oasis:names:tc:SAML:2.0:assertion')
        .att('Version', '2.0')
        .att('ID', `_${uuidv4()}`)
        .att('IssueInstant', new Date().toISOString())
        .att('Destination', 'https://idp.example.com/saml2')
        .att('AssertionConsumerServiceURL', 'http://sp.example.com/acs')
        .att('ProtocolBinding', 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST');

    addOptionalAttributes(doc, { includeForceAuthn, includeIsPassive, includeIssuer, 
        includeNameIDPolicy, includeAuthnContext, includeScoping, includeSubject});

    const xmlString = doc.end({ pretty: true });
    return xmlString;
}

function addOptionalAttributes(doc, options) {
    if (options.includeForceAuthn === 'on') {
        doc.att('ForceAuthn', 'false');
    }
    if (options.includeIsPassive === 'on') {
        doc.att('IsPassive', 'false');
    }
    if (options.includeIssuer === 'on') {
        doc.ele('saml:Issuer', {}, 'sp.example.com');
    }
    if (options.includeNameIDPolicy === 'on') {
        doc.ele('samlp:NameIDPolicy', {
            Format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            AllowCreate: 'true'
        });
    }
    if (options.includeAuthnContext === 'on') {
        doc.ele('samlp:RequestedAuthnContext')
            .ele('saml:AuthnContextClassRef', {}, 'urn:oasis:names:tc:SAML:2.0:ac:classes:Password');
    }
    if (options.includeScoping === 'on') {
        const scoping = doc.ele('samlp:Scoping', { ProxyCount: '1' });
        const idpList = scoping.ele('samlp:IDPList');
        idpList.ele('samlp:IDPEntry', { ProviderID: 'https://idp.example.com/saml2' });
        scoping.ele('samlp:RequesterID', {}, 'https://proxy.example.com');
    }
    if (options.includeSubject === 'on') {
        const subject = doc.ele('saml:Subject');
        subject.ele('saml:NameID', { Format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified' }, 'user@example.com');
        subject.ele('saml:SubjectConfirmation',{ Method: 'urn:oasis:names:tc:SAML:2.0:cm:bearer' })
    }
}

async function createLoginRequestUrl(param) {
    const { issuer, destination, assertionConsumerServiceURL, 
        nameIDFormat, forceAuthn, authnContext, relayState} = param;
        try {
            let doc = builder.create('samlp:AuthnRequest', { version: '1.0' })
                .att('xmlns:samlp', 'urn:oasis:names:tc:SAML:2.0:protocol')
                .att('xmlns:saml', 'urn:oasis:names:tc:SAML:2.0:assertion')
                .att('Version', '2.0')
                .att('ID', `_${uuidv4()}`)
                .att('IssueInstant', new Date().toISOString())
                .att('Destination', destination)
                .att('AssertionConsumerServiceURL', assertionConsumerServiceURL||`${process.env.host}/acs`)
                .att('forceAuthn', forceAuthn)
                .att('ProtocolBinding', 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST');
            doc.ele('saml:Issuer', {}, issuer);
            doc.ele('samlp:NameIDPolicy', {
                Format: nameIDFormat,
                AllowCreate: 'true'
            });
            doc.ele('samlp:RequestedAuthnContext')
                .ele('saml:AuthnContextClassRef', {}, authnContext);

            const samlRequestXml = doc.end({ pretty: true });
            const encoded = await encodeSamlRequest(samlRequestXml);
            let loginUrl = `${destination}?SAMLRequest=${encodeURIComponent(encoded)}`;
            if (relayState && relayState.trim() !== '') {
                loginUrl += `&RelayState=${encodeURIComponent(relayState)}`;
            }
            return loginUrl;
        } catch (err) {
            await handleErrorAsync('build SAML request', err);
        }
}

async function createLogoutRequestUrl(param) {
    const { logoutURL, issuer, nameID} = param;
    try {
        let doc = builder.create('samlp:LogoutRequest', { version: '1.0' })
            .att('xmlns:samlp', 'urn:oasis:names:tc:SAML:2.0:protocol')
            .att('xmlns:saml', 'urn:oasis:names:tc:SAML:2.0:assertion')
            .att('Version', '2.0')
            .att('ID', `_${uuidv4()}`)
            .att('IssueInstant', new Date().toISOString())
            .att('Destination', logoutURL)
        doc.ele('saml:Issuer', {}, issuer);
        doc.ele('saml:NameID', { Format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified' }, nameID);

        const samlLogoutRequestXml = doc.end({ pretty: true });
        const encoded = await encodeSamlRequest(samlLogoutRequestXml);
        return `${logoutURL}?SAMLRequest=${encodeURIComponent(encoded)}`;
    } catch (err) {
        await handleErrorAsync('build SAML request', err);
    }
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
    decodeSamlRequest,
    decodeSamlResponse,
    encodeSamlRequest,
    buildSamlRequest,
    buildSampleSamlRequest,
    createLoginRequestUrl,
    createLogoutRequestUrl,
    extractSamlLogoutRequestDataFromLoginUrl
};