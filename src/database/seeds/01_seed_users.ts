import { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  await knex('transactions').del();
  await knex('wallets').del();
  await knex('users').del();

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    {
      id: uuidv4(),
      email: 'john.doe@example.com',
      password: hashedPassword,
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+2348012345678',
      is_blacklisted: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      email: 'jane.smith@example.com',
      password: hashedPassword,
      first_name: 'Jane',
      last_name: 'Smith',
      phone_number: '+2348087654321',
      is_blacklisted: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  await knex('users').insert(users);

  const wallets = users.map((user) => ({
    id: uuidv4(),
    user_id: user.id,
    balance: 10000.0,
    currency: 'NGN',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await knex('wallets').insert(wallets);

  console.log('✅ Seed data inserted successfully');
}
