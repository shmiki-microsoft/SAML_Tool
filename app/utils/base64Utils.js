function base64Decode(base64String) {
    return Buffer.from(base64String, 'base64').toString('utf8');
}

function base64Encode(string) {
    return Buffer.from(string, 'utf8').toString('base64');
}

module.exports = {
    base64Decode,
    base64Encode
};