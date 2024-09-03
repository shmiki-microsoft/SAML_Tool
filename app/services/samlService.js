const zlib = require('zlib');
const xml2js = require('xml2js');
const logger = require('../utils/logger');
const { promisify } = require('util');
const { base64Decode } = require('../utils/base64Utils');
const {removeEscapeCharacters, parseXmlString} = require('../utils/xmlUtils');
const inflateRawAsync = promisify(zlib.inflateRaw);
const deflateRawAsync = promisify(zlib.deflateRaw);

async function handleError(operation, error) {
    const errorMessage = `Failed to ${operation}: ${error.message || error}`;
    throw new Error(errorMessage);
}

async function processString(string, operation) {
    try {
        const processed = await operation(string);
        return processed.toString('utf8');
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
        return removeEscapeCharacters(decoded);
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

module.exports = {
    decodeSamlRequest,
    decodeSamlResponse,
    encodeSamlRequest,
    buildSamlRequest,
};