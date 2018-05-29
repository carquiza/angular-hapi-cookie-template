﻿"use strict";

require('dotenv').config();

const Hapi = require('hapi');
const AuthCookie = require('hapi-auth-cookie');
const Bell = require('bell');
const AuthBasic = require('hapi-auth-basic');
const db = require('./db');
const bcrypt = require('bcrypt');

const routes = require('./routes');

const validate = async (request, email, password, h) => {
    try {
        var res = await db.select('guid', 'password').where('email', email).from('login_email');
        if (res.length == 0) {
            return { isValid: false }
        }
        if (await bcrypt.compare(password, res[0].password)) {
            return {
                isValid: true,
                credentials:
                {
                    displayName: email
                }
            };
        }
        else {
            return { isValid: false };
        }
    }
    catch (error)
    {
        console.log(error);
    }
}

const init = async () => {
    const server = Hapi.Server({ port: 3030 });
    try {
        await server.register([AuthCookie, Bell, AuthBasic]);
    }
    catch (err)
    {
        console.error(err);
        process.exit(1);
    }

    server.auth.strategy('session', 'cookie', {
        password: process.env.COOKIE_PASSWORD,
        cookie: 'artoftech-cookie',
        isSecure: false,
//        isSameSite: true,
        clearInvalid:true
    });

    server.auth.strategy('simple', 'basic', { validate });

    server.auth.strategy('facebook', 'bell', {
        provider: 'facebook',
        password: process.env.COOKIE_PASSWORD,
        isSecure: true,
        clientId: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        location: 'https://local.artof.tech',
    });

    server.auth.strategy('google', 'bell', {
        provider: 'google',
        password: process.env.COOKIE_PASSWORD,
        isSecure: true,
        clientId: process.env.GOOGLE_APP_ID,
        clientSecret: process.env.GOOGLE_APP_SECRET,
        location: 'https://local.artof.tech',
    });
//    server.auth.strategy('artoftech-cookie', 'cookie', authCookieOptions);

    server.bind({
        session_lookup: []
    });
    server.route(routes);

    await server.start();
    return server;
}

init().then((server) => {
    console.log(`Server started at ${server.info.uri}`);
})
.catch((error) => {
    console.log(`Could not start server: ${error}`);
});