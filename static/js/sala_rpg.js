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