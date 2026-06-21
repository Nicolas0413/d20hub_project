const codigoSala = document.getElementById('codigo-sala').value;
let url = `ws://${window.location.host}/ws/sala/${codigoSala}/`;
const socket = new WebSocket(url);

form = document.getElementById('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    let mensagem = e.target.mensagem.value;
    socket.send(JSON.stringify({
        'mensagem': mensagem
    }));
    form.reset();
});

socket.onopen = function(e) {
    console.log("Conexão estabelecida com sucesso.");
};

socket.onmessage = function(e) {
    let data = JSON.parse(e.data);
    console.log("Mensagem recebida:", data);

    if (data.type === 'chat_message') {
            let mensagens = document.getElementById('mensagens');
            mensagens.insertAdjacentHTML('beforeend', `<div>
                <p>${data.mensagem}</p>
            </div>`);
    }
};