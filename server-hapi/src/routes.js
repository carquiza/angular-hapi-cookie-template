const axios = require('axios');
const isemail = require('isemail');
const db = require('./db');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

module.exports = [
    {
        method: "GET", path: "/",
        options: { auth: false },
        handler: function (request, h) {
            return { text: 'Token not required' };
        }
    },
    {
        method: '*', path: '/auth/me',
        options: { auth: 'session' },
        handler: function (request, h) {
            if (request.auth.isAuthenticated)
            {
                var displayImage = '';
                if (request.auth.credentials.provider == 'facebook')
                {
                    displayImage = `http://graph.facebook.com/${request.auth.credentials.facebookId}/picture?type=square`;
                }
                else if (request.auth.credentials.provider == 'google')
                {
                    displayImage = request.auth.credentials.displayImage;
                }
                else
                {
                    displayImage = 'assets/img/account_circle.png';
                }
                return {
                    displayName: request.auth.credentials.displayName,
                    displayImage: displayImage
                }
            }
            else
            {
                return {};
            }
            return `Hello ${request.auth.credentials.displayName} from ${request.auth.credentials.provider}`;
        }
    },
    {
        method: 'GET',
        path: '/auth/logout',
        options: {
            auth: false,
            handler: function (request, h) {
                request.cookieAuth.clear();
                return h.redirect('/');
            }
        }
    },
    {
        method: 'POST',
        path: '/auth/register_email',
        options: { auth: false },
        handler: async function (request, h) {
            let payload = request.payload;
            let email = payload.email;
            let password = payload.password;
            if (!isemail.validate(email))
            {
                return h.response({ error: "Invalid email" });
            }
            if (password.length < 7)
            {
                return h.response({error:"Password should be at least 7 characters long."})
            }
            // Try-create email/password combination
            try {
                let trx = db.transaction();
                var guid = uuidv4();
                var res = await db.select('guid').where('email', email).from('login_email').transacting(trx);
                if (res.length != 0)
                {
                    trx.rollback();
                    return h.response({ error: 'Email already registered.' });
                }

                var hashed_password = await bcrypt.hash(password, 10);
                var now = db.fn.now();
                res = await db.insert({ guid: guid, loginTypes: 1, name: email, created_at: now }).into('users').transacting(trx);
                res = await db.insert({ guid: guid, email: email, password: hashed_password, created_at: now }).into('login_email').transacting(trx);

                await trx.commit();
                return h.response({ guid: guid });
            }
            catch (error)
            {
                await t.rollback();
            }
        }
    },
    {
        method: '*',
        path: '/auth/login_email',
        options: {
            auth: {
                strategy: 'simple',
                mode: 'try'
            },
            handler: function (request, h) {
                if (!request.auth.isAuthenticated) {
                    return 'Authentication failed: ' + request.auth.error.message;
                }

                const credentials = request.auth.credentials;
                request.cookieAuth.set({
                    provider: 'email',
                    displayName: credentials.displayName,
                });
                return h.response({});
            }
        }
    },
    {
        method: '*',
        path: '/auth/login_facebook',
        options: {
            auth: {
                strategy: 'facebook',
                mode: 'try'
            },
            handler: function (request, h) {
                if (!request.auth.isAuthenticated) {
                    return 'Authentication failed: '+request.auth.error.message;
                }

                const profile = request.auth.credentials.profile;
                request.cookieAuth.set({
                    provider: 'facebook',
                    facebookId: profile.id,             displayName: profile.displayName
                });
                return h.redirect('/');
            }
        },
    },
    {
        method: '*',
        path: '/auth/login_google',
        options: {
            auth: {
                strategy: 'google',
                mode: 'try'
            },
            handler: function (request, h) {
                if (!request.auth.isAuthenticated) {
                    return 'Authentication failed: ' + request.auth.error.message;
                }

                console.log(JSON.stringify(request.auth.credentials));
                const profile = request.auth.credentials.profile;
                request.cookieAuth.set({
                    provider: 'google',
                    googleId: profile.id,
                    displayName: profile.displayName,
                    displayImage: profile.raw.picture
                });
                return h.redirect('/');
            }
        },
    }
]