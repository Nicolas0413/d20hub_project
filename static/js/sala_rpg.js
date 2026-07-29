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
                    carregarFicha(fichaId);
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

function carregarFicha(fichaId) {
    console.log('Carregando ficha:', fichaId);
    // Aqui você pode adicionar a lógica para carregar a ficha
    // Por exemplo, fazer um fetch para preencher os dados da ficha
}

document.addEventListener('DOMContentLoaded', () => {
    const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const codigoSala = document.getElementById('codigo-sala').value;
    const url = `${protocolo}://${window.location.host}/ws/sala/${codigoSala}/`;
    const socket = new WebSocket(url);
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
        } else {
            adicionarMensagem('A conexão ainda não está pronta. Tente novamente.');
        }

        form.reset();
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