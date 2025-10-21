const fields = {
  title: document.getElementById('title'),
  description: document.getElementById('description'),
  color: document.getElementById('color'),
  imageUrl: document.getElementById('imageUrl'),
  thumbnailUrl: document.getElementById('thumbnailUrl'),
  authorName: document.getElementById('authorName'),
  authorIcon: document.getElementById('authorIcon'),
  footerText: document.getElementById('footerText'),
  footerIcon: document.getElementById('footerIcon'),
  externalText: document.getElementById('externalText')
};

// Función para parsear Markdown básico
function formatMarkdown(text) {
  return text
    .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^(- .*(?:\n- .*)*)/gm, match =>
      `<ul>${match.replace(/^-\s+(.*)$/gm, '<li>$1</li>')}</ul>`)
    .replace(/^(\d+\..*(?:\n\d+\..*)*)/gm, match =>
      `<ol>${match.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')}</ol>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:5px;margin-top:10px;">')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n/g, '<br>');
}

// Actualizar preview en la web
function updatePreview() {
  const preview = document.getElementById('embedPreview');
  const externalPreview = document.getElementById('externalPreview');
  preview.innerHTML = '';
  externalPreview.textContent = fields.externalText.value;

  const container = document.createElement('div');
  container.classList.add('embed-preview');
  container.style.borderLeftColor = fields.color.value;

  const author = fields.authorName.value
    ? `<div><strong>${fields.authorName.value}</strong></div>` : '';

  const title = fields.title.value ? `<h3>${fields.title.value}</h3>` : '';
  const description = formatMarkdown(fields.description.value);

  const image = fields.imageUrl.value
    ? `<img src="${fields.imageUrl.value}" style="width:100%;border-radius:5px;margin-top:10px;">` : '';

  const thumbnail = fields.thumbnailUrl.value
    ? `<img src="${fields.thumbnailUrl.value}" style="float:right;width:60px;height:60px;margin-left:10px;border-radius:5px;">` : '';

  const footer = fields.footerText.value
    ? `<div style="margin-top:10px;font-size:12px;color:#aaa;">
         ${fields.footerIcon.value ? `<img src="${fields.footerIcon.value}" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:5px;">` : ''}
         ${fields.footerText.value}
       </div>` : '';

  container.innerHTML = `${thumbnail}${author}${title}<p>${description}</p>${image}${footer}`;
  preview.appendChild(container);
}

Object.values(fields).forEach(field => field.addEventListener('input', updatePreview));

// Generar código JSON listo para enviar al bot
document.getElementById('generate').addEventListener('click', () => {
  const embed = {};

  if (fields.title.value) embed.title = fields.title.value;
  if (fields.description.value) embed.description = fields.description.value;
  if (fields.color.value) embed.color = parseInt(fields.color.value.replace('#',''), 16);
  if (fields.imageUrl.value) embed.image = { url: fields.imageUrl.value };
  if (fields.thumbnailUrl.value) embed.thumbnail = { url: fields.thumbnailUrl.value };
  if (fields.authorName.value) embed.author = { name: fields.authorName.value };
  if (fields.authorIcon.value) embed.author = { ...(embed.author || {}), icon_url: fields.authorIcon.value };
  if (fields.footerText.value) embed.footer = { text: fields.footerText.value };
  if (fields.footerIcon.value) embed.footer = { ...(embed.footer || {}), icon_url: fields.footerIcon.value };

  const finalJSON = {
    content: fields.externalText.value || '',
    embeds: embed.title || embed.description || embed.color || embed.image || embed.thumbnail || embed.author || embed.footer ? [embed] : []
  };

  document.getElementById('embedCode').textContent = JSON.stringify(finalJSON, null, 2);
  document.getElementById('codeContainer').style.display = 'block';
});

// Copiar al portapapeles
document.getElementById('copyCode').addEventListener('click', () => {
  const text = document.getElementById('embedCode').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
  });
});

// Limpiar campos
document.getElementById('clearFields').addEventListener('click', () => {
  Object.values(fields).forEach(field => field.value = '');
  updatePreview();
  document.getElementById('embedCode').textContent = '';
  document.getElementById('codeContainer').style.display = 'none';
});

// --- Markdown helpers ---
function insertMarkdown(action) { /* tu código de Markdown aquí, sin cambios */ }
function toggleWrapper(text, wrapper) { /* tu código aquí */ }
function escapeRegex(str) { /* tu código aquí */ }
