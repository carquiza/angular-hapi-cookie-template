

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
                    facebookId: profile.id,
                    displayName: profile.displayName
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

                const profile = request.auth.credentials.profile;
                request.cookieAuth.set({
                    provider: 'google',
                    googleId: profile.id,
                    displayName: profile.displayName
                });
                return h.redirect('/');
            }
        },
    }
]