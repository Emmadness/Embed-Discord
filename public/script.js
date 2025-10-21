// ---------------------------
// script.js (UNIFICADO)
// ---------------------------

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
  mentionText: document.getElementById('mentionText') // <-- NUEVO campo de mención
};

// ---------- Markdown -> HTML (vista previa) ----------
function formatMarkdown(text) {
  if (!text) return '';
  return text
    // Bloque de código (``` ``` )
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Código inline
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Negrita
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Cursiva
    .replace(/(^|[^*])\*(?!\*)(.*?)\*(?!\*)([^*]|$)/g, '$1<em>$2</em>$3')
    // Tachado
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    // Subrayado
    .replace(/__(.*?)__/g, '<u>$1</u>')
    // Cita (blockquote)
    .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
    // Viñetas (agrupa en <ul>)
    .replace(/^(- .*(?:\n- .*)*)/gm, match =>
      `<ul>${match.replace(/^- (.*)$/gm, '<li>$1</li>')}</ul>`)
    // Numeradas (agrupa en <ol>)
    .replace(/^(\d+\..*(?:\n\d+\..*)*)/gm, match =>
      `<ol>${match.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')}</ol>`)
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Imágenes
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:5px;margin-top:10px;">')
    // Línea horizontal
    .replace(/^---$/gm, '<hr>')
    // Saltos de línea
    .replace(/\n/g, '<br>');
}

// ---------- Preview ----------
function updatePreview() {
  const preview = document.getElementById('embedPreview');
  preview.innerHTML = '';

  // OUTSIDE / mention text (texto fuera del embed)
  const mention = fields.mentionText.value.trim();
  if (mention) {
    // Si el usuario puso una mención en formato <@&ID>, lo mostramos tal cual.
    // Si puso @Rol o texto normal, también se mostrará.
    const mentionEl = document.createElement('div');
    mentionEl.className = 'mention-preview';
    mentionEl.textContent = mention;
    preview.appendChild(mentionEl);
  }

  // Contenedor del embed (visual)
  const container = document.createElement('div');
  container.classList.add('embed-preview');
  // si no hay color elegido, dejar uno por defecto
  container.style.borderLeftColor = fields.color.value || '#7289da';

  const authorHtml = fields.authorName.value
    ? `<div style="margin-bottom:6px;">
         ${fields.authorIcon.value ? `<img src="${fields.authorIcon.value}" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:6px;">` : ''}
         <strong style="vertical-align:middle;">${escapeHtml(fields.authorName.value)}</strong>
       </div>`
    : '';

  const titleHtml = fields.title.value ? `<h3>${escapeHtml(fields.title.value)}</h3>` : '';

  // description se procesa con markdown (vista previa)
  const descriptionHtml = fields.description.value ? formatMarkdown(fields.description.value) : '';

  const imageHtml = fields.imageUrl.value
    ? `<img src="${fields.imageUrl.value}" style="width:100%;border-radius:5px;margin-top:10px;">`
    : '';

  const thumbnailHtml = fields.thumbnailUrl.value
    ? `<img src="${fields.thumbnailUrl.value}" style="float:right;width:60px;height:60px;margin-left:10px;border-radius:5px;">`
    : '';

  const footerHtml = fields.footerText.value
    ? `<div style="margin-top:10px;font-size:12px;color:#aaa;">
         ${fields.footerIcon.value ? `<img src="${fields.footerIcon.value}" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:5px;">` : ''}
         ${escapeHtml(fields.footerText.value)}
       </div>`
    : '';

  container.innerHTML = `${thumbnailHtml}${authorHtml}${titleHtml}<p>${descriptionHtml}</p>${imageHtml}${footerHtml}`;
  preview.appendChild(container);
}

// escape simple para evitar romper HTML del preview
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// Actualizar preview en input
Object.values(fields).forEach(field => field.addEventListener('input', updatePreview));

// Inicializar preview al cargar
updatePreview();

// ---------- Generar código (usa /api/create como antes) ----------
document.getElementById('generate').addEventListener('click', async () => {
  // Construir objeto embed (igual que tenías)
  const embed = {
    title: fields.title.value || undefined,
    description: fields.description.value || undefined,
    color: fields.color.value || undefined,
    image: fields.imageUrl.value ? { url: fields.imageUrl.value } : undefined,
    thumbnail: fields.thumbnailUrl.value ? { url: fields.thumbnailUrl.value } : undefined,
    author: (fields.authorName.value || fields.authorIcon.value) ? {
      name: fields.authorName.value || undefined,
      icon_url: fields.authorIcon.value || undefined
    } : undefined,
    footer: (fields.footerText.value || fields.footerIcon.value) ? {
      text: fields.footerText.value || undefined,
      icon_url: fields.footerIcon.value || undefined
    } : undefined
  };

  // Opcional: eliminar keys con undefined (más limpio)
  const cleanedEmbed = JSON.parse(JSON.stringify(embed, (k, v) => (v === undefined ? undefined : v)));

  try {
    const response = await fetch('/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedEmbed)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    // data.code es lo que tu backend ya devolvía (según tu implementación)
    const generatedCode = data.code || JSON.stringify({ embeds: [cleanedEmbed] }, null, 2);

    // Prepend de la mención/texto fuera del embed (si existe)
    const mentionText = fields.mentionText.value.trim();
    const finalCode = mentionText ? `${mentionText}\n\n${generatedCode}` : generatedCode;

    document.getElementById('embedCode').textContent = finalCode;
    document.getElementById('codeContainer').style.display = 'block';
  } catch (err) {
    console.error(err);
    alert('Ocurrió un error al generar el código. Revisa la consola.');
  }
});

// ---------- Copiar código + toast ----------
document.getElementById('copyCode').addEventListener('click', () => {
  const text = document.getElementById('embedCode').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2500);
  }).catch(err => {
    console.error('Clipboard error:', err);
    alert('No se pudo copiar al portapapeles.');
  });
});

// ---------- Limpiar campos ----------
document.getElementById('clearFields').addEventListener('click', () => {
  Object.keys(fields).forEach(key => {
    if (fields[key]) fields[key].value = '';
  });
  document.getElementById('embedCode').textContent = '';
  document.getElementById('codeContainer').style.display = 'none';
  updatePreview();
});

// ---------- Insert / Toggle Markdown helpers (tu implementación original) ----------
function insertMarkdown(action) {
  const textarea = document.getElementById('description');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);

  if (!selected && !['newline', 'hr'].includes(action)) return;

  let result = selected;

  switch (action) {
    case 'bold':
      result = toggleWrapper(selected, '**');
      break;
    case 'italic':
      result = toggleWrapper(selected, '*');
      break;
    case 'strike':
      result = toggleWrapper(selected, '~~');
      break;
    case 'underline':
      result = toggleWrapper(selected, '__');
      break;
    case 'mono':
      result = toggleWrapper(selected, '`');
      break;
    case 'block':
      result = selected.startsWith('```\n') && selected.endsWith('\n```')
        ? selected.slice(4, -4)
        : `\`\`\`\n${selected}\n\`\`\``;
      break;
    case 'newline':
      result = start === end ? '\n' : selected + '\n';
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
    case 'link': {
      const linkRegex = /^\[([^\]]+)\]\(([^)]+)\)$/;
      result = linkRegex.test(selected)
        ? selected.replace(linkRegex, '$1')
        : `[${selected || 'texto'}](https://url.com)`;
      break;
    }
    case 'image': {
      const imgRegex = /^!\[([^\]]*)\]\(([^)]+)\)$/;
      result = imgRegex.test(selected)
        ? selected.replace(imgRegex, '$1')
        : `![${selected || 'alt'}](https://img-url.com)`;
      break;
    }
    case 'hr':
      result = '\n---\n';
      break;
    case 'upper':
      result = selected.toUpperCase();
      break;
    case 'lower':
      result = selected.toLowerCase();
      break;
    default:
      return;
  }

  textarea.setRangeText(result, start, end, 'select');
  const newEnd = start + result.length;
  textarea.setSelectionRange(start, newEnd);
  textarea.focus();
  textarea.dispatchEvent(new Event('input'));
}

function toggleWrapper(text, wrapper) {
  const lines = text.split('\n');

  // Si TODAS las líneas ya tienen el wrapper, lo quitamos
  const allWrapped = lines.every(line =>
    new RegExp(`^${escapeRegex(wrapper)}(.+?)${escapeRegex(wrapper)}$`).test(line)
  );

  return lines
    .map(line => {
      const regex = new RegExp(`^${escapeRegex(wrapper)}(.+?)${escapeRegex(wrapper)}$`);
      if (allWrapped && regex.test(line)) {
        return line.replace(regex, '$1'); // quitar
      } else {
        return `${wrapper}${line}${wrapper}`; // aplicar
      }
    })
    .join('\n');
}

function escapeRegex(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
