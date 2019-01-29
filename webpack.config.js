const path = require('path');

module.exports = {
    entry: './src/index.browser.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'bin/Browser'),
        filename: 'index.js'
    }
};