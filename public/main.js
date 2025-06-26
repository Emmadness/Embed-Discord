const form = document.getElementById('embedForm');
const preview = document.getElementById('preview');

function updatePreview() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const color = document.getElementById('color').value;

  preview.innerHTML = `
    <div style="border-left: 5px solid ${color}; padding: 10px; background: #2c2f33; color: white;">
      <h3>${title || '(Sin título)'}</h3>
      <p>${description || '(Sin descripción)'}</p>
    </div>
  `;
}

document.querySelectorAll('#title, #description, #color').forEach(input => {
  input.addEventListener('input', updatePreview);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const embed = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    color: document.getElementById('color').value
  };

  const res = await fetch('/api/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(embed)
  });

  const data = await res.json();
  alert(`✅ Embed guardado. Tu código es: ${data.code}`);
});
