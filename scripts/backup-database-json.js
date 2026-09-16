#!/usr/bin/env node
/*
  Supabase JSON backup for GitHub Actions.
  Requires SUPABASE_URL and SUPABASE_SERVICE_KEY.
  Writes portfolio-next/backups/backup_<timestamp>.json.gz
*/

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const TABLES = ['projects', 'skills', 'certificates', 'jobs', 'settings'];

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
    process.exit(1);
  }

  const supabasePath = path.join(
    __dirname,
    '..',
    'portfolio-next',
    'node_modules',
    '@supabase',
    'supabase-js'
  );
  const { createClient } = require(supabasePath);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  console.log('Backing up tables:', TABLES.join(', '));

  const backup = {
    metadata: {
      timestamp: new Date().toISOString(),
      tables: TABLES,
    },
    tables: {},
  };

  for (const table of TABLES) {
    try {
      console.log(`Fetching ${table}...`);
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`Warning: error fetching ${table}:`, error.message || error);
        backup.tables[table] = { error: String(error), data: [] };
        continue;
      }
      backup.tables[table] = {
        count: Array.isArray(data) ? data.length : 0,
        data,
      };
    } catch (err) {
      console.warn(
        `Exception fetching ${table}:`,
        err && err.message ? err.message : String(err)
      );
      backup.tables[table] = { error: String(err), data: [] };
    }
  }

  const outDir = path.join(process.cwd(), 'portfolio-next', 'backups');
  fs.mkdirSync(outDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup_${stamp}.json`;
  const gzPath = path.join(outDir, `${fileName}.gz`);

  fs.writeFileSync(path.join(outDir, fileName), JSON.stringify(backup, null, 2), 'utf8');
  const gz = zlib.gzipSync(fs.readFileSync(path.join(outDir, fileName)));
  fs.writeFileSync(gzPath, gz);

  try {
    fs.unlinkSync(path.join(outDir, fileName));
  } catch {
    // ignore
  }

  console.log('Backup written to', gzPath);
}

main().catch((err) => {
  console.error('Backup failed:', err && err.message ? err.message : String(err));
  process.exit(1);
});
