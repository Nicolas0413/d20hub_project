/* Variáveis globais */

window.edit = false;

const patenteLimits = {
  Recruta:   { catI: 2, catII: 0, catIII: 0, catIV: 0 },
  Operador:  { catI: 3, catII: 1, catIII: 0, catIV: 0 },
  Agente_Especial:    { catI: 3, catII: 2, catIII: 1, catIV: 0 },
  Oficial_de_Operações:   { catI: 3, catII: 3, catIII: 2, catIV: 1 },
  Agente_de_Elite:     { catI: 3, catII: 3, catIII: 3, catIV: 2 }
};

window.atualizarPatente = atualizarPatente;

const fichaId = document.querySelector(".sheet").dataset.id;

/* Execuções */

document.addEventListener("change", evento =>{
    const alvo = evento.target;
    if (alvo.classList.contains("naoficha")) {
        return;
    };
    if (alvo.classList.contains("pericia")){
        const periciaId = alvo.dataset.periciaId;
        salvar("pericia", alvo, periciaId);
    } else if (alvo.classList.contains("habilidade")){
        const habilidadeId = alvo.dataset.habilidadeId;
        salvar("habilidade", alvo, habilidadeId);
    } else if (alvo.classList.contains("item")) {
        const itemId = alvo.dataset.itemId;
        salvar("item", alvo, itemId);
    } else if (alvo.classList.contains("ataque")) {
        const ataqueId = alvo.dataset.ataqueId;
        salvar("ataque", alvo, ataqueId);
    } else {
        salvar("ficha", alvo, fichaId);
    }
});

if (document.getElementById("patenteSelect")) {     /* se página for inventario.html */
    document.addEventListener("DOMContentLoaded", function() {
    const patenteSelect = document.getElementById("patenteSelect");
    patenteSelect.value = patenteSelect.dataset.patente;
    atualizarPatente();
    });
}

/* Funções */

function editar() {
  window.edit = !window.edit;

  document.querySelectorAll(".editable").forEach(i => {
    i.disabled = !window.edit;
  });

  const icon = document.querySelector("#editBtn i");
  const sheet = document.querySelector(".sheet");

  if (window.edit) {
    icon.className = "bi bi-check-lg";
    sheet.classList.add("editing");
  } else {
    icon.className = "bi bi-pencil-square";
    sheet.classList.remove("editing");
  }
}

function salvar(tipo, input, id) {
    const valor = input.value.trim();
    const campo = input.dataset.save;
    fetch(`/fichas/${id}/${tipo}/salvar/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken
        },
        body: JSON.stringify({
            campo: campo,   
            valor: valor
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.mensagem) {
            alert(data.mensagem);
        }
        if (!data.status) {
            alert(`Erro ao salvar ${tipo}! Tente novamente.`);
        }
    });
}

function adicionar(tipo) {
    fetch(`/fichas/${fichaId}/${tipo}/criar/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken
        },
        body: JSON.stringify({
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.status) {
            alert(`Erro ao criar ${tipo}! Tente novamente.`);
        }
    })
    .then(() => {
        window.location.reload();
    });
}

function remover(tipo, id) {
    fetch(`/fichas/${id}/${tipo}/remover/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken
        },
        body: JSON.stringify({
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.mensagem) {
            alert(data.mensagem);
        }
        if (!data.status) {
            alert(`Erro ao remover ${tipo}! Tente novamente.`);
        }
    })
    .then(() => {
        window.location.reload();
    }); 
}

function atualizarPatente() {
  const patente = document.getElementById("patenteSelect").value;
  const limite = patenteLimits[patente];

  document.getElementById("limit-catI").innerText = limite.catI;
  document.getElementById("limit-catII").innerText = limite.catII;
  document.getElementById("limit-catIII").innerText = limite.catIII;
  document.getElementById("limit-catIV").innerText = limite.catIV;
};



