const zlib = require('zlib');
const xml2js = require('xml2js');
const logger = require('../utils/logger');
const { promisify } = require('util');
const { base64Decode } = require('../utils/base64Utils');
const {removeEscapeCharacters, parseXmlString} = require('../utils/xmlUtils');
const inflateRawAsync = promisify(zlib.inflateRaw);
const deflateRawAsync = promisify(zlib.deflateRaw);

async function decompressString(compressedString) {
    try {
        const decoded = await inflateRawAsync(compressedString);
        return decoded.toString('utf8');
    } catch (err) {
        throw new Error('Failed to decompress string');
    }
}

async function compressString(string) {
    try {
        const compressed = await deflateRawAsync(string);
        return compressed.toString('base64');
    } catch (err) {
        throw new Error('Failed to compress string');
    }
}

async function decodeSamlRequest(samlRequestEncoded) {
    try {
        const buffer = Buffer.from(samlRequestEncoded, 'base64');
        const decoded = await decompressString(buffer);
        return removeEscapeCharacters(decoded);
    } catch (err) {
        throw new Error('Failed to decode SAML request');
    }
}

function decodeSamlResponse(samlResponse) {
    try {
        let decodedResponse = base64Decode(samlResponse);
        return removeEscapeCharacters(decodedResponse);
    } catch (err) {
        throw new Error('Failed to decode SAML response');
    }
}

async function encodeSamlRequest(samlRequestXml) {
    try {
        return await compressString(samlRequestXml);
    } catch (err) {
        throw new Error('Failed to encode SAML request');
    }
}

async function buildSamlRequestSync(samlRequestXml,relayState) {
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
        throw new Error(`Failed to build SAML request: ${err.message}`);
    }
}

module.exports = {
    decodeSamlRequest,
    decodeSamlResponse,
    encodeSamlRequest,
    buildSamlRequestSync
};