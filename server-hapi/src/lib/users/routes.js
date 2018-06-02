"use strict";

const Axios = require('axios');
const Isemail = require('isemail');
const Bcrypt = require('bcrypt');
const Uuidv4 = require('uuid/v4');

const addFacebookUser = () => {

}

module.exports = (options) => {
    const handlers = require('./handlers')(options);
    const Db = options.knex;
    return [
        {
            method: "GET", path: "/",
            options: { auth: false },
            handler: (request, h) => {
                return { text: 'Token not required' };
            }
        },
        {
            method: '*', path: '/auth/me',
            options: { auth: 'session' },
            handler: (request, h) => {
                if (request.auth.isAuthenticated) {
                    let displayImage = '';
                    if (request.auth.credentials.provider == 'facebook') {
                        //                    displayImage = `http://graph.facebook.com/${request.auth.credentials.facebookId}/picture?type=square`;
                        displayImage = request.auth.credentials.displayImage;
                    }
                    else if (request.auth.credentials.provider == 'google') {
                        displayImage = request.auth.credentials.displayImage;
                    }
                    else {
                        displayImage = 'assets/img/account_circle.png';
                    }
                    return h.response({
                        displayName: request.auth.credentials.displayName,
                        displayImage: displayImage
                    });
                }
                else {
                    return h.response({});
                }
                //return `Hello ${request.auth.credentials.displayName} from ${request.auth.credentials.provider}`;
            }
        },
        {
            method: 'GET',
            path: '/auth/logout',
            options: {
                auth: false,
                handler: (request, h) => {
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
                const payload = request.payload;
                const email = payload.email;
                const password = payload.password;
                if (!Isemail.validate(email)) {
                    return h.response({ error: "Invalid email" });
                }
                if (password.length < 7) {
                    return h.response({ error: "Password should be at least 7 characters long." })
                }
                // Try-create email/password combination
                let success = false;
                try {
                    const guid = await Db.transaction(async function (trx) {
                        const guid = Uuidv4();
                        let res = await trx.select('guid').where('email', email).from('login_email');
                        if (res.length != 0) {
                            throw new Error('Email already registered');
                            //                        trx.rollback();
                            //                        return h.response({ error: 'Email already registered.' });
                        }
                        const hashed_password = await Bcrypt.hash(password, 10);
                        const now = Db.fn.now();
                        res = await Db.insert({ guid: guid, loginTypes: 1, name: email, created_at: now }).into('users').transacting(trx);
                        res = await Db.insert({ guid: guid, email: email, password: hashed_password, created_at: now }).into('login_email').transacting(trx);

                        success = true;
                        //                    await trx.commit();
                        //                    return h.response({ guid: guid });
                    });
                }
                catch (error) {
                    //                await t.rollback();
                    return h.response({ error: error });
//                    console.log(error);
                }
                console.log(success);
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
                handler: (request, h) => {
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
                handler: async (request, h) => {
                    if (!request.auth.isAuthenticated) {
                        return 'Authentication failed: ' + request.auth.error.message;
                    }

                    const profile = request.auth.credentials.profile;

                    try {
                        const trx = Db.transaction();
                        const guid = Uuidv4();
                        let res = await Db.select('guid').where('facebook_id', profile.id).from('login_facebook').transacting(trx);

                        const expiryInMS = request.auth.credentials.expiresIn * 1000;
                        const expiryDate = new Date((new Date()).getTime() + expiryInMS);

                        if (res.length == 0) {
                            const now = Db.fn.now();
                            res = await Db.insert({
                                guid: guid,
                                loginTypes: 2,
                                name: profile.displayName,
                                created_at: now
                            }).into('users').transacting(trx);
                            res = await Db.insert({
                                guid: guid,
                                name: profile.displayName,
                                email: profile.email,
                                facebook_id: profile.id,
                                access_token: request.auth.credentials.token,
                                access_token_expires_at: expiryDate,
                                created_at: now
                            }).into('login_facebook').transacting(trx);
                        }

                        await trx.commit();
                    }
                    catch (error) {
                        await t.rollback();
                    }

                    request.cookieAuth.set({
                        provider: 'facebook',
                        facebookId: profile.id,
                        displayName: profile.displayName,
                        displayImage: profile.picture.data.url,
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
                handler: async (request, h) => {
                    if (!request.auth.isAuthenticated) {
                        return 'Authentication failed: ' + request.auth.error.message;
                    }

                    console.log(JSON.stringify(request.auth.credentials));
                    const profile = request.auth.credentials.profile;

                    try {
                        const trx = Db.transaction();
                        const guid = Uuidv4();
                        let res = await Db.select('guid').where('google_id', profile.id).from('login_google').transacting(trx);

                        const expiryInMS = request.auth.credentials.expiresIn * 1000;
                        const expiryDate = new Date((new Date()).getTime() + expiryInMS);

                        if (res.length == 0) {
                            const now = Db.fn.now();
                            res = await Db.insert({
                                guid: guid,
                                loginTypes: 2,
                                name: profile.displayName,
                                created_at: now
                            }).into('users').transacting(trx);
                            res = await Db.insert({
                                guid: guid,
                                name: profile.displayName,
                                email: profile.email,
                                google_id: profile.id,
                                access_token: request.auth.credentials.token,
                                access_token_expires_at: expiryDate,
                                created_at: now
                            }).into('login_google').transacting(trx);
                        }

                        await trx.commit();
                    }
                    catch (error) {
                        await t.rollback();
                    }

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
};