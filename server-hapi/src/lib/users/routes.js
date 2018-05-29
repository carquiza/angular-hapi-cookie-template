"use strict";

module.exports = (options) => {
    const handlers = require('./handlers')(options);
    return [
        {
            method: 'GET',
            path: '/auth/test',
            options: {
                auth: false,
                handler: handlers.testHandler,
            }
        },
        {
            method: 'GET',
            path: '/auth/test2',
            options: {
                auth: false,
                handler: handlers.testHandler2,
            }
        },
    ]
};