"use strict";

const Axios = require('axios');
const Isemail = require('isemail');
const Bcrypt = require('bcrypt');
const Uuidv4 = require('uuid/v4');

const getCookie = (request) => {
    if (request.state.session) return request.state.session;

    return {
        isAuthenticated: false
    };
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
                let ret_error = "";
                if (!Isemail.validate(email)) {
                    return h.response({ error: "Invalid email" });
                }
                if (password.length < 7) {
                    return h.response({ error: "Password should be at least 7 characters long." })
                }
                // Try-create email/password combination
                let success = false;
                try {
                    let guid = null;
                    await Db.transaction(async function (trx) {
                        guid = Uuidv4();
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
                    });
                    if (success) {
                        let cookieauth = request.cookieAuth;
                        const sid = Uuidv4();
                        const account = {
                            userid: guid,
                            provider: 'email',
                            email: email,
                            displayName: email,
                        }
                        await request.server.app.cache.set(sid, { account: account }, 0);
                        request.cookieAuth.set({ sid: sid });
                        return h.response({ redirect: "/" });
                    }
                    else {
                        return h.response({ error: "Could not add user" });
                    }
                }
                catch (error) {
                    //                await t.rollback();
                    return h.response({ error: error.message });
//                    console.log(error);
                }
//                console.log(success);
            }
        },
        {
            method: '*',
            path: '/auth/login_email',
            options: { auth: false },
            handler: async (request, h) => {
                try {
                    const email = request.payload.email;
                    const password = request.payload.password;

                    let res = await Db.select('guid', 'password').where('email', email).from('login_email');
                    if (res.length == 0) {
                        return h.response({ error: 'Invalid username or password.' });
                    }
                    if (await Bcrypt.compare(password, res[0].password)) {
                        let cookieauth = request.cookieAuth;
                        const credentials = request.auth.credentials;
                        const sid = Uuidv4();
                        const account = {
                            userid: res['guid'],
                            provider: 'email',
                            email: email,
                            displayName: email,
                        }
                        await request.server.app.cache.set(sid, { account: account }, 0);
                        request.cookieAuth.set({ sid: sid });
                        return h.response({ redirect: '/' });
                    }
                    else {
                        return h.response({ error: 'Invalid username or password.' });
                    }
                }
                catch (error) {
                    return h.response({ error: 'Invalid username or password.' });
                }

                if (!request.auth.isAuthenticated) {
                    return h.response({ error: request.auth.error.message });
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
                    let guid = null;

                    try {
                        const trx = Db.transaction();
                        let res = await Db.select('guid').where('facebook_id', profile.id).from('login_facebook').transacting(trx);

                        const expiryInMS = request.auth.credentials.expiresIn * 1000;
                        const expiryDate = new Date((new Date()).getTime() + expiryInMS);

                        if (res.length <= 0) {
                            const now = Db.fn.now();
                            guid = Uuidv4();
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
                        else
                        {
                            guid = res[0]['guid'];
                        }

                        await trx.commit();
                    }
                    catch (error) {
                        await t.rollback();
                        console.log("ERROR: " + error);
                        return h.redirect('/');
                    }

                    const sid = Uuidv4();
                    const account = {
                        userid: guid,
                        provider: 'facebook',
                        facebookId: profile.id,
                        displayName: profile.displayName,
                        displayImage: profile.picture.data.url,
                    }
                    await request.server.app.cache.set(sid, { account: account }, 0);
                    request.cookieAuth.set({ sid: sid });

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

//                    console.log(JSON.stringify(request.auth.credentials));
                    const profile = request.auth.credentials.profile;
                    let guid = null;

                    try {
                        const trx = Db.transaction();
                        let res = await Db.select('guid').where('google_id', profile.id).from('login_google').transacting(trx);

                        const expiryInMS = request.auth.credentials.expiresIn * 1000;
                        const expiryDate = new Date((new Date()).getTime() + expiryInMS);

                        if (res.length <= 0) {
                            const now = Db.fn.now();
                            guid = Uuidv4();
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
                        else {
                            guid = res[0]['guid'];
                        }

                        await trx.commit();
                    }
                    catch (error) {
                        await t.rollback();
                        console.log("ERROR: " + error);
                        return h.redirect('/');
                    }

                    const sid = Uuidv4();
                    const account = {
                        userid: guid,
                        provider: 'google',
                        googleId: profile.id,
                        displayName: profile.displayName,
                        displayImage: profile.raw.picture
                    }
                    await request.server.app.cache.set(sid, { account: account }, 0);
                    request.cookieAuth.set({ sid: sid });

                    return h.redirect('/');
                }
            },
        }
    ]
};