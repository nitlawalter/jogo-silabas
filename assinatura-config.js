// Configuração de níveis e restrições
const NIVEL_CONFIG = {
    GRATUITO: {
        nome: 'Gratuito',
        maxNivel: 2,
        maxPalavrasPorNivel: 5,
        temSom: false,
        temAnimacoes: false,
        temDicas: false
    },
    PREMIUM: {
        nome: 'Premium',
        maxNivel: 5,
        maxPalavrasPorNivel: 10,
        temSom: true,
        temAnimacoes: true,
        temDicas: true
    }
};

// Função para verificar status da assinatura
async function verificarStatusAssinatura() {
    try {
        // Pegar a sessão atual do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            return NIVEL_CONFIG.GRATUITO;
        }

        // Verifica o status da assinatura
        const response = await fetch('/api/check-session', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('Erro ao verificar assinatura:', await response.text());
            return NIVEL_CONFIG.GRATUITO;
        }

        const data = await response.json();
        return data.isSubscribed ? NIVEL_CONFIG.PREMIUM : NIVEL_CONFIG.GRATUITO;
    } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        return NIVEL_CONFIG.GRATUITO;
    }
}

// Função para verificar se o usuário pode acessar um nível
function podeAcessarNivel(nivelAtual, nivelConfig) {
    return nivelAtual <= nivelConfig.maxNivel;
}

// Função para verificar se o usuário pode acessar mais palavras
function podeAcessarMaisPalavras(palavrasAtuais, nivelConfig) {
    return palavrasAtuais < nivelConfig.maxPalavrasPorNivel;
}

// Função para mostrar modal de upgrade
function mostrarModalUpgrade() {
    const modal = document.createElement('div');
    modal.className = 'modal-upgrade';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Upgrade para Premium</h2>
            <p>Desbloqueie todos os níveis e recursos!</p>
            <ul>
                <li>✓ Todos os níveis disponíveis</li>
                <li>✓ Mais palavras por nível</li>
                <li>✓ Sons e animações</li>
                <li>✓ Dicas e ajuda</li>
            </ul>
            <button onclick="iniciarCheckout()">Fazer Upgrade</button>
            <button onclick="this.parentElement.parentElement.remove()">Continuar Gratuito</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Função para atualizar interface baseado no nível
function atualizarInterface(nivelConfig) {
    // Atualiza botões de som
    const botaoSom = document.getElementById('botao-som');
    if (botaoSom) {
        botaoSom.disabled = !nivelConfig.temSom;
        botaoSom.title = nivelConfig.temSom ? 'Ativar/Desativar Som' : 'Recurso Premium';
    }

    // Atualiza botões de dica
    const botaoDica = document.getElementById('botao-dica');
    if (botaoDica) {
        botaoDica.disabled = !nivelConfig.temDicas;
        botaoDica.title = nivelConfig.temDicas ? 'Mostrar Dica' : 'Recurso Premium';
    }

    // Atualiza indicador de nível
    const nivelAtual = parseInt(localStorage.getItem('nivelAtual') || '1');
    if (nivelAtual > nivelConfig.maxNivel) {
        mostrarModalUpgrade();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const nivelConfig = await verificarStatusAssinatura();
    atualizarInterface(nivelConfig);
}); 