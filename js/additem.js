function uid() {
  if (crypto && crypto.randomUUID) {
    return "id" + crypto.randomUUID();
  }
  return "id" + Date.now() + Math.floor(Math.random() * 1000);
}

const INVENTORY_KEY = "inventario";

// ==========================
// CARREGAR ITENS
// ==========================
function loadItems() {
  const data = localStorage.getItem(INVENTORY_KEY);
  if (!data) return;

  const list = JSON.parse(data);
  const container = document.getElementById("accordionExample");
  container.innerHTML = "";

  list.forEach(item => addItem(item));
}

// ==========================
// SALVAR ITENS
// ==========================
function saveItems() {
  const list = [];

  document.querySelectorAll(".accordion-item").forEach(item => {
    const inputs = item.querySelectorAll("input");
    const textarea = item.querySelector("textarea");

    list.push({
      nome: inputs[0].value,
      categoria: inputs[1].value,
      espacos: inputs[2].value,
      descricao: textarea.value
    });
  });

  localStorage.setItem(INVENTORY_KEY, JSON.stringify(list));
}

// ==========================
// ADICIONAR ITEM
// ==========================
function addItem(data = {}) {

  const id = uid();
  const container = document.getElementById("accordionExample");

  container.insertAdjacentHTML("beforeend", `
  <div class="accordion-item">

    <h2 class="accordion-header">
      <button class="accordion-button" type="button"
        data-bs-toggle="collapse"
        data-bs-target="#${id}">
        <div class="item-row" style="width:100%">
          <input class="editable" disabled value="${data.nome || "Novo Item"}">
          <input class="editable" disabled value="${data.categoria || "I"}">
          <input class="editable" disabled value="${data.espacos || "1"}">
        </div>
      </button>
    </h2>

    <div id="${id}" class="accordion-collapse collapse">
      <div class="accordion-body">
        <textarea class="editable" disabled placeholder="Descrição do item">${data.descricao || ""}</textarea>
        <button class="remove-item">Remover item</button>
      </div>
    </div>

  </div>
  `);

  saveItems();
}

// ==========================
// EVENTOS
// ==========================
document.addEventListener("input", e => {
  if (e.target.closest(".accordion-item")) {
    saveItems();
  }
});

document.addEventListener("click", e => {
  if (e.target.classList.contains("remove-item")) {
    e.target.closest(".accordion-item").remove();
    saveItems();
  }
});

window.addEventListener("load", loadItems);
