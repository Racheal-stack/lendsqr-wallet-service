import knex, { Knex } from 'knex';
import knexConfig from './knexfile';
import config from '../config';

const environment = config.env as 'development' | 'test' | 'production';
const connectionConfig = knexConfig[environment];

const db: Knex = knex(connectionConfig);

export default db;
