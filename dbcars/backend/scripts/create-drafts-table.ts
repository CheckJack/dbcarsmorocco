/**
 * Create Booking Drafts Table Migration
 * 
 * This script creates the booking_drafts table if it doesn't exist.
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dbcars_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function applyMigration() {
  console.log('🔧 Creating booking_drafts table...\n');
  console.log('Database Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'dbcars_db'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
  console.log('');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database successfully\n');

    // Read migration file
    console.log('📄 Reading migration file...');
    const migrationPath = path.join(__dirname, '../migrations/create_booking_drafts_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded\n');

    // Apply migration
    console.log('⚙️  Executing migration...');
    await pool.query(sql);
    console.log('✅ Migration executed successfully\n');

    // Verify table exists
    console.log('🔍 Verifying table creation...');
    const { rows } = await pool.query(
      `SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'booking_drafts'
      ) as exists`
    );
    
    if (rows[0].exists) {
      console.log('✅ Table "booking_drafts" created successfully!\n');
    } else {
      console.log('❌ Table "booking_drafts" was not created\n');
    }

    console.log('✨ Migration completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('  1. Restart your backend server');
    console.log('  2. The drafts API will now be available at /api/admin/drafts');
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check your database credentials in .env');
    console.error('  2. Ensure PostgreSQL is running');
    console.error('  3. Verify you have permission to modify the database');
    console.error('  4. Check if the dbcars_db database exists');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
applyMigration();

