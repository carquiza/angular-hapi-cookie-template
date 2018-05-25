require('dotenv').config();

module.exports = {
    development: {
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: 'budgetuser',
            password: 'budgetpassword?',
            database: 'budgetapp',
            charset: 'utf8',
        },

        migrations: { tableName: 'knex_migrations' },
        seeds: {tableName: './seeds'},
    }
}