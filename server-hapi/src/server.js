require('dotenv').  config();

const Hapi = require('hapi');
const AuthCookie = require('hapi-auth-cookie');
const Bell = require('bell');
const AuthBasic = require('hapi-auth-basic');

const routes = require('./routes');

const validate = async (request, username, password, h) => {
    return {
        isValid: true,
        credentials:
        {
            displayName: username
        }
    };
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