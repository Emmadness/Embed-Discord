const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Mapeo de roles y usuarios para Discord
const ROLE_MAP = {
  "Save Edit Team": "1429916447819169972",
  "Local Mod": "123456789012345678",
  "Plugins": "987654321098765432"
};

const USER_MAP = {
  "Emmadness": "123456789012345678"
};

// Función para parsear menciones y transformarlas en IDs de Discord
function parseMentions(text) {
  if (!text) return "";

  // Reemplazar roles
  for (const [name, id] of Object.entries(ROLE_MAP)) {
    const regex = new RegExp(`@${name}`, "g");
    text = text.replace(regex, `<@&${id}>`);
  }

  // Reemplazar usuarios
  for (const [name, id] of Object.entries(USER_MAP)) {
    const regex = new RegExp(`@${name}`, "g");
    text = text.replace(regex, `<@${id}>`);
  }

  return text;
}

// Ruta raíz para servir el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Guardar un embed
app.post('/api/create', (req, res) => {
  const embed = req.body;

  // Procesar menciones
  embed.mentions = parseMentions(embed.mentions);

  const code = uuidv4().replace(/-/g, '').substring(0, 32);

  const dbPath = './embeds.json';
  const db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : {};
  db[code] = embed;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  res.json({ code });
});

// Obtener un embed por código
app.get('/api/embed/:code', (req, res) => {
  const db = fs.existsSync('./embeds.json') ? JSON.parse(fs.readFileSync('./embeds.json', 'utf8')) : {};
  const embed = db[req.params.code];
  if (!embed) return res.status(404).json({ error: 'No encontrado' });
  res.json(embed);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Editor de embeds corriendo en http://localhost:${PORT}`);
});
