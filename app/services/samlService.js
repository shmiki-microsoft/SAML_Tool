const zlib = require('zlib');
const xml2js = require('xml2js');
const logger = require('../utils/logger');
const { promisify } = require('util');
const { base64Decode } = require('../utils/base64Utils');
const {removeEscapeCharacters, parseXmlString} = require('../utils/xmlUtils');
const inflateRawAsync = promisify(zlib.inflateRaw);
const deflateRawAsync = promisify(zlib.deflateRaw);
const builder = require('xmlbuilder');
const { v4: uuidv4 } = require('uuid');

async function handleError(operation, error) {
    const errorMessage = `Failed to ${operation}: ${error.message || error}`;
    throw new Error(errorMessage);
}

async function processString(string, operation) {
    try {
        const processed = await operation(string);
        return processed
    } catch (err) {
        await handleError('process string', err);
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
        await handleError('decode SAML request', err);
    }
}

function decodeSamlResponse(samlResponse) {
    try {
        const decodedResponse = base64Decode(samlResponse);
        return removeEscapeCharacters(decodedResponse);
    } catch (err) {
        handleError('decode SAML response', err);
    }
}

async function encodeSamlRequest(samlRequestXml) {
    try {
        const compressed = await compressString(samlRequestXml);
        return Buffer.from(compressed, 'utf8').toString('base64');
    } catch (err) {
        await handleError('encode SAML request', err);
    }
}

async function buildSamlRequest(samlRequestXml, relayState) {
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

        logger.info('SAML request built successfully');
        logger.debug('Encoded SAML request:', encoded);

        return loginUrl;
    } catch (err) {
        await handleError('build SAML request', err);
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

module.exports = {
    decodeSamlRequest,
    decodeSamlResponse,
    encodeSamlRequest,
    buildSamlRequest,
    buildSampleSamlRequest,
};