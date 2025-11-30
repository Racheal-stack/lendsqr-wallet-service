import type { Knex } from 'knex';
import config from '../config';
import path from 'path';

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'ts',
    },
  },

  test: {
    client: 'mysql2',
    connection: {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: `${config.database.database}_test`,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'ts',
    },
  },

 production: {
  client: 'mysql2',
  connection: process.env.DATABASE_URL, 
  pool: { min: 2, max: 20 },
  migrations: { tableName: 'knex_migrations', directory: 'dist/database/migrations', extension: 'js' },
  seeds: { directory: 'dist/database/seeds', extension: 'js' }
}

};

export default knexConfig;

module.exports = knexConfig;
