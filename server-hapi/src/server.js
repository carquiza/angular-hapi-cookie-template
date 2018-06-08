"use strict";

require('dotenv').config();

const Hapi = require('hapi');
const AuthCookie = require('hapi-auth-cookie');
const Bell = require('bell');
const Db = require('./db');
const Bcrypt = require('bcrypt');

const init = async () => {
    const server = Hapi.Server({ port: 3030 });

    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
    server.app.cache = cache;

    try {
        await server.register([AuthCookie, Bell]);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }

    server.auth.strategy('session', 'cookie', {
        password: process.env.COOKIE_PASSWORD,
        cookie: 'artoftech-cookie',
        isSecure: false,
        //        isSameSite: true,
        clearInvalid: true,
        validateFunc: async (request, session) => {
            const cached = await cache.get(session.sid);
            const out = {
                valid: !!cached
            }

            if (out.valid) {
                out.credentials = cached.account
            }

            return out;
        }
    });

    server.auth.strategy('facebook', 'bell', {
        provider: 'facebook',
        password: process.env.COOKIE_PASSWORD,
        isSecure: true,
        clientId: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        location: process.env.BASE_URL,
    });

    server.auth.strategy('google', 'bell', {
        provider: 'google',
        password: process.env.COOKIE_PASSWORD,
        isSecure: true,
        clientId: process.env.GOOGLE_APP_ID,
        clientSecret: process.env.GOOGLE_APP_SECRET,
        location: process.env.BASE_URL,
    });
    //    server.auth.strategy('artoftech-cookie', 'cookie', authCookieOptions);

    // This should be registered only after all auth strategies are configured
    try {
        await server.register({
            plugin: require('./lib/users'),
            options: {
                knex: Db
            }
        });
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }

    server.state('session', {
        ttl: 1000 * 60 * 60 * 24, // 1 day in milliseconds
        encoding: 'base64json'
    });

    await server.start();
    return server;
}

init().then((server) => {
    console.log(`Server started at ${server.info.uri}`);
})
.catch((error) => {
    console.log(`Could not start server: ${error}`);
});