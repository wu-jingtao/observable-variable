/**
 * 浏览器端，所有内容都导出到ov命名空间下
 */

function getGlobal() {
    if (typeof self !== 'undefined') { return self; }
    if (typeof window !== 'undefined') { return window; }
    if (typeof global !== 'undefined') { return global; }
    throw new Error('unable to locate global object');
};

getGlobal().ov = require('../bin/index');