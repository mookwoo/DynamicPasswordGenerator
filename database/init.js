const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.dirname(__filename);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(__dirname, 'securepass.db');

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database');
        });

        // Create tables
        db.serialize(() => {
            // Users table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME,
                    email_verified BOOLEAN DEFAULT FALSE,
                    is_active BOOLEAN DEFAULT TRUE
                )
            `, (err) => {
                if (err) console.error('Error creating users table:', err);
                else console.log('✅ Users table created/verified');
            });

            // Saved passwords table
            db.run(`
                CREATE TABLE IF NOT EXISTS saved_passwords (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    website TEXT,
                    username TEXT,
                    password_encrypted TEXT NOT NULL,
                    notes TEXT,
                    category TEXT DEFAULT 'general',
                    is_favorite BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_accessed DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `, (err) => {
                if (err) console.error('Error creating saved_passwords table:', err);
                else console.log('✅ Saved passwords table created/verified');
            });

            // Password generation history table
            db.run(`
                CREATE TABLE IF NOT EXISTS password_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    password_hash TEXT NOT NULL,
                    settings JSON,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `, (err) => {
                if (err) console.error('Error creating password_history table:', err);
                else console.log('✅ Password history table created/verified');
            });

            // Create indexes for better performance
            db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_saved_passwords_user_id ON saved_passwords(user_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id)`);

            console.log('✅ Database indexes created/verified');
        });

        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
                reject(err);
            } else {
                console.log('✅ Database initialization completed');
                resolve();
            }
        });
    });
}

// Run initialization if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('Database initialization failed:', err);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };