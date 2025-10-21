const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const colorInput = document.getElementById("color");
const imageUrlInput = document.getElementById("imageUrl");
const thumbnailUrlInput = document.getElementById("thumbnailUrl");
const authorNameInput = document.getElementById("authorName");
const authorIconInput = document.getElementById("authorIcon");
const footerTextInput = document.getElementById("footerText");
const footerIconInput = document.getElementById("footerIcon");
const mentionTextInput = document.getElementById("mentionText");
const embedPreview = document.getElementById("embedPreview");
const codeContainer = document.getElementById("codeContainer");
const embedCode = document.getElementById("embedCode");
const toast = document.getElementById("toast");

function updatePreview() {
  const title = titleInput.value;
  const description = descriptionInput.value;
  const color = colorInput.value || "#7289da";
  const imageUrl = imageUrlInput.value;
  const thumbnailUrl = thumbnailUrlInput.value;
  const authorName = authorNameInput.value;
  const authorIcon = authorIconInput.value;
  const footerText = footerTextInput.value;
  const footerIcon = footerIconInput.value;
  const mentionText = mentionTextInput.value;

  let html = "";

  if (mentionText) {
    html += `<p class="mention-preview">${mentionText}</p>`;
  }

  html += `<div class="embed-preview" style="border-left-color:${color}">
    ${authorName ? `<div><img src="${authorIcon}" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;"> <strong>${authorName}</strong></div>` : ""}
    ${title ? `<h3>${title}</h3>` : ""}
    ${description ? `<p>${description}</p>` : ""}
    ${imageUrl ? `<img src="${imageUrl}" style="width:100%;margin-top:10px;border-radius:5px;">` : ""}
    ${thumbnailUrl ? `<img src="${thumbnailUrl}" style="width:50px;height:50px;position:absolute;top:10px;right:10px;border-radius:5px;">` : ""}
    ${footerText ? `<div style="margin-top:10px;opacity:0.8;"><img src="${footerIcon}" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;"> ${footerText}</div>` : ""}
  </div>`;

  embedPreview.innerHTML = html;
}

document.querySelectorAll("input, textarea").forEach(el => {
  el.addEventListener("input", updatePreview);
});

document.getElementById("generate").addEventListener("click", () => {
  const mention = mentionTextInput.value ? `${mentionTextInput.value}\n` : "";
  const code = `${mention}{
  "title": "${titleInput.value}",
  "description": "${descriptionInput.value}",
  "color": "${colorInput.value}",
  "image": { "url": "${imageUrlInput.value}" },
  "thumbnail": { "url": "${thumbnailUrlInput.value}" },
  "author": { "name": "${authorNameInput.value}", "icon_url": "${authorIconInput.value}" },
  "footer": { "text": "${footerTextInput.value}", "icon_url": "${footerIconInput.value}" }
}`;

  embedCode.textContent = code;
  codeContainer.style.display = "block";
});

document.getElementById("copyCode").addEventListener("click", () => {
  navigator.clipboard.writeText(embedCode.textContent).then(() => {
    toast.style.display = "block";
    setTimeout(() => (toast.style.display = "none"), 2000);
  });
});

document.getElementById("clearFields").addEventListener("click", () => {
  document.querySelectorAll("input, textarea").forEach(el => (el.value = ""));
  codeContainer.style.display = "none";
  embedPreview.innerHTML = "";
});
