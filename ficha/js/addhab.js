function uid() {
  if (crypto && crypto.randomUUID) {
    return "id" + crypto.randomUUID();
  }
  return "id" + Date.now() + Math.floor(Math.random() * 1000);
}

const HAB_KEY = window.STORAGE_KEY + "_habilidades";

// ==========================
// CARREGAR
// ==========================
function loadHabilities() {
  const data = localStorage.getItem(window.STORAGE_KEY + "_habilidades");
  if (!data) return;

  const list = JSON.parse(data);
  const container = document.getElementById("accordionExample");
  container.innerHTML = "";

  list.forEach(hab => addHability(hab));
}

// ==========================
// SALVAR
// ==========================
function saveHabilities() {
  const list = [];

  document.querySelectorAll(".accordion-item").forEach(item => {
    const inputs = item.querySelectorAll("input");
    const textarea = item.querySelector("textarea");

    list.push({
      nome: inputs[0].value,
      custo: inputs[1].value,
      pagina: inputs[2].value,
      descricao: textarea.value
    });
  });

  localStorage.setItem(window.STORAGE_KEY + "_habilidades", JSON.stringify(list));
}

// ==========================
// ADICIONAR
// ==========================
function addHability(data = {}) {

  const id = uid();
  const container = document.getElementById("accordionExample");

  container.insertAdjacentHTML("beforeend", `
  <div class="accordion-item">

    <h2 class="accordion-header">
      <button class="accordion-button" type="button"
        data-bs-toggle="collapse"
        data-bs-target="#${id}">
        <div class="item-row" style="width:100%">
          <input class="editable" disabled value="${data.nome || "Nova Habilidade"}">
          <input class="editable" disabled value="${data.custo || "0"}">
          <input class="editable" disabled value="${data.pagina || "0"}">
        </div>
      </button>
    </h2>

    <div id="${id}" class="accordion-collapse collapse">
      <div class="accordion-body">
        <textarea class="editable" disabled placeholder="Descrição da habilidade">${data.descricao || ""}</textarea>
        <button class="remove-item">Remover</button>
      </div>
    </div>

  </div>
  `);

  saveHabilities();
}

// ==========================
// EVENTOS
// ==========================
document.addEventListener("input", e => {
  if (e.target.closest(".accordion-item")) {
    saveHabilities();
  }
});

document.addEventListener("click", e => {
  if (e.target.classList.contains("remove-item")) {
    e.target.closest(".accordion-item").remove();
    saveHabilities();
  }
});

window.addEventListener("load", loadHabilities);

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("addHabBtn");
  if (btn) {
    btn.addEventListener("click", addHability);
  }
});


document.addEventListener("click", e => {
  console.log("CLIQUE:", e.target);
});