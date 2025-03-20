async function carregarHistoricoPalavras() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error('Usuário não está logado');
            return;
        }

        // Consulta modificada para garantir que retorne todos os registros
        const { data: tentativas, error } = await supabase
            .from('tentativas')
            .select(`
                palavra,
                acertou,
                tentativas_ate_acerto,
                tempo_gasto,
                created_at,
                sessoes_jogo!inner (
                    nivel,
                    user_id
                )
            `)
            .eq('sessoes_jogo.user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro na consulta:', error);
            return;
        }

        console.log('Total de tentativas recuperadas:', tentativas?.length || 0);

        const tbody = document.getElementById('historico-palavras');
        tbody.innerHTML = '';

        if (!tentativas || tentativas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum registro encontrado</td></tr>';
            return;
        }

        tentativas.forEach(tentativa => {
            const row = document.createElement('tr');
            const data = new Date(tentativa.created_at).toLocaleDateString('pt-BR');
            const status = tentativa.acertou ? 
                '<span class="badge bg-success">ACERTOU</span>' : 
                '<span class="badge bg-danger">ERROU</span>';
            
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
        const tbody = document.getElementById('historico-palavras');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Erro ao carregar os dados</td></tr>';
    }
}

// Adicionar chamada à função de carregamento do histórico
document.addEventListener('DOMContentLoaded', carregarHistoricoPalavras); 