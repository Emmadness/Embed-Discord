const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/create', (req, res) => {
  const embed = req.body;
  const code = uuidv4().replace(/-/g, '').substring(0, 32);

  const dbPath = './embeds.json';
  const db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : {};
  db[code] = embed;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  res.json({ code });
});

app.get('/api/embed/:code', (req, res) => {
  const db = JSON.parse(fs.readFileSync('./embeds.json', 'utf8'));
  const embed = db[req.params.code];
  if (!embed) return res.status(404).json({ error: 'No encontrado' });
  res.json(embed);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Editor de embeds corriendo en http://localhost:${PORT}`);
});

