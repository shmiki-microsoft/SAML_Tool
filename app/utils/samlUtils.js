const zlib = require('zlib');

function decodeSamlRequest(samlRequestEncoded) {
    return new Promise((resolve, reject) => {
        try {
            // Decode the SAML Request
            const buffer = Buffer.from(samlRequestEncoded, 'base64');
            zlib.inflateRaw(buffer, (err, decoded) => {
                if (err) {
                    return reject(new Error('Failed to decompress SAML request'));
                }

                let samlRequestXml = decoded.toString('utf8');
                samlRequestXml = samlRequestXml.replace(/\\/g, ''); // バックスラッシュを削除
                samlRequestXml = samlRequestXml.replace(/^"|"$/g, ''); // 先頭と末尾の " を削除
                resolve(samlRequestXml);
            });
        } catch (err) {
            reject(new Error('Failed to decode SAML request'));
        }
    });
}


module.exports = {
    decodeSamlRequest
};