const { Pool } = require("pg");

let pool;

const REQUIRED_TABLES = [
  "users", "roles", "permissions", "students", "student_class_histories", "teachers",
  "classes", "subjects", "schedules", "academic_years", "semesters",
  "attendance_sessions", "attendance_records", "leave_requests", "attendance_logs",
  "holidays", "lesson_hours", "settings", "notifications", "meetings",
  "rank_periods", "rank_results"
];

function connectionString() {
  return process.env.POSTGRES_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.DATABASE_URL;
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
      revision BIGINT NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await client.query("ALTER TABLE app_state ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 1");
  await client.query(`
    CREATE TABLE IF NOT EXISTS app_state_backups (
      backup_id BIGSERIAL PRIMARY KEY,
      state_id TEXT NOT NULL,
      data JSONB NOT NULL,
      revision BIGINT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function validateState(db) {
  if (!db || typeof db !== "object" || Array.isArray(db)) return "Payload db wajib berupa object.";
  const missing = REQUIRED_TABLES.filter(table => !Array.isArray(db[table]));
  if (missing.length) return `Struktur database tidak lengkap: ${missing.join(", ")}.`;
  if (!db.users.some(user => user && user.role === "super_admin" && user.active !== "false")) {
    return "Database wajib memiliki minimal satu Administrator aktif.";
  }
  return "";
}

async function backupCurrentState(client) {
  const current = await client.query("SELECT data, revision FROM app_state WHERE id = $1", ["main"]);
  if (!current.rows[0]) return;
  await client.query(
    "INSERT INTO app_state_backups (state_id, data, revision) VALUES ($1, $2::jsonb, $3)",
    ["main", JSON.stringify(current.rows[0].data), current.rows[0].revision || 1]
  );
  await client.query(`
    DELETE FROM app_state_backups
    WHERE backup_id NOT IN (
      SELECT backup_id FROM app_state_backups
      WHERE state_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    )
    AND state_id = $1
  `, ["main"]);
}

module.exports = async function handler(req, res) {
  try {
    const client = db();
    await ensureTable(client);

    if (req.method === "GET") {
      if (req.query?.health === "1") {
        const result = await client.query("SELECT revision, updated_at FROM app_state WHERE id = $1", ["main"]);
        const backup = await client.query("SELECT COUNT(*)::int AS count FROM app_state_backups WHERE state_id = $1", ["main"]);
        return res.status(200).json({
          ok: true,
          database: "online",
          revision: result.rows[0]?.revision || 0,
          updated_at: result.rows[0]?.updated_at || null,
          backups: backup.rows[0]?.count || 0
        });
      }

      const result = await client.query("SELECT data, revision, updated_at FROM app_state WHERE id = $1", ["main"]);
      const row = result.rows[0];
      return res.status(200).json({ db: row?.data || null, revision: row?.revision || 0, updated_at: row?.updated_at || null });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const invalid = validateState(body.db);
      if (invalid) return res.status(400).json({ error: invalid });

      const tx = await client.connect();
      try {
        await tx.query("BEGIN");
        await backupCurrentState(tx);
        const result = await tx.query(
          `
            INSERT INTO app_state (id, data, revision, updated_at)
            VALUES ($1, $2::jsonb, 1, NOW())
            ON CONFLICT (id)
            DO UPDATE SET data = EXCLUDED.data, revision = app_state.revision + 1, updated_at = NOW()
            RETURNING revision, updated_at
          `,
          ["main", JSON.stringify(body.db)]
        );
        await tx.query("COMMIT");
        return res.status(200).json({ ok: true, revision: result.rows[0]?.revision || 1, updated_at: result.rows[0]?.updated_at || null });
      } catch (error) {
        await tx.query("ROLLBACK");
        throw error;
      } finally {
        tx.release();
      }
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
