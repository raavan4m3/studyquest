const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT UNIQUE NOT NULL,
    state TEXT NOT NULL,
    updatedAt TEXT DEFAULT (datetime('now'))
  )
`);

const upsertStmt = db.prepare(`
  INSERT INTO saves (userId, state, updatedAt) VALUES (?, ?, datetime('now'))
  ON CONFLICT(userId) DO UPDATE SET state = excluded.state, updatedAt = excluded.updatedAt
`);

const getStmt = db.prepare('SELECT state FROM saves WHERE userId = ?');

app.post('/api/save/:userId', (req, res) => {
  const { userId } = req.params;
  const { state } = req.body;
  if (!userId || !state) return res.status(400).json({ error: 'userId and state are required' });
  try {
    upsertStmt.run(userId, JSON.stringify(state));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/load/:userId', (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  try {
    const row = getStmt.get(userId);
    if (!row) return res.json({ state: null });
    res.json({ state: JSON.parse(row.state) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`StudyQuest backend running on http://localhost:${PORT}`);
});
