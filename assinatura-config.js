// Configuração de níveis e restrições
const NIVEL_CONFIG = {
    GRATUITO: {
        nome: 'Gratuito',
        maxNivel: 2,
        maxPalavrasPorNivel: 5,
        temSom: true,
        temAnimacoes: true,
        temDicas: true
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
    // Atualiza badge do plano
    const planoBadge = document.getElementById('plano-badge');
    if (planoBadge) {
        planoBadge.textContent = `Plano: ${nivelConfig.nome}`;
        planoBadge.className = `plano-badge ${nivelConfig.nome === 'Premium' ? 'premium' : ''}`;
    }

    // Mostra/esconde banner de upgrade
    const bannerUpgrade = document.getElementById('banner-upgrade');
    if (bannerUpgrade) {
        bannerUpgrade.style.display = nivelConfig.nome === 'Gratuito' ? 'block' : 'none';
    }

    // Atualiza botões de som
    const botaoSom = document.getElementById('botao-som');
    if (botaoSom) {
        botaoSom.disabled = !nivelConfig.temSom;
        if (!nivelConfig.temSom) {
            botaoSom.innerHTML = '🔒';
            botaoSom.title = 'Recurso Premium';
        } else {
            // Mantém o estado atual do som
            const somAtivo = estadoJogo.somAtivo;
            botaoSom.textContent = somAtivo ? '🔊' : '🔇';
            botaoSom.title = somAtivo ? 'Desativar Som' : 'Ativar Som';
        }
    }

    // Atualiza botões de dica
    const botaoDica = document.getElementById('botao-dica');
    if (botaoDica) {
        botaoDica.disabled = !nivelConfig.temDicas;
        botaoDica.title = nivelConfig.temDicas ? 'Mostrar Dica' : 'Recurso Premium';
        if (!nivelConfig.temDicas) {
            botaoDica.innerHTML = '🔒';
        }
    }

    // Atualiza indicador de nível
    const nivelAtual = parseInt(localStorage.getItem('nivelAtual') || '1');
    if (nivelAtual > nivelConfig.maxNivel) {
        mostrarModalUpgrade();
    }

    // Atualiza botões de nível
    const niveisBtns = document.querySelectorAll('.nivel-btn');
    niveisBtns.forEach(btn => {
        const nivel = parseInt(btn.getAttribute('data-nivel'));
        if (nivel > nivelConfig.maxNivel) {
            btn.disabled = true;
            btn.innerHTML += ' 🔒';
            btn.title = 'Disponível apenas no plano Premium';
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const nivelConfig = await verificarStatusAssinatura();
    atualizarInterface(nivelConfig);
}); 