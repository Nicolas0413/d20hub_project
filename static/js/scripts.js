var contador = 0;

function criarDivFicha(id, nome) {
    const div = document.createElement("div");
    div.classList.add("divfichas");
    div.id = id;
    fichasContainer.appendChild(div);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Nome da ficha";
    input.classList.add("inputficha");
    input.value = nome;
    div.appendChild(input);

    input.addEventListener('blur', () => {
        let nomeAtual = input.value.trim();
        fetch(`/fichas/${id}/ficha/salvar/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify({
            campo: "nome",   
            valor: nomeAtual
        })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status !== true) {
                alert("Erro ao salvar o nome da ficha! Tente novamente.");
            }
        });
    });

    const botoesDiv = document.createElement("div");
    botoesDiv.classList.add("botoesDiv");
    div.appendChild(botoesDiv);
        
    const acessarBtn = document.createElement("button");
    acessarBtn.textContent = "Acessar";
    acessarBtn.classList.add("acessarBtn");
    botoesDiv.appendChild(acessarBtn);

    acessarBtn.addEventListener("click", () => {
        const nomeAtual = input.value.trim();
        if (nomeAtual) {
            window.location.href = `/fichas/${id}/ficha/`;
        } else {
                alert("Por favor, digite um nome para a ficha.");
            }
    });
        
    const excluirBtn = document.createElement("button");
    excluirBtn.textContent = "Excluir";
    excluirBtn.classList.add("excluirBtn");
    botoesDiv.appendChild(excluirBtn);

    excluirBtn.addEventListener("click", () => {
        if (confirm("Tem certeza que deseja excluir esta ficha?")) {
        fetch(`/fichas/${id}/ficha/excluir/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": window.csrftoken
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === true) {
                fichasContainer.removeChild(div); 
                contador--; 
                document.getElementById("contadorFichas").textContent = `Fichas: ${contador}/15`;
            } else {
                alert("Erro ao excluir ficha! Tente novamente.");
            }
        });
    }});
}

function carregarFichas() {
    contador = 0;
    fetch("/fichas/usuario/", {
        method: "GET",
        headers: {
            "X-CSRFToken": csrftoken
        }
    })
    .then(res => res.json())
    .then(data => {
        data.forEach(ficha => {
            criarDivFicha(ficha.id, ficha.nome);
            contador++;
        });
        document.getElementById("contadorFichas").textContent = `Fichas: ${contador}/15`;
    });
}

if (document.getElementById("fichasContainer")) { /* se página for home.html */
    carregarFichas();

    document.getElementById("criarFicha").addEventListener("click", () => {
        if (contador >= 15) {
            alert("Limite de fichas atingido!");
            return;
        }
        abrirModalSistema();
    });

    document.getElementById("limparFichas").addEventListener("click", () => {
        if (confirm("Tem certeza que deseja excluir todas as fichas?")) {
            fetch("/fichas/limpar/", {
                method: "POST",
                headers: { "X-CSRFToken": csrftoken }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === true) {
                    while (fichasContainer.firstChild) {
                        fichasContainer.removeChild(fichasContainer.firstChild);
                    }
                    contador = 0;
                    document.getElementById("contadorFichas").textContent = `Fichas: ${contador}/15`;
                } else {
                    alert("Erro ao limpar fichas! Tente novamente.");
                }
            });
        }
    });
}

function abrirModalSistema() {
    const overlay = document.createElement("div");
    overlay.classList.add("modal-overlay");
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Escolha o sistema</h2>
                <button class="close-modal" id="fecharModalSistema">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ficha-list">
                    <div class="ficha-item" data-sistema="ordem_paranormal">
                        <div class="ficha-nome">Ordem Paranormal</div>
                    </div>
                    <div class="ficha-item" data-sistema="tormenta">
                        <div class="ficha-nome">Tormenta</div>
                    </div>
                    <div class="ficha-item" data-sistema="tormenta20">
                        <div class="ficha-nome">Tormenta 20</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector("#fecharModalSistema").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (evento) => {
        if (evento.target === overlay) overlay.remove();
    });

    overlay.querySelectorAll(".ficha-item").forEach(item => {
        item.addEventListener("click", () => {
            const sistema = item.dataset.sistema;
            overlay.remove();
            criarFichaComSistema(sistema);
        });
    });
}

function criarFichaComSistema(sistema) {
    fetch("/fichas/criar/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({ sistema: sistema })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === true) {
            criarDivFicha(data.id, data.nome);
            contador++;
            document.getElementById("contadorFichas").textContent = `Fichas: ${contador}/15`;
        } else {
            alert("Erro ao criar ficha! Tente novamente.");
        }
    });
}