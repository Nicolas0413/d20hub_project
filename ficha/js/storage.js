const STORAGE_KEY =  window.STORAGE_KEY || "fichaRPG";
console.log('STORAGE_KEY:', STORAGE_KEY);

/* ======================
   SALVAR CAMPO
====================== */

function saveField(key, value) {
  console.log('Saving to STORAGE_KEY:', STORAGE_KEY, 'key:', key, 'value:', value);
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  data[key] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ======================
   CARREGAR CAMPO
====================== */

function loadField(el) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const key = el.dataset.save;
  console.log('Loading from STORAGE_KEY:', STORAGE_KEY, 'key:', key, 'value:', data[key]);

  if (!(key in data)) return;

  if (el.tagName === "IMG") {
    el.src = data[key];
  } else if (el.tagName === "SELECT") {
    el.value = data[key];
  } else {
    el.value = data[key];
  }
}

/* ======================
   INPUT / TEXTAREA
====================== */

document.addEventListener("input", e => {
  const el = e.target;
  if (!el.dataset.save) return;
  saveField(el.dataset.save, el.value);
});

/* ======================
   SELECT
====================== */

document.addEventListener("change", e => {
  const el = e.target;
  if (!el.dataset.save) return;
  saveField(el.dataset.save, el.value);
});

/* ======================
   IMAGENS ANTIGO
====================== 

function setupImage(imgId, inputId) {
  const img = document.getElementById(imgId);
  const input = document.getElementById(inputId);

  if (!img || !input) return;

  // Clique na imagem abre o seletor
  img.addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result;
      saveField(img.dataset.save, reader.result);
    };
    reader.readAsDataURL(file);
  });
}
*/

/* ======================
   IMAGENS
====================== */

function setupImage(imgId, inputId) {
  const img = document.getElementById(imgId);
  const input = document.getElementById(inputId);

  if (!img || !input) return;

  img.addEventListener("click", () => {
    if (!window.edit) return; //  respeita modo edição
    input.click();
  });

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result;
      saveField(img.dataset.save, reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/* ======================
   LOAD GLOBAL
====================== */

window.addEventListener("load", () => {

  // Carrega campos
  document.querySelectorAll("[data-save]").forEach(loadField);

  // Setup imagens (uma única vez!)
  setupImage("charImage", "imageInput");
  setupImage("detailImage", "detailImageInput");

  // Atualiza barras
  if (typeof updateBar === "function") {
    updateBar("pv");
    updateBar("det");
  }

  // Mostra ficha (remove flash)
  document.querySelector(".sheet")?.classList.add("loaded");

});