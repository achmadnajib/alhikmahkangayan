const { Pool } = require("pg");

let pool;

function connectionString() {
  return process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
}

function sanitizedConnectionString(url) {
  const parsed = new URL(url);
  ["sslmode", "sslcert", "sslkey", "sslrootcert"].forEach(key => parsed.searchParams.delete(key));
  return parsed.toString();
}

function db() {
  const url = connectionString();
  if (!url) throw new Error("POSTGRES_URL belum tersedia di Environment Variables Vercel.");
  if (!pool) {
    pool = new Pool({
      connectionString: sanitizedConnectionString(url),
      ssl: { rejectUnauthorized: false },
      max: 1
    });
  }
  return pool;
}

async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = async function handler(req, res) {
  try {
    const client = db();
    await ensureTable(client);

    if (req.method === "GET") {
      const result = await client.query("SELECT data, updated_at FROM app_state WHERE id = $1", ["main"]);
      const row = result.rows[0];
      return res.status(200).json({ db: row?.data || null, updated_at: row?.updated_at || null });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      if (!body.db || typeof body.db !== "object") {
        return res.status(400).json({ error: "Payload db wajib berupa object." });
      }

      await client.query(
        `
          INSERT INTO app_state (id, data, updated_at)
          VALUES ($1, $2::jsonb, NOW())
          ON CONFLICT (id)
          DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        `,
        ["main", JSON.stringify(body.db)]
      );
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method tidak didukung." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Database online belum siap atau konfigurasi Supabase Postgres salah.",
      detail: error.message
    });
  }
};
