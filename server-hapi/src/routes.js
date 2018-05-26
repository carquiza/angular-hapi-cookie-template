const axios = require('axios');

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
                };
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
        method: '*',
        path: '/auth/login_email',
        options: {
            auth: {
                strategy: 'simple',
            },
            handler: function (request, h) {
                if (!request.auth.isAuthenticated) {
                    return 'Authentication failed: ' + request.auth.error.message;
                }

                const credentials = request.auth.credentials;
                request.cookieAuth.set({
                    provider: 'email',
                    displayName: credentials.displayName
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