let socket;

function adicionarFicha() {
    const codigoSala = document.getElementById('codigo-sala')?.value;

    const url = codigoSala
        ? `${selecionarFichaUrl}?codigo_sala=${encodeURIComponent(codigoSala)}`
        : (typeof selecionarFichaUrl !== 'undefined'
            ? selecionarFichaUrl
            : '/sessoes/selecionar-ficha/');

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');
            modal.innerHTML = html;

            document.body.appendChild(modal);

            const fecharModal = () => modal.remove();

            modal.querySelectorAll('.ficha-item').forEach(ficha => {
                ficha.addEventListener('click', () => {
                    const fichaId = ficha.dataset.fichaId;
                    const codigo = document.getElementById('codigo-sala')?.value;

                    if (socket?.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            mensagem: `/carregar_ficha/${fichaId}/${codigo}/`
                        }));
                    }

                    fecharModal();
                });
            });

            // Clicar fora do modal fecha
            modal.addEventListener('click', event => {
                if (event.target === modal) {
                    fecharModal();
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

function atualizarFichaNoFrontend(fichaId) {
    const codigoSala = document.getElementById('codigo-sala')?.value;
    const fichaDiv = document.getElementById(`ficha-${fichaId}`);

    if (!fichaDiv || !codigoSala) {
        return;
    }

    fetch(`/sessoes/carregar_ficha/${fichaId}/${codigoSala}/`)
        .then(response => response.text())
        .then(html => {
            fichaDiv.innerHTML = html;
            configurarRemocaoFicha(fichaDiv);
        })
        .catch(error => {
            console.error('Erro ao atualizar ficha:', error);
        });
}

function alterarVisibilidade(fichaId, visibilidade) {
    const codigoSala = document.getElementById('codigo-sala')?.value;
    
    fetch(`/fichas/${fichaId}/ficha/salvar/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrftoken
        },
        body: JSON.stringify({
            campo: 'visibilidade',
            valor: visibilidade
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status) {
            if (socket && socket.readyState === WebSocket.OPEN && codigoSala) {
                socket.send(JSON.stringify({ 
                    mensagem: `/atualizar_visibilidade/${fichaId}/${visibilidade}/${codigoSala}/` 
                }));
            }
            atualizarFichaNoFrontend(fichaId);
            return;
        }

        if (data.mensagem) {
            alert(data.mensagem);
        } else {
            alert('Erro ao salvar a visibilidade. Tente novamente.');
        }
    })
    .catch(error => {
        console.error('Erro ao alterar visibilidade:', error);
        alert('Erro ao salvar a visibilidade. Tente novamente.');
    });
}

function carregarFicha(fichaId) {
    const divmae = document.getElementById('fichas');
    if (!divmae || document.getElementById(`ficha-${fichaId}`)) {
        return;
    }

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
    const codigoSala = document.getElementById('codigo-sala')?.value;
    const url = codigoSala ? `${protocolo}://${window.location.host}/ws/sala/${codigoSala}/` : null;

    if (url) {
        socket = new WebSocket(url);
    }

    const form = document.getElementById('form');
    const mensagens = document.getElementById('mensagens');

    function adicionarMensagem(texto) {
        if (!mensagens) return;
        const p = document.createElement('p');
        p.textContent = texto;
        mensagens.appendChild(p);
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const mensagem = e.target.mensagem.value.trim();

            if (!mensagem) {
                return;
            }

            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ mensagem }));
            } else {
                adicionarMensagem('A conexão ainda não está pronta. Tente novamente.');
            }

            form.reset();
        });
    }

    document.addEventListener('click', (event) => {
        const botao = event.target.closest('.remove-item');
        if (!botao) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        retirarFicha(botao.getAttribute('data-item-id'));
    });

    if (socket) {
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
            } else if (data.type === 'atualizar_visibilidade') {
                atualizarFichaNoFrontend(data.ficha_id);
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
    }

    const fichasParaCarregar = Array.from(new Set(Array.isArray(window.fichasSessao) ? window.fichasSessao : []));
    fichasParaCarregar.forEach(fichaId => {
        if (fichaId) carregarFicha(fichaId);
    });
});