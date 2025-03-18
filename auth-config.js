// Configuração do Supabase
const supabaseUrl = 'https://mxiwsqzusurawdifjrmb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14aXdzcXp1c3VyYXdkaWZqcm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNDIzMTcsImV4cCI6MjA1NzgxODMxN30.GzwM3674qEbhofC6lEJPbWOxFGFVeofRwQkeE7QgD34'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Elementos da interface
const errorMessage = document.createElement('div');
errorMessage.className = 'error-message';
errorMessage.style.display = 'none';
errorMessage.style.color = '#e74c3c';
errorMessage.style.marginTop = '1rem';
errorMessage.style.textAlign = 'center';

const loading = document.createElement('div');
loading.className = 'loading';
loading.style.display = 'none';
loading.style.marginTop = '1rem';
loading.style.textAlign = 'center';

const loginModal = document.createElement('div');
loginModal.className = 'modal-upgrade';
loginModal.innerHTML = `
    <div class="modal-content">
        <h2>Login</h2>
        <div class="form-group">
            <input type="email" id="email" placeholder="Email" required>
        </div>
        <div class="form-group">
            <input type="password" id="senha" placeholder="Senha" required>
        </div>
        <button id="btn-login">Entrar</button>
        <button id="btn-criar-conta">Criar Conta</button>
        <button onclick="this.parentElement.parentElement.remove()">Cancelar</button>
    </div>
`;

const userEmail = document.getElementById('user-email');
const btnLogout = document.getElementById('btn-logout');

// Função para mostrar erro
function mostrarErro(mensagem) {
    errorMessage.textContent = mensagem;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Função para mostrar loading
function mostrarLoading() {
    loading.style.display = 'block';
    document.querySelector('.login-button').disabled = true;
}

// Função para esconder loading
function esconderLoading() {
    loading.style.display = 'none';
    document.querySelector('.login-button').disabled = false;
}

// Função para mostrar modal de login
function mostrarLogin() {
    document.body.appendChild(loginModal);
    
    // Eventos dos botões
    document.getElementById('btn-login').addEventListener('click', fazerLogin);
    document.getElementById('btn-criar-conta').addEventListener('click', mostrarModalCriarConta);
}

// Função para fazer login
async function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        mostrarErro('Por favor, preencha todos os campos');
        return;
    }

    mostrarLoading();
    errorMessage.style.display = 'none';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) throw error;

        localStorage.setItem('userId', data.user.id);
        loginModal.remove();
        verificarStatusAssinatura(data.user.id).then(nivelConfig => {
            atualizarInterface(nivelConfig);
        });
    } catch (error) {
        mostrarErro('Erro ao fazer login: ' + error.message);
    } finally {
        esconderLoading();
    }
}

// Função para criar conta
async function criarConta(email, senha) {
    if (!email || !senha) {
        mostrarErro('Por favor, preencha todos os campos');
        return;
    }

    mostrarLoading();
    errorMessage.style.display = 'none';

    try {
        // 1. Criar usuário no auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: senha
        });

        if (authError) throw authError;

        // 2. Criar registro na tabela usuarios
        const { error: dbError } = await supabase
            .from('usuarios')
            .insert([
                {
                    id: authData.user.id,
                    is_subscribed: false,
                    created_at: new Date().toISOString()
                }
            ]);

        if (dbError) throw dbError;

        localStorage.setItem('userId', authData.user.id);
        loginModal.remove();
        verificarStatusAssinatura(authData.user.id).then(nivelConfig => {
            atualizarInterface(nivelConfig);
        });
    } catch (error) {
        mostrarErro('Erro ao criar conta: ' + error.message);
    } finally {
        esconderLoading();
    }
}

// Função para fazer logout
async function fazerLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
    }
}

// Função para verificar status da assinatura
async function verificarStatusAssinatura(userId) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('is_subscribed')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Usuário não existe, vamos criar
                const { error: insertError } = await supabase
                    .from('usuarios')
                    .insert([
                        {
                            id: userId,
                            is_subscribed: false,
                            created_at: new Date().toISOString()
                        }
                    ]);

                if (insertError) throw insertError;
                return NIVEL_CONFIG.GRATUITO;
            }
            throw error;
        }

        return data.is_subscribed ? NIVEL_CONFIG.PREMIUM : NIVEL_CONFIG.GRATUITO;
    } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        return NIVEL_CONFIG.GRATUITO;
    }
}

// Função para atualizar status da assinatura
async function atualizarStatusAssinatura(userId, isSubscribed) {
    try {
        const { error } = await supabase
            .from('usuarios')
            .update({
                is_subscribed: isSubscribed,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao atualizar status da assinatura:', error);
    }
}

// Verifica estado da autenticação
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        localStorage.setItem('userId', session.user.id);
        if (userEmail) {
            userEmail.textContent = session.user.email;
        }
        verificarStatusAssinatura(session.user.id).then(nivelConfig => {
            atualizarInterface(nivelConfig);
        });
    } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('userId');
        window.location.href = 'index.html';
    }
});

// Verifica autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    localStorage.setItem('userId', session.user.id);
    if (userEmail) {
        userEmail.textContent = session.user.email;
    }
    const nivelConfig = await verificarStatusAssinatura(session.user.id);
    atualizarInterface(nivelConfig);
});

// Evento do botão de logout
if (btnLogout) {
    btnLogout.addEventListener('click', fazerLogout);
} 