'use strict';

exports.plugin = {
    pkg: require('./package.json'),
    register: async function (server, options)
    {
        server.route(require('./routes')(options));
    }
}
