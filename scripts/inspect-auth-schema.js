const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const { rows } = await client.query(
    "select table_schema, table_name from information_schema.tables where table_schema = 'auth' order by table_name"
  );
  console.log(rows.map(row => `${row.table_schema}.${row.table_name}`).join('\n'));
  await client.end();
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
