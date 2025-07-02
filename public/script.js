// Quill init
const quill = new Quill('#descriptionEditor', {
  theme: 'snow',
  placeholder: 'Escribe la descripción aquí...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': [1, 2, 3, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  }
});

// Actualizar descripción y contador
quill.on('text-change', () => {
  const html = quill.root.innerHTML;
  const text = quill.getText().trim();
  document.getElementById('description').value = html;
  document.getElementById('descriptionCount').textContent = `${text.length}/4096`;
});

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

// NUEVO: Función para parsear Markdown básico
function formatMarkdown(text) {
  return text
    .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>') // bloque de código
    .replace(/`([^`]+)`/g, '<code>$1</code>')                 // monoespaciado
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')         // negrita
    .replace(/\*(.*?)\*/g, '<em>$1</em>')                     // cursiva
    .replace(/~~(.*?)~~/g, '<s>$1</s>')                       // tachado
    .replace(/__(.*?)__/g, '<u>$1</u>')                       // subrayado
    .replace(/\n/g, '<br>');                                  // saltos de línea
}

function updatePreview() {
  const preview = document.getElementById('embedPreview');
  preview.innerHTML = '';

  const container = document.createElement('div');
  container.classList.add('embed-preview');
  container.style.borderLeftColor = fields.color.value;

  const author = fields.authorName.value
    ? `<div><strong>${fields.authorName.value}</strong></div>` : '';

  const title = fields.title.value ? `<h3>${fields.title.value}</h3>` : '';

  const description = formatMarkdown(fields.description.value); // aquí usamos el markdown

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
  const code = data.code;
  document.getElementById('embedCode').textContent = code;
  document.getElementById('codeContainer').style.display = 'block';
});

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

document.getElementById('themeToggle').addEventListener('change', (e) => {
  document.body.classList.toggle('light', e.target.checked);
});

document.getElementById('clearFields').addEventListener('click', () => {
  Object.values(fields).forEach(field => field.value = '');
  updatePreview();
  document.getElementById('embedCode').textContent = '';
  document.getElementById('codeContainer').style.display = 'none';
});
