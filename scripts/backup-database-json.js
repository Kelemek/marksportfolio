#!/usr/bin/env node
/*
  Simple Supabase JSON backup script used by GitHub Actions.
  - Uses SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
  - BACKUP_TABLES env var (comma-separated) can override the default table list
  - Produces a gzipped JSON file in `portfolio-next/backups/` named `backup_YYYY-MM-DD_HH-mm-ss.json.gz`

  NOTE: This script uses the Supabase service role key. Keep that secret safe
  and store it in GitHub Secrets as `SUPABASE_SERVICE_KEY`.
*/

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
    process.exit(1);
  }

  // Discover tables from information_schema if not explicitly provided
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  // Always discover public tables from information_schema
  let tables = [];
  console.log('Discovering public tables from information_schema...');
  try {
    // Query information_schema.tables for public schema
    const { data: infoRows, error: infoErr } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name', { ascending: true });

    if (infoErr) {
      console.warn('Could not query information_schema.tables, falling back to defaults:', infoErr.message || infoErr);
    } else if (Array.isArray(infoRows)) {
      tables = infoRows
        .map(r => r.table_name)
        .filter(Boolean)
        // Skip common system / metadata tables you don't want backed up
        .filter(name => !name.startsWith('pg_') && !name.startsWith('sql_') && name !== 'geometry_columns' && name !== 'spatial_ref_sys');
    }
  } catch (err) {
    console.warn('Exception while discovering tables:', err && err.message ? err.message : String(err));
  }

  // Fallback if discovery failed or returned nothing
  const defaultTables = [
    'projects',
    'skills',
    'certificates',
    'jobs',
    'settings'
  ];
  if (!tables || tables.length === 0) {
    console.log('Using default table list');
    tables = defaultTables;
  }

  console.log('Backing up tables:', tables.join(', '));

  const backup = {
    metadata: {
      timestamp: new Date().toISOString(),
      tables: tables
    },
    tables: {}
  };

  for (const table of tables) {
    try {
      console.log(`Fetching ${table}...`);
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`Warning: error fetching ${table}:`, error.message || error);
        backup.tables[table] = { error: String(error), data: [] };
        continue;
      }
      backup.tables[table] = { count: Array.isArray(data) ? data.length : 0, data };
    } catch (err) {
      console.warn(`Exception fetching ${table}:`, err && err.message ? err.message : String(err));
      backup.tables[table] = { error: String(err), data: [] };
    }
  }

  // Ensure backups directory exists (script is run from repo root)
  const outDir = path.join(process.cwd(), 'portfolio-next', 'backups');
  fs.mkdirSync(outDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup_${stamp}.json`;
  const gzName = `${fileName}.gz`;
  const filePath = path.join(outDir, fileName);
  const gzPath = path.join(outDir, gzName);

  fs.writeFileSync(filePath, JSON.stringify(backup, null, 2), 'utf8');
  const gz = zlib.gzipSync(fs.readFileSync(filePath));
  fs.writeFileSync(gzPath, gz);

  // Remove the uncompressed JSON to keep only gz
  try { fs.unlinkSync(filePath); } catch (e) {}

  console.log('Backup written to', gzPath);
}

main().catch(err => {
  console.error('Backup failed:', err && err.message ? err.message : String(err));
  process.exit(1);
});
