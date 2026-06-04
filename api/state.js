const { sql } = require("@vercel/postgres");

async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

module.exports = async function handler(req, res) {
  try {
    await ensureTable();

    if (req.method === "GET") {
      const result = await sql`SELECT data, updated_at FROM app_state WHERE id = 'main'`;
      const row = result.rows[0];
      return res.status(200).json({ db: row?.data || null, updated_at: row?.updated_at || null });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      if (!body.db || typeof body.db !== "object") {
        return res.status(400).json({ error: "Payload db wajib berupa object." });
      }

      await sql`
        INSERT INTO app_state (id, data, updated_at)
        VALUES ('main', ${JSON.stringify(body.db)}::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method tidak didukung." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Database online belum siap atau konfigurasi Vercel Postgres salah.",
      detail: error.message
    });
  }
};
