const zlib = require('zlib');
const xml2js = require('xml2js');

function base64Decode(base64String) {
    return Buffer.from(base64String, 'base64').toString('utf8');
}

function base64Encode(string) {
    return Buffer.from(string, 'utf8').toString('base64');
}

function removeEscapeCharacters(xmlString) {
    return xmlString.replace(/\\/g, '').replace(/^"|"$/g, '');
}

function parseXmlStringSync(xmlString) {
    let result;
    xml2js.parseString(xmlString, (err, parsedResult) => {
        if (err) {
            throw new Error('Failed to parse XML string');
        }
        result = parsedResult;
    });
    return result;
}

function buildXmlString(jsonObject) {
    const builder = new xml2js.Builder({ headless: true });
    return builder.buildObject(jsonObject);
}

function decompressString(compressedString) {
    return new Promise((resolve, reject) => {
        zlib.inflateRaw(compressedString, (err, decoded) => {
            if (err) {
                return reject(new Error('Failed to decompress string'));
            }
            resolve(decoded.toString('utf8'));
        });
    });
}

function compressString(string) {
    return new Promise((resolve, reject) => {
        zlib.deflateRaw(string, (err, compressed) => {
            if (err) {
                return reject(new Error('Failed to compress string'));
            }
            resolve(compressed.toString('base64'));
        });
    });
}

async function decodeSamlRequest(samlRequestEncoded) {
    try {
        const buffer = Buffer.from(samlRequestEncoded, 'base64');
        const decoded = await decompressString(buffer);
        const samlRequestXml = removeEscapeCharacters(decoded);
        return samlRequestXml;
    } catch (err) {
        throw new Error('Failed to decode SAML request');
    }
}

function decodeSamlResponse(samlResponse) {
    try {
        let decodedResponse = base64Decode(samlResponse);
        decodedResponse = removeEscapeCharacters(decodedResponse);
        return decodedResponse;
    } catch (err) {
        throw new Error('Failed to decode SAML response');
    }
}

async function encodeSamlRequest(samlRequestXml) {
    try {
        const compressed = await compressString(samlRequestXml);
        return compressed;
    } catch (err) {
        throw new Error('Failed to encode SAML request');
    }
}

module.exports = {
    decodeSamlRequest,
    decodeSamlResponse,
    encodeSamlRequest,
    parseXmlStringSync
};