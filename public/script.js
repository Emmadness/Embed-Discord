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
  mentions: document.getElementById('mentions')
};

// ✅ Markdown parser único (funciona con vista previa)
function formatMarkdown(text) {
  return text
    // Bloque de código
    .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
    // Código inline
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Negrita
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Cursiva
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Tachado
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    // Subrayado
    .replace(/__(.*?)__/g, '<u>$1</u>')
    // Cita
    .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
    // Viñetas agrupadas
    .replace(/^(- .*(?:\n- .*)*)/gm, match =>
      `<ul>${match.replace(/^-\s+(.*)$/gm, '<li>$1</li>')}</ul>`)
    // Numeradas agrupadas
    .replace(/^(\d+\..*(?:\n\d+\..*)*)/gm, match =>
      `<ol>${match.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')}</ol>`)
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Imágenes
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:5px;margin-top:10px;">')
    // Línea horizontal
    .replace(/^---$/gm, '<hr>')
    // Saltos de línea
    .replace(/\n/g, '<br>');
}

// ✅ Actualizar vista previa en tiempo real
function updatePreview() {
  const preview = document.getElementById('embedPreview');
  preview.innerHTML = '';

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

  if (fields.mentions.value.trim()) {
    const mentionDiv = document.createElement('div');
    mentionDiv.style.marginBottom = '10px';
    mentionDiv.style.color = '#00afff';
    mentionDiv.style.fontWeight = 'bold';
    mentionDiv.textContent = fields.mentions.value;
    preview.appendChild(mentionDiv);
  }

  preview.appendChild(container);
}

Object.values(fields).forEach(field => field.addEventListener('input', updatePreview));

// ✅ Generar código del embed
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

  const response = await fetch('/api/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(embed)
  });

  const data = await response.json();
  let code = data.code;

  if (fields.mentions.value.trim()) {
    code = `${fields.mentions.value}\n\n${code}`;
  }

  document.getElementById('embedCode').textContent = code;
  document.getElementById('codeContainer').style.display = 'block';
});

// ✅ Copiar código con toast
document.getElementById('copyCode').addEventListener('click', () => {
  const text = document.getElementById('embedCode').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2500);
  });
});

// ✅ Limpiar campos
document.getElementById('clearFields').addEventListener('click', () => {
  Object.values(fields).forEach(field => field.value = '');
  updatePreview();
  document.getElementById('embedCode').textContent = '';
  document.getElementById('codeContainer').style.display = 'none';
});

// ✅ Función única para insertar Markdown
function insertMarkdown(action) {
  const textarea = document.getElementById('description');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  let result = selected;

  switch (action) {
    case 'bold': result = toggleWrapper(selected, '**'); break;
    case 'italic': result = toggleWrapper(selected, '*'); break;
    case 'strike': result = toggleWrapper(selected, '~~'); break;
    case 'underline': result = toggleWrapper(selected, '__'); break;
    case 'mono': result = toggleWrapper(selected, '`'); break;
    case 'block':
      result = selected.startsWith('```\n') && selected.endsWith('\n```')
        ? selected.slice(4, -4)
        : `\`\`\`\n${selected}\n\`\`\``;
      break;
    case 'quote':
      result = selected
        ? selected.split('\n').map(line =>
            line.trim().startsWith('>') ? line.replace(/^\s*>+\s?/, '') : `> ${line}`
          ).join('\n')
        : '> Cita aquí';
      break;
    case 'ulist':
      result = selected
        ? selected.split('\n').map(line =>
            line.startsWith('- ') ? line.slice(2) : `- ${line}`
          ).join('\n')
        : '- Ítem';
      break;
    case 'olist':
      result = selected
        ? selected.split('\n').map((line, i) => {
            const regex = /^\d+\.\s+/;
            return regex.test(line) ? line.replace(regex, '') : `${i + 1}. ${line}`;
          }).join('\n')
        : '1. Ítem numerado';
      break;
    case 'link':
      result = `[${selected || 'texto'}](https://url.com)`; break;
    case 'image':
      result = `![${selected || 'alt'}](https://img-url.com)`; break;
    case 'hr': result = '\n---\n'; break;
    case 'upper': result = selected.toUpperCase(); break;
    case 'lower': result = selected.toLowerCase(); break;
    default: return;
  }

  textarea.setRangeText(result, start, end, 'select');
  textarea.dispatchEvent(new Event('input'));
}

function toggleWrapper(text, wrapper) {
  const regex = new RegExp(`^${escapeRegex(wrapper)}(.+?)${escapeRegex(wrapper)}$`);
  if (regex.test(text)) return text.replace(regex, '$1');
  return `${wrapper}${text}${wrapper}`;
}

function escapeRegex(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
