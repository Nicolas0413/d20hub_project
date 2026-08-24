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
            modal.classList.add('overlay-selecionar-ficha');
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
    const fichaDiv = document.querySelector(`[data-ficha-id="${fichaId}"]`)
        || document.getElementById(`ficha-${fichaId}`)
        || document.getElementById(`ficha${fichaId}`);

    if (!fichaDiv || !codigoSala) {
        console.warn('Container da ficha não encontrado para atualização:', fichaId);
        return;
    }

    fetch(`/sessoes/carregar_ficha/${fichaId}/${codigoSala}/`)
        .then(response => response.text())
        .then(html => {
            fichaDiv.innerHTML = html;
            fichaDiv.dataset.fichaId = fichaId;
            const ficha = fichaDiv.querySelector('[data-visibilidade]');

            if (ficha) {
                fichaDiv.dataset.visibilidade = ficha.dataset.visibilidade;
            }
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
        console.log('Resposta salvar visibilidade:', data);
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

function alterarEditabilidade(fichaId, editabilidade) {
    const codigoSala = document.getElementById('codigo-sala')?.value;
    
    fetch(`/fichas/${fichaId}/ficha/salvar/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrftoken
        },
        body: JSON.stringify({
            campo: 'editabilidade',
            valor: editabilidade
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Resposta salvar editabilidade:', data);
        if (data.status) {
            if (socket && socket.readyState === WebSocket.OPEN && codigoSala) {
                socket.send(JSON.stringify({ 
                    mensagem: `/atualizar_editabilidade/${fichaId}/${editabilidade}/${codigoSala}/` 
                }));
            }
            atualizarFichaNoFrontend(fichaId);
            return;
        }

        if (data.mensagem) {
            alert(data.mensagem);
        } else {
            alert('Erro ao salvar a editabilidade. Tente novamente.');
        }
    })
    .catch(error => {
        console.error('Erro ao alterar editabilidade:', error);
        alert('Erro ao salvar a editabilidade. Tente novamente.');
    });
}

function carregarFicha(fichaId) {
    const divmae = document.getElementById('fichas');
    if (!divmae || document.querySelector(`[data-ficha-id="${fichaId}"]`)) {
        return;
    }

    const div = document.createElement('div');
    div.id = `ficha-${fichaId}`;
    div.dataset.fichaId = fichaId;
    divmae.appendChild(div);

    fetch(`/sessoes/carregar_ficha/${fichaId}/${document.getElementById('codigo-sala').value}/`)
        .then(response => response.text())
        .then(html => {
            div.innerHTML = html;
            div.dataset.fichaId = fichaId;
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

        mensagens.scrollTop = mensagens.scrollHeight;
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
                const fichaId = data.ficha_id ?? data.ficha;
                if (fichaId) carregarFicha(fichaId);
            } else if (data.type === 'remover_ficha') {
                const fichaId = data.ficha_id ?? data.ficha;
                if (fichaId) removerFichaNoFrontend(fichaId);
            } else if (data.type === 'atualizar_visibilidade' || data.type === 'atualizar_editabilidade') {
                const fichaId = data.ficha_id ?? data.ficha;
                if (fichaId) atualizarFichaNoFrontend(fichaId);
            } else if (data.type === 'mestre_atualizado') {
                window.mestreId = Number(data.mestre_id);
                atualizarJogadores();
            } else if (data.type === 'voce_foi_expulso') {
                mostrarModalExpulsao(data.mensagem);
                return;
            }  else if (data.type === 'jogador_expulso') {
                    atualizarJogadores();
                    if (Array.isArray(data.fichas)) {
                        data.fichas.forEach(fichaId => {
                            removerFichaNoFrontend(fichaId);
                        });
                    }
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

function verJogadores() {
    const codigoSala = document.getElementById('codigo-sala')?.value;

    if (!codigoSala) return;

    // Impede abrir outra se já estiver aberta
    if (document.getElementById('overlay-jogadores')) {
        return;
    }

    fetch(`/sessoes/jogadores-sala/?codigo_sala=${encodeURIComponent(codigoSala)}`)
        .then(response => response.text())
        .then(html => {

            const overlay = document.createElement('div');
            overlay.id = 'overlay-jogadores';
            overlay.className = 'overlay-jogadores';

            const modal = document.createElement('div');
            modal.className = 'modal-jogadores';

            modal.innerHTML = html;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            overlay.addEventListener('click', function(event) {
                if (event.target === overlay) {
                    overlay.remove();
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar jogadores:', error);
        });
}

function atualizarJogadores() {

    const overlay = document.getElementById('overlay-jogadores');

    if (!overlay) {
        return;
    }

    const codigoSala = document.getElementById('codigo-sala')?.value;

    fetch(`/sessoes/jogadores-sala/?codigo_sala=${encodeURIComponent(codigoSala)}`)
        .then(response => response.text())
        .then(html => {

            const modal = overlay.querySelector('.modal-jogadores');

            if (modal) {
                modal.innerHTML = html;
            }

        })
        .catch(error => {
            console.error('Erro ao atualizar jogadores:', error);
        });
}

let menuJogadorAtual = null;

document.addEventListener('click', function(event) {

    const jogador = event.target.closest('.jogador-item');

    if (!jogador) {
        if (menuJogadorAtual && !event.target.closest('.menu-jogador')) {
            menuJogadorAtual.remove();
            menuJogadorAtual = null;
        }

        return;
    }

    const jogadorId = jogador.dataset.jogadorId;

    if (Number(jogadorId) === Number(window.usuarioAtualId)) {
        return;
    }

    if (Number(window.usuarioAtualId) !== Number(window.mestreId)) {
        return;
    }

    if (menuJogadorAtual) {
        menuJogadorAtual.remove();
    }

    const menu = document.createElement('div');
    menu.className = 'menu-jogador';

    menu.innerHTML = `
        <ul class="opcoes-jogador">
            <li class="opcao-expulsar">Expulsar</li>
            <li class="opcao-mestre">Tornar mestre</li>
        </ul>
    `;

    document.body.appendChild(menu);

    menu.querySelector('.opcao-expulsar').addEventListener('click', () => {
        expulsarJogador(jogadorId);
    });

    menu.querySelector('.opcao-mestre').addEventListener('click', () => {
        tornarMestre(jogadorId);
    });

    const rect = jogador.getBoundingClientRect();

    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.left = `${rect.left}px`;

    menuJogadorAtual = menu;
});

function tornarMestre(jogadorId) {
    const codigoSala = document.getElementById('codigo-sala')?.value;

    fetch('/sessoes/tornar-mestre/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrftoken
        },
        body: JSON.stringify({
            jogador_id: jogadorId,
            codigo_sala: codigoSala
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status) {
            if (menuJogadorAtual) {
                menuJogadorAtual.remove();
                menuJogadorAtual = null;
            }
            verJogadores();
        } else {
            alert(data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao tornar mestre:', error);
    });
}

function expulsarJogador(jogadorId) {
    const codigoSala = document.getElementById('codigo-sala')?.value;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket não está conectado.');
        return;
    }

    socket.send(JSON.stringify({
        mensagem: `/expulsar_jogador/${jogadorId}/${codigoSala}/`
    }));

    if (menuJogadorAtual) {
        menuJogadorAtual.remove();
        menuJogadorAtual = null;
    }
}

function mostrarMensagem(titulo, mensagem) {
    const modal = document.getElementById("mensagemModal");

    document.getElementById("mensagemModalTitulo").textContent = titulo;
    document.getElementById("mensagemModalTexto").textContent = mensagem;

    const cancelar = document.getElementById("mensagemModalCancelar");
    const confirmar = document.getElementById("mensagemModalConfirmar");

    cancelar.style.display = "none";

    confirmar.textContent = "OK";
    confirmar.style.display = "block";

    modal.style.display = "flex";

    confirmar.onclick = () => {
        modal.style.display = "none";
    };
}

function mostrarModalExpulsao(mensagem) {
    const modal = document.getElementById("mensagemModal");

    document.getElementById("mensagemModalTitulo").textContent =
        "Você foi expulso";

    document.getElementById("mensagemModalTexto").textContent =
        mensagem;

    const cancelar = document.getElementById("mensagemModalCancelar");
    const confirmar = document.getElementById("mensagemModalConfirmar");

    cancelar.style.display = "none";

    confirmar.textContent = "Voltar ao menu";
    confirmar.style.display = "block";

    modal.style.display = "flex";

    confirmar.onclick = () => {
        window.location.href = "/";
    };
}

document.addEventListener('click', function(event) {
    const botao = event.target.closest('.ficha-item .accordion-button');

    if (!botao) {
        return;
    }

    const ficha = botao.closest('.ficha-item');

    if (!ficha) {
        return;
    }

    const podeVer = ficha.dataset.podeVer === "true";

    if (!podeVer) {
        event.preventDefault();
        event.stopPropagation();

        mostrarMensagem(
            "Acesso negado",
            "Você não tem visibilidade suficiente para visualizar esta ficha."
        );
    }
});