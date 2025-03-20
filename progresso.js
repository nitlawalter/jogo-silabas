async function carregarHistoricoPalavras() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error('Usuário não está logado');
            return;
        }

        const { data: tentativas, error } = await supabase
            .from('tentativas')
            .select(`
                palavra,
                acertou,
                tentativas_ate_acerto,
                tempo_gasto,
                created_at,
                sessoes_jogo!inner (
                    nivel
                )
            `)
            .eq('sessoes_jogo.user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const tbody = document.getElementById('historico-palavras');
        tbody.innerHTML = '';

        // Agrupar tentativas por palavra para mostrar apenas a última tentativa de cada palavra
        const palavrasUnicas = {};
        tentativas.forEach(tentativa => {
            if (!palavrasUnicas[tentativa.palavra] || 
                tentativa.created_at > palavrasUnicas[tentativa.palavra].created_at) {
                palavrasUnicas[tentativa.palavra] = tentativa;
            }
        });

        Object.values(palavrasUnicas).forEach(tentativa => {
            const row = document.createElement('tr');
            const data = new Date(tentativa.created_at).toLocaleDateString('pt-BR');
            const status = tentativa.acertou ? 
                '<span class="badge bg-success">Acertou</span>' : 
                '<span class="badge bg-danger">Errou</span>';
            
            row.innerHTML = `
                <td>${tentativa.palavra}</td>
                <td>${tentativa.sessoes_jogo.nivel}</td>
                <td>${status}</td>
                <td>${tentativa.tentativas_ate_acerto}</td>
                <td>${tentativa.tempo_gasto}s</td>
                <td>${data}</td>
            `;

            // Adicionar classe para destacar palavras com muitas tentativas
            if (tentativa.tentativas_ate_acerto > 3) {
                row.classList.add('table-warning');
            }

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

// Adicionar chamada à função de carregamento do histórico
document.addEventListener('DOMContentLoaded', () => {
    carregarHistoricoPalavras();
}); 