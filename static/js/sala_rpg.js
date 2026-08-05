let socket;

function adicionarFicha() {
    fetch(typeof selecionarFichaUrl !== 'undefined' ? selecionarFichaUrl : '/sessoes/selecionar-ficha/')
        .then(response => response.text())
        .then(html => {
            const modal = document.createElement('div');
            modal.classList.add('modal-wrapper');
            modal.innerHTML = html;
            document.body.appendChild(modal);

            const closeModalBtn = modal.querySelector('.close-modal');
            closeModalBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            const fichaButtons = modal.querySelectorAll('.carregar-ficha');
            fichaButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const fichaId = button.getAttribute('data-ficha-id');
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ mensagem: `/carregar_ficha/${fichaId}/${document.getElementById('codigo-sala').value}/` }));
                    };
                    document.body.removeChild(modal);
                });
            });

            // Fechar modal ao clicar fora
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar modal:', error);
            alert('Erro ao carregar fichas. Tente novamente.');
        });
}

function configurarRemocaoFicha(container) {
    const botoes = container.querySelectorAll('.remove-item');
    botoes.forEach(botao => {
        botao.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const fichaId = botao.getAttribute('data-item-id');
            retirarFicha(fichaId);
        });
    });
}

function retirarFicha(fichaId) {
    const codigoSala = document.getElementById('codigo-sala')?.value;
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ mensagem: `/remover_ficha/${fichaId}/${codigoSala}/` }));
    }
    removerFichaNoFrontend(fichaId);
}

function removerFichaNoFrontend(fichaId) {
    const fichaDiv = document.getElementById(`ficha-${fichaId}`);
    if (fichaDiv) {
        fichaDiv.remove();
    }
}

function removerFicha(fichaId) {
    const codigoSala = document.getElementById('codigo-sala')?.value;
    fetch(`/sessoes/remover_ficha/${fichaId}/${codigoSala}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': window.csrftoken
        }
    })
    .then(response => response.json().catch(() => ({ status: true })))
    .then(() => {
        removerFichaNoFrontend(fichaId);
    })
    .catch(() => {
        removerFichaNoFrontend(fichaId);
    });
}

function alterarVisibilidade(fichaId, visibilidade) {
    fetch(`/fichas/${fichaId}/ficha/salvar/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken
        },
        body: JSON.stringify({
            campo: 'visibilidade',   
            valor: visibilidade
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

function carregarFicha(fichaId) {
    console.log('Carregando ficha:', fichaId);
    const divmae = document.getElementById('fichas');
    const div = document.createElement('div');
    div.id = `ficha-${fichaId}`;
    divmae.appendChild(div);
    fetch(`/sessoes/carregar_ficha/${fichaId}/${document.getElementById('codigo-sala').value}/`)
        .then(response => response.text())
        .then(html => {
            div.innerHTML = html;
            configurarRemocaoFicha(div);
        })
        .catch(error => {
            console.error('Erro ao carregar ficha:', error);
            div.innerHTML = `<p>Erro ao carregar ficha ${fichaId}.</p>`;
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const codigoSala = document.getElementById('codigo-sala').value;
    const url = `${protocolo}://${window.location.host}/ws/sala/${codigoSala}/`;
    socket = new WebSocket(url);
    const form = document.getElementById('form');
    const mensagens = document.getElementById('mensagens');

    function adicionarMensagem(texto) {
        const p = document.createElement('p');
        p.textContent = texto;
        mensagens.appendChild(p);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const mensagem = e.target.mensagem.value.trim();

        if (!mensagem) {
            return;
        }

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ mensagem }));
            mensagem.value = '';
        } else {
            adicionarMensagem('A conexão ainda não está pronta. Tente novamente.');
        }

        form.reset();
    });

    document.addEventListener('click', (event) => {
        const botao = event.target.closest('.remove-item');
        if (!botao) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        retirarFicha(botao.getAttribute('data-item-id'));
    });

    socket.onopen = function() {
        console.log('Conexão estabelecida com sucesso.');
    };

    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);

        if (data.type === 'chat_message') {
            adicionarMensagem(`${data.nome}: ${data.mensagem}`);
        } else if (data.type === 'system') {
            console.log(data.message);
        } else if (data.type === 'carregar_ficha') {
            carregarFicha(data.ficha_id);
        } else if (data.type === 'remover_ficha') {
            removerFicha(data.ficha_id);
        }
    };

    socket.onclose = function() {
        console.log('Conexão encerrada.');
        adicionarMensagem('A conexão foi encerrada.');
    };

    socket.onerror = function(e) {
        console.error(e);
        adicionarMensagem('Ocorreu um erro na conexão com a sala.');
    };
});