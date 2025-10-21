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
  externalText: document.getElementById('externalText') // NUEVO campo para texto fuera del embed
};

// Función para parsear Markdown
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

// Actualizar la vista previa
function updatePreview() {
  const preview = document.getElementById('embedPreview');
  preview.innerHTML = '';

  // Mostrar texto externo primero
  const externalDiv = document.createElement('div');
  externalDiv.textContent = fields.externalText.value;
  externalDiv.style.marginBottom = '8px';
  preview.appendChild(externalDiv);

  // Crear contenedor del embed
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

// Listeners para actualizar preview
Object.values(fields).forEach(field => field.addEventListener('input', updatePreview));

// Generar código completo (texto externo + embed)
document.getElementById('generate').addEventListener('click', () => {
  const externalText = fields.externalText.value;

  // Construir HTML del embed
  const embedHTML = `
<div class="embed-preview" style="border-left: 4px solid ${fields.color.value}; padding: 10px; border-radius: 5px;">
  ${fields.thumbnailUrl.value ? `<img src="${fields.thumbnailUrl.value}" style="float:right;width:60px;height:60px;margin-left:10px;border-radius:5px;">` : ''}
  ${fields.authorName.value ? `<div><strong>${fields.authorName.value}</strong></div>` : ''}
  ${fields.title.value ? `<h3>${fields.title.value}</h3>` : ''}
  <p>${formatMarkdown(fields.description.value)}</p>
  ${fields.imageUrl.value ? `<img src="${fields.imageUrl.value}" style="width:100%;border-radius:5px;margin-top:10px;">` : ''}
  ${fields.footerText.value ? `<div style="margin-top:10px;font-size:12px;color:#aaa;">${fields.footerIcon.value ? `<img src="${fields.footerIcon.value}" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:5px;">` : ''}${fields.footerText.value}</div>` : ''}
</div>
`;

  // Juntar texto externo + embed
  document.getElementById('embedCode').textContent =
    (externalText ? externalText + '\n' : '') + embedHTML;

  document.getElementById('codeContainer').style.display = 'block';
});

// Copiar al portapapeles
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

// Limpiar campos
document.getElementById('clearFields').addEventListener('click', () => {
  Object.values(fields).forEach(field => field.value = '');
  updatePreview();
  document.getElementById('embedCode').textContent = '';
  document.getElementById('codeContainer').style.display = 'none';
});

// Funciones insertMarkdown, toggleWrapper, escapeRegex se mantienen iguales
function insertMarkdown(action) { /* ...igual que tu código base... */ }
function toggleWrapper(text, wrapper) { /* ...igual que tu código base... */ }
function escapeRegex(str) { return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); }


