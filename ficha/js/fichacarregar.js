   // Obtém o ID da ficha da URL
    function getFichaId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || 'default';
    }

    const fichaId = getFichaId();
    window.STORAGE_KEY = "fichaRPG_" + fichaId; // Define a chave dinâmica para storage.js

    // Atualiza links para incluir ?id=
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href');
            if (href && href.endsWith('.html') && !href.includes('?')) {
                a.href = href + '?id=' + fichaId;
            }
        });
    });