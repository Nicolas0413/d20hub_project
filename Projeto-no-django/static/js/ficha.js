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
        salvarPericia(alvo, periciaId);
    } else if (alvo.classList.contains("habilidade")){
        const habilidadeId = alvo.dataset.habilidadeId;
        salvarHabilidade(alvo, habilidadeId);
    } else if (alvo.classList.contains("item")) {
        const itemId = alvo.dataset.itemId;
        salvarItem(alvo, itemId);
    } else {
        salvarFicha(alvo);
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

function salvarFicha(input) {
    const valorAtual = input.value.trim();
    const campo = input.dataset.save;
    fetch(`/fichas/${fichaId}/salvar/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken
        },
        body: JSON.stringify({
            campo: campo,   
            valor: valorAtual
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.mensagem) {
            alert(data.mensagem);
        }
        if (!data.status) {
            alert("Erro ao salvar a ficha! Tente novamente.");
        }
    });
}

/* Pericias */

function addPericia() {
    fetch(`/fichas/${fichaId}/pericia/criar/`, {
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
            alert("Erro ao criar pericia! Tente novamente.");
        }
    })
    .then(() => {
        window.location.reload();
    });
}

function removerPericia(pericia_id) {
    fetch(`/fichas/${pericia_id}/pericia/remover/`, {
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
            alert("Erro ao remover pericia! Tente novamente.");
        }
    })
    .then(() => {
        window.location.reload();
    }); 
}

function salvarPericia(input, pericia_id) {
   const valorAtual = input.value.trim();
    const campo = input.dataset.save;
    fetch(`/fichas/${pericia_id}/pericia/salvar/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken
        },
        body: JSON.stringify({
            campo: campo,   
            valor: valorAtual
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.mensagem) {
            alert(data.mensagem);
        }
        if (!data.status) {
            alert("Erro ao salvar pericia! Tente novamente.");
        }
    }); 
}

/* Habilidades */

function addHabilidade() {
    fetch(`/fichas/${fichaId}/habilidade/criar/`, {
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
            alert("Erro ao criar habilidade! Tente novamente.");
        }
    })
    .then(() => {
        window.location.reload();
    });
}

function removerHabilidade(habilidade_id) {
    fetch(`/fichas/${habilidade_id}/habilidade/remover/`, {
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
            alert("Erro ao remover habilidade! Tente novamente.");
        }
    })
    .then(() => {
        window.location.reload();
    }); 
}

function salvarHabilidade(input, habilidade_id) {
    const valorAtual = input.value.trim();
    const campo = input.dataset.save;
    fetch(`/fichas/${habilidade_id}/habilidade/salvar/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken
        },
        body: JSON.stringify({
            campo: campo,   
            valor: valorAtual
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.mensagem) {
            alert(data.mensagem);
        }
        if (!data.status) {
            alert("Erro ao salvar habilidade! Tente novamente.");
        }
    }); 
}

/* Inventário */


function atualizarPatente() {
  const patente = document.getElementById("patenteSelect").value;
  const limite = patenteLimits[patente];

  document.getElementById("limit-catI").innerText = limite.catI;
  document.getElementById("limit-catII").innerText = limite.catII;
  document.getElementById("limit-catIII").innerText = limite.catIII;
  document.getElementById("limit-catIV").innerText = limite.catIV;
};

function addItem() {
    fetch(`/fichas/${fichaId}/item/criar/`, {
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
            alert("Erro ao criar item! Tente novamente.");
        }
    })
    .then(() => {
        window.location.reload();
    });
}

function removerItem(item_id) {
    fetch(`/fichas/${item_id}/item/remover/`, {
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
            alert("Erro ao remover item! Tente novamente.");
        }
    })
    .then(() => {
        window.location.reload();
    }); 
}

function salvarItem(input, item_id) {
    const valorAtual = input.value.trim();
    const campo = input.dataset.save;
    fetch(`/fichas/${item_id}/item/salvar/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken
        },
        body: JSON.stringify({
            campo: campo,   
            valor: valorAtual
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.mensagem) {
            alert(data.mensagem);
        }
        if (!data.status) {
            alert("Erro ao salvar item! Tente novamente.");
        }
    }); 
}
