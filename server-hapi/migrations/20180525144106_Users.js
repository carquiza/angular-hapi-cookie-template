
exports.up = function (knex, Promise) {
    return knex
        .schema
        .createTable('users', function (usersTable) {
            usersTable.string('guid', 50).notNullable().primary();
            usersTable.integer('loginTypes');

            usersTable.string('name', 50);
            usersTable.timestamp('created_at').notNullable();
        })
        .createTable('login_email', function (loginEmailTable) {
            loginEmailTable.string('guid').references('guid').inTable('users');

            loginEmailTable.string('email', 50).notNullable().unique();
            loginEmailTable.string('password', 50).notNullable();
            loginEmailTable.string('salt', 50);
            loginEmailTable.timestamp('created_at').notNullable();

            loginEmailTable.index('email');
        })
        .createTable('login_facebook', function (loginFacebookTable) {
            loginFacebookTable.string('guid').references('guid').inTable('users');

            loginFacebookTable.string('name');
            loginFacebookTable.string('email');
            loginFacebookTable.string('facebook_id').notNullable().unique();
            loginFacebookTable.string('access_token');
            loginFacebookTable.dateTime('access_token_expires_at');
            loginFacebookTable.timestamp('created_at').notNullable();

            loginFacebookTable.index('facebook_id');
        })
        .createTable('login_google', function (loginGoogleTable) {
            loginGoogleTable.string('guid').references('guid').inTable('users');

            loginGoogleTable.string('name');
            loginGoogleTable.string('email');
            loginGoogleTable.string('google_id').notNullable().unique();
            loginGoogleTable.string('access_token');
            loginGoogleTable.dateTime('access_token_expires_at');
            loginGoogleTable.timestamp('created_at').notNullable();

            loginGoogleTable.index('google_id');
        })
        ;
};

exports.down = function (knex, Promise) {
    return knex
        .schema
        .dropTableIfExists('login_email')
        .dropTableIfExists('login_facebook')
        .dropTableIfExists('login_google')
        .dropTableIfExists('users')
};
