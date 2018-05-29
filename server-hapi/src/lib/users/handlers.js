'use strict';

module.exports = (options) => {
    return {
        testHandler: async (request, h) => {
            return h.response('testHandler() ' + options.myOptions);
        },
        testHandler2: async (request, h) => {
            return h.response('testHandler2()' + options.myOptions);
        },
    }
}