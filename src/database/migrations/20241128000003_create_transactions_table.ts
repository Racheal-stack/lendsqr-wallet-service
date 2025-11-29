import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('wallet_id').notNullable();
    table.uuid('reference_wallet_id').nullable();
    table.enum('type', ['FUNDING', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.decimal('balance_before', 15, 2).notNullable();
    table.decimal('balance_after', 15, 2).notNullable();
    table.string('reference', 100).notNullable().unique();
    table.text('description').nullable();
    table.enum('status', ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED']).defaultTo('PENDING');
    table.json('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('wallet_id').references('id').inTable('wallets').onDelete('CASCADE');
    table.foreign('reference_wallet_id').references('id').inTable('wallets').onDelete('SET NULL');

    table.index('wallet_id');
    table.index('reference_wallet_id');
    table.index('reference');
    table.index('type');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('transactions');
}
