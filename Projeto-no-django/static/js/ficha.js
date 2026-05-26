/* Variáveis globais */

window.edit = false;

const patenteLimits = {
  Recruta:   { catI: 2, catII: 0, catIII: 0, catIV: 0 },
  Operador:  { catI: 3, catII: 1, catIII: 0, catIV: 0 },
  Agente_Especial:    { catI: 3, catII: 2, catIII: 1, catIV: 0 },
  Oficial_de_Operações:   { catI: 3, catII: 3, catIII: 2, catIV: 1 },
  Agente_de_Elite:     { catI: 3, catII: 3, catIII: 3, catIV: 2 }
};

const tipos = ["pericia", "habilidade", "item", "ataque"];

window.atualizarPatente = atualizarPatente;

const fichaId = document.querySelector(".sheet").dataset.id;

/* Execuções */

document.addEventListener("change", evento =>{
    const alvo = evento.target;
    if (alvo.classList.contains("naoficha")) {
        return;
    };

    if (alvo.classList.contains("foto")) {
        atualizarFoto(alvo, alvo.dataset.save);
        return;
    };

    for (let tipo of tipos) {
        if (alvo.classList.contains(tipo)) {
            salvar(tipo, alvo, alvo.dataset[`${tipo}Id`]);
            return;
        }
    };

    salvar("ficha", alvo, fichaId);
});

const foto = document.getElementById("charImage"); 
const inputFoto = document.getElementById("imageInput");
foto.addEventListener("click", () => {
    inputFoto.click();
});

if (document.getElementById("detailImage")) { /* se página for detalhes.html */
    const token = document.getElementById("detailImage");
    const inputToken = document.getElementById("detailImageInput");
    token.addEventListener("click", () => {
        inputToken.click();
    });
}

if (document.getElementById("patenteSelect")) {     /* se página for inventario.html */
    document.addEventListener("DOMContentLoaded", function() {
    const patenteSelect = document.getElementById("patenteSelect");
    patenteSelect.value = patenteSelect.dataset.patente;
    atualizarPatente();
    });
};

if (document.getElementById("pvAtual")) { /* se página for ficha.html / tiver barra de vida */
    document.addEventListener("DOMContentLoaded", function() {
        atualizarBarra("pv");
        atualizarBarra("det");
    });
};

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
    if (["pvAtual", "pvMax", "detAtual", "detMax"].includes(input.id)) {
    atualizarBarra(input.id.startsWith("pv") ? "pv" : "det");
    }
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


function atualizarBarra(tipo) { 
  const atual = Number(document.getElementById(tipo + "Atual").value); 
  const maxima = Number(document.getElementById(tipo + "Max").value); 
  const barra = document.getElementById(tipo + "Bar"); 

  if (!maxima || maxima <= 0) { 
    barra.style.width = "0%"; 
    return; 
  } 

  const percentual = Math.max(0, Math.min(100, (atual / maxima) * 100)); 
  barra.style.width = percentual + "%"; 
};

function atualizarFoto(input, campo) {
    if (!input.files.length) {
        return;
    }
    let url;
    if (campo === "foto_personagem") {
        url = `/fichas/${fichaId}/ficha/salvar/foto/`;
    } else if (campo === "token_personagem") {
        url = `/fichas/${fichaId}/ficha/salvar/token/`;
    }
    const arquivo = input.files[0];
    const formData = new FormData();
    formData.append(campo, arquivo);
    fetch(url, {
        method: "POST",
        headers: {
            "X-CSRFToken": window.csrftoken
        },
        body: formData
    })
    .then(resposta => resposta.json())
    .then(data => {
        if (!data.status) {
            alert("Erro ao atualizar imagem! Tente novamente.");
        }
    })
    .then(() => {
        window.location.reload();
    });
};


