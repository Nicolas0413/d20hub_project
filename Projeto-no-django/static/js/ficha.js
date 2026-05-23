window.edit = false;

const fichaId = document.querySelector(".sheet").dataset.id;

document.addEventListener("change", evento =>{
    const alvo = evento.target;
    if (alvo.classList.contains("naoficha")) {
        return;
    };
    if (alvo.classList.contains("pericia")){
        const periciaId = alvo.id.split(".")[1];
        salvarPericia(alvo, periciaId);
    } else if (alvo.classList.contains("habilidade")){
        const habilidadeId = alvo.id.split("-")[1];
        salvarHabilidade(alvo, habilidadeId);
    } else {
    salvarFicha(alvo);
    };
});

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
