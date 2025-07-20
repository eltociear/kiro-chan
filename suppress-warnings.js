// Suppress punycode deprecation warnings
const originalEmit = process.emit;
const originalWrite = process.stderr.write;

// Suppress warning events
process.emit = function (name, data, ...args) {
    if (
        name === 'warning' &&
        typeof data === 'object' &&
        data.name === 'DeprecationWarning' &&
        data.message && 
        data.message.includes('punycode')
    ) {
        return false;
    }
    return originalEmit.apply(process, arguments);
};

// Suppress stderr output containing punycode warnings
process.stderr.write = function (chunk, encoding, callback) {
    if (typeof chunk === 'string' && chunk.includes('punycode')) {
        // Skip writing punycode warnings to stderr
        if (typeof encoding === 'function') {
            encoding(); // encoding is actually the callback
        } else if (typeof callback === 'function') {
            callback();
        }
        return true;
    }
    return originalWrite.apply(process.stderr, arguments);
};

module.exports = {};
