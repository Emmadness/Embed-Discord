const fields = {
  title: document.getElementById('title'),
  mentions: document.getElementById('mentions'),
  description: document.getElementById('description'),
  color: document.getElementById('color'),
  imageUrl: document.getElementById('imageUrl'),
  thumbnailUrl: document.getElementById('thumbnailUrl'),
  authorName: document.getElementById('authorName'),
  authorIcon: document.getElementById('authorIcon'),
  footerText: document.getElementById('footerText'),
  footerIcon: document.getElementById('footerIcon')
};

// 🔹 Formato Markdown básico
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

// 🔹 Actualiza la vista previa
function updatePreview() {
  const preview = document.getElementById('embedPreview');
  preview.innerHTML = '';

  // Mostrar menciones fuera del embed si existen
  if (fields.mentions.value.trim()) {
    const mentionDiv = document.createElement('div');
    mentionDiv.classList.add('mentions-preview');
    mentionDiv.textContent = fields.mentions.value;
    preview.appendChild(mentionDiv);
  }

  const container = document.createElement('div');
  container.classList.add('embed-box');
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

// 🔹 Generar código
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

  // Añadir menciones antes del embed
  if (fields.mentions.value.trim()) {
    code = `${fields.mentions.value}\n\n${code}`;
  }

  document.getElementById('embedCode').textContent = code;
  document.getElementById('codeContainer').style.display = 'block';
});

// 🔹 Copiar código
document.getElementById('copyCode').addEventListener('click', () => {
  const text = document.getElementById('embedCode').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2500);
  });
});

// 🔹 Limpiar campos
document.getElementById('clearFields').addEventListener('click', () => {
  Object.values(fields).forEach(field => field.value = '');
  updatePreview();
  document.getElementById('embedCode').textContent = '';
  document.getElementById('codeContainer').style.display = 'none';
});
