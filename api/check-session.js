const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://mxiwsqzusurawdifjrmb.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14aXdzcXp1c3VyYXdkaWZqcm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNDIzMTcsImV4cCI6MjA1NzgxODMxN30.GzwM3674qEbhofC6lEJPbWOxFGFVeofRwQkeE7QgD34'
);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    try {
        // Pegar o token de autenticação do cabeçalho
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        // Extrair o token do cabeçalho Bearer
        const token = authHeader.split(' ')[1];
        
        // Verificar a sessão no Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Buscar status da assinatura no banco
        const { data, error } = await supabase
            .from('usuarios')
            .select('is_subscribed')
            .eq('id', user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Usuário não existe, criar registro
                const { error: insertError } = await supabase
                    .from('usuarios')
                    .insert([
                        {
                            id: user.id,
                            is_subscribed: false,
                            created_at: new Date().toISOString()
                        }
                    ]);

                if (insertError) {
                    throw insertError;
                }

                return res.json({ isSubscribed: false });
            }
            throw error;
        }

        res.json({ isSubscribed: data.is_subscribed });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: error.message });
    }
}; 