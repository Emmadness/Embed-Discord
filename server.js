document.getElementById('title').addEventListener('input', () => {
  const title = document.getElementById('title').value;
  document.getElementById('titleCount').textContent = `${title.length}/256`;
});

document.getElementById('generate').addEventListener('click', () => {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const color = document.getElementById('color').value;
  const image = document.getElementById('imageUrl').value;
  const thumbnail = document.getElementById('thumbnailUrl').value;
  const authorName = document.getElementById('authorName').value;
  const authorIcon = document.getElementById('authorIcon').value;
  const footerText = document.getElementById('footerText').value;
  const footerIcon = document.getElementById('footerIcon').value;

  const embed = {
    title,
    description,
    color,
    image,
    thumbnail,
    author: { name: authorName, icon_url: authorIcon },
    footer: { text: footerText, icon_url: footerIcon }
  };

  const code = JSON.stringify(embed, null, 2);
  document.getElementById('embedCode').textContent = code;
  document.getElementById('codeContainer').style.display = 'block';

  // Vista previa
  const preview = document.getElementById('embedPreview');
  preview.innerHTML = `
    <div class="embed" style="border-left: 4px solid ${color};">
      ${authorName ? `<div class="author"><img src="${authorIcon}" /><span>${authorName}</span></div>` : ''}
      ${title ? `<h3>${title}</h3>` : ''}
      ${description ? `<div class="desc">${description}</div>` : ''}
      ${image ? `<img src="${image}" class="main-image" />` : ''}
      ${thumbnail ? `<img src="${thumbnail}" class="thumbnail" />` : ''}
      ${footerText ? `<div class="footer"><img src="${footerIcon}" /><span>${footerText}</span></div>` : ''}
    </div>
  `;
});

document.getElementById('clearFields').addEventListener('click', () => {
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('color').value = '#000000';
  document.getElementById('imageUrl').value = '';
  document.getElementById('thumbnailUrl').value = '';
  document.getElementById('authorName').value = '';
  document.getElementById('authorIcon').value = '';
  document.getElementById('footerText').value = '';
  document.getElementById('footerIcon').value = '';
  document.getElementById('embedPreview').innerHTML = '';
  document.getElementById('codeContainer').style.display = 'none';
});

document.getElementById('copyCode').addEventListener('click', () => {
  const code = document.getElementById('embedCode').textContent;
  navigator.clipboard.writeText(code);
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
});
