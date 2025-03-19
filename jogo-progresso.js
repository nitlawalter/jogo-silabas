let sessaoAtual = null;
let tempoInicioPalavra = null;
let tentativasPalavraAtual = 0;
let userId = null;

// Inicializar userId quando o documento carregar
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        userId = session.user.id;
        console.log('UserId inicializado:', userId);
    }
});

// Iniciar uma nova sessão quando o nível começa
async function iniciarSessao(nivel) {
    if (!userId) {
        console.error('UserId não disponível');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('sessoes_jogo')
            .insert([{
                user_id: userId,
                nivel: nivel
            }])
            .select();

        if (error) throw error;
        sessaoAtual = data[0];
        console.log('Nova sessão iniciada:', sessaoAtual);
    } catch (error) {
        console.error('Erro ao iniciar sessão:', error);
    }
}

// Finalizar a sessão atual
async function finalizarSessao() {
    if (!sessaoAtual) return;

    try {
        const { error } = await supabase
            .from('sessoes_jogo')
            .update({ data_fim: new Date().toISOString() })
            .eq('id', sessaoAtual.id);

        if (error) throw error;
        console.log('Sessão finalizada:', sessaoAtual.id);
        sessaoAtual = null;
    } catch (error) {
        console.error('Erro ao finalizar sessão:', error);
    }
}

// Iniciar tentativa de uma nova palavra
function iniciarTentativaPalavra() {
    tempoInicioPalavra = new Date();
    tentativasPalavraAtual = 0;
}

// Registrar uma tentativa
async function registrarTentativa(palavra, acertou) {
    if (!sessaoAtual || !tempoInicioPalavra) return;

    tentativasPalavraAtual++;
    const tempoGasto = Math.round((new Date() - tempoInicioPalavra) / 1000);
    
    try {
        const { error } = await supabase
            .from('tentativas')
            .insert([{
                sessao_id: sessaoAtual.id,
                palavra: palavra,
                acertou: acertou,
                tempo_gasto: tempoGasto,
                tentativas_ate_acerto: tentativasPalavraAtual
            }]);

        if (error) throw error;
        console.log('Tentativa registrada:', palavra, acertou ? '(acerto)' : '(erro)');
        
        // Só resetar os contadores se for um acerto
        if (acertou) {
            tempoInicioPalavra = null;
            tentativasPalavraAtual = 0;
        }
    } catch (error) {
        console.error('Erro ao registrar tentativa:', error);
    }
}

// Funções para integrar com o jogo existente
function iniciarNovoNivel(nivel) {
    finalizarSessao().then(() => iniciarSessao(nivel));
}

function iniciarNovaPalavra() {
    iniciarTentativaPalavra();
}

function verificarTentativa(palavra, correto) {
    registrarTentativa(palavra, correto);
} 