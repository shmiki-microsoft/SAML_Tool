const xml2js = require('xml2js');
const { promisify } = require('util');
const parseStringAsync = promisify(xml2js.parseString);

async function parseXmlString(xmlString) {
    try {
        return await parseStringAsync(xmlString);
    } catch (err) {
        throw new Error('Failed to parse XML string');
    }
}

function buildXmlString(jsonObject) {
    const builder = new xml2js.Builder({ headless: true });
    return builder.buildObject(jsonObject);
}

function removeEscapeCharacters(xmlString) {
    return xmlString.replace(/\\/g, '').replace(/^"|"$/g, '');
}

module.exports = {
    parseXmlString,
    buildXmlString,
    removeEscapeCharacters
};