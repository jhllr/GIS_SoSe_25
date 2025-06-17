const http = require('http');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const { URL } = require('url');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;
const dbFilePath = path.join(__dirname, '../Database/packliste.db');
let db;

async function startServer() {
  db = await sqlite.open({ filename: dbFilePath, driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      text TEXT,
      checked INTEGER DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      content TEXT
    );
  `);

  server.listen(port, hostname, () => {
    console.log(`Server läuft unter http://${hostname}:${port}/`);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;
  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    console.log("Anfrage empfangen:", req.method, path); // <--- NEU HINZUGEFÜGT
    try {
      const data = body ? JSON.parse(body) : {};
      let result;

      // === Kategorien ===
      if (path === '/categories') {
        if (req.method === 'GET') {
          result = await db.all('SELECT * FROM categories');
        } else if (req.method === 'POST') {
          await db.run('INSERT INTO categories (name) VALUES (?)', [data.name]);
          result = { status: 'added' };
        } else if (req.method === 'DELETE') {
          await db.run('DELETE FROM categories WHERE id = ?', [data.id]);
          await db.run('DELETE FROM items WHERE category_id = ?', [data.id]);
          result = { status: 'deleted' };
        }

      // === Items ===
      } else if (path === '/items') {
        if (req.method === 'GET') {
          const categoryId = url.searchParams.get('category_id');
          result = await db.all('SELECT * FROM items WHERE category_id = ?', [categoryId]);
        } else if (req.method === 'POST') {
          await db.run('INSERT INTO items (category_id, text, checked) VALUES (?, ?, ?)', [data.category_id, data.text, 0]);
          result = { status: 'added' };
        } else if (req.method === 'PUT') {
          await db.run('UPDATE items SET text = ?, checked = ? WHERE id = ?', [data.text, data.checked, data.id]);
          result = { status: 'updated' };
        } else if (req.method === 'DELETE') {
          await db.run('DELETE FROM items WHERE id = ?', [data.id]);
          result = { status: 'deleted' };
        }

      // === Notizen ===
      } else if (path === '/notes') {
        if (req.method === 'GET') {
          result = await db.get('SELECT content FROM notes WHERE id = 1') || { content: '' };
        } else if (req.method === 'POST') {
          await db.run('INSERT OR REPLACE INTO notes (id, content) VALUES (1, ?)', [data.content]);
          result = { status: 'saved' };
        }

      } else {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Not found' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result || {}));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

startServer();
