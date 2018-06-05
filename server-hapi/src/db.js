"use strict";

const Knexfile = require('../knexfile');
const Knex = require('knex');

module.exports = Knex(
    Knexfile['development']
);