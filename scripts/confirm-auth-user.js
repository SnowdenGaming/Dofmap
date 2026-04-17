const { Client } = require('pg');

async function main() {
  const email = process.argv[2];
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquant.');
  if (!email) throw new Error('Usage: node scripts/confirm-auth-user.js email@example.com');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const { rowCount } = await client.query(
    `
    update auth.users
    set email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where lower(email) = lower($1)
    `,
    [email]
  );
  await client.end();
  console.log(rowCount ? `Utilisateur confirmé: ${email}` : `Utilisateur introuvable: ${email}`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
