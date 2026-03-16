const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "billing.db");

const schemaPath = path.join(__dirname, "schema.sql");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    return;
  }

  console.log("Connected to the SQLite database.");

  db.run("PRAGMA foreign_keys = ON");
});

function initializeDatabase() {
  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='customers'",
    (err, row) => {
      if (err) {
        console.error("Error checking database:", err.message);
        return;
      }

      if (!row) {
        console.log("Initializing database...");
        const schema = fs.readFileSync(schemaPath, "utf8");
        db.exec(schema, (err) => {
          if (err) {
            console.error("Error initializing database:", err.message);
          } else {
            console.log("Database initialized successfully.");
          }
        });
      } else {
        console.log("Database already initialized.");
      }
    },
  );
}

initializeDatabase();

module.exports = db;
