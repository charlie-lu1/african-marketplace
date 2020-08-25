const cleaner = require("knex-cleaner");

exports.seed = function (knex) {
  return cleaner.clean(knex, {
    mode: "truncate", //reset ids
    ignoreTables: ["knex_migrations", "knex_migrations_lock"], //don't empty migration tables
  });
};