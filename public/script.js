// --- CAMPOS DEL EMBED ---
const fields = {
  title: document.getElementById('title'),
  description: document.getElementById('description'),
  color: document.getElementById('color'),
  imageUrl: document.getElementById('imageUrl'),
  thumbnailUrl: document.getElementById('thumbnailUrl'),
  authorName: document.getElementById('authorName'),
  authorIcon: document.getElementById('authorIcon'),
  footerText: document.getElementById('footerText'),
  footerIcon: document.getElementById('footerIcon')
};

// --- NUEVO: Mensaje normal fuera del embed ---
const plainMessage = document.getElementById('plainMessage');

// --- FORMATEO DE MARKDOWN ---
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

// --- ACTUALIZAR VISTA PREVIA ---
function updatePreview() {
  const preview = document.getElementById('embedPreview');
  preview.innerHTML = '';

  // Mostrar mensaje normal (opcional)
  if (plainMessage.value) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = plainMessage.value;
    msgDiv.style.marginBottom = '10px';
    preview.appendChild(msgDiv);
  }

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

// --- ESCUCHAR CAMBIOS EN CAMPOS ---
Object.values(fields).forEach(field => field.addEventListener('input', updatePreview));
plainMessage.addEventListener('input', updatePreview);

// --- GENERAR CÓDIGO ---
document.getElementById('generate').addEventListener('click', async () => {
  const embed = {
    title: fields.title.value,
    description: fields.description.value,
    color: fields.color.value,
    image: { url: fields.imageUrl.value },
    thumbnail: { url: fields.thumbnailUrl.value },
    author: {
      name: fields.authorName.value,
      icon_url: fields.authorIcon.value
    },
    footer: {
      text: fields.footerText.value,
      icon_url: fields.footerIcon.value
    }
  };

  const payload = {
    message: plainMessage.value, // mensaje normal
    embed: embed
  };

  const response = await fetch('/api/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  const code = data.code;

  // Mostrar mensaje normal + embed en el código
  document.getElementById('embedCode').textContent = `${plainMessage.value}\n${code}`;
  document.getElementById('codeContainer').style.display = 'block';
});

// --- COPIAR AL PORTAPAPELES ---
document.getElementById('copyCode').addEventListener('click', () => {
  const text = document.getElementById('embedCode').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
  });
});

// --- LIMPIAR CAMPOS ---
document.getElementById('clearFields').addEventListener('click', () => {
  Object.values(fields).forEach(field => field.value = '');
  plainMessage.value = '';
  updatePreview();
  document.getElementById('embedCode').textContent = '';
  document.getElementById('codeContainer').style.display = 'none';
});

// --- FUNCIONES DE MARKDOWN ---
function insertMarkdown(action) {
  const textarea = document.getElementById('description');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);

  if (!selected && !['newline', 'hr'].includes(action)) return;

  let result = selected;

  switch (action) {
    case 'bold': result = toggleWrapper(selected, '**'); break;
    case 'italic': result = toggleWrapper(selected, '*'); break;
    case 'strike': result = toggleWrapper(selected, '~~'); break;
    case 'underline': result = toggleWrapper(selected, '__'); break;
    case 'mono': result = toggleWrapper(selected, '`'); break;
    case 'block': result = selected.startsWith('```\n') && selected.endsWith('\n```') ? selected.slice(4, -4) : `\`\`\`\n${selected}\n\`\`\``; break;
    case 'newline': result = start === end ? '\n' : selected + '\n'; break;
    case 'quote': result = selected ? selected.split('\n').map(line => line.trim().startsWith('>') ? line.replace(/^\s*>+\s?/, '') : `> ${line}`).join('\n') : '> Cita aquí'; break;
    case 'ulist': result = selected ? selected.split('\n').map(line => line.startsWith('- ') ? line.slice(2) : `- ${line}`).join('\n') : '- Ítem'; break;
    case 'olist': result = selected ? selected.split('\n').map((line, i) => { const regex = /^\d+\.\s+/; return regex.test(line) ? line.replace(regex, '') : `${i+1}. ${line}`; }).join('\n') : '1. Ítem numerado'; break;
    case 'link': { const linkRegex = /^\[([^\]]+)\]\(([^)]+)\)$/; result = linkRegex.test(selected) ? selected.replace(linkRegex, '$1') : `[${selected || 'texto'}](https://url.com)`; break; }
    case 'image': { const imgRegex = /^!\[([^\]]*)\]\(([^)]+)\)$/; result = imgRegex.test(selected) ? selected.replace(imgRegex, '$1') : `![${selected || 'alt'}](https://img-url.com)`; break; }
    case 'hr': result = '\n---\n'; break;
    case 'upper': result = selected.toUpperCase(); break;
    case 'lower': result = selected.toLowerCase(); break;
    default: return;
  }

  textarea.setRangeText(result, start, end, 'select');
  const newEnd = start + result.length;
  textarea.setSelectionRange(start, newEnd);
  textarea.focus();
  textarea.dispatchEvent(new Event('input'));
}

function toggleWrapper(text, wrapper) {
  const lines = text.split('\n');
  const allWrapped = lines.every(line => new RegExp(`^${escapeRegex(wrapper)}(.+?)${escapeRegex(wrapper)}$`).test(line));
  return lines.map(line => {
    const regex = new RegExp(`^${escapeRegex(wrapper)}(.+?)${escapeRegex(wrapper)}$`);
    if (allWrapped && regex.test(line)) return line.replace(regex, '$1'); 
    else return `${wrapper}${line}${wrapper}`;
  }).join('\n');
}

function escapeRegex(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
