// Configuração do Supabase
const supabaseUrl = 'https://mxiwsqzusurawdifjrmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14aXdzcXp1c3VyYXdkaWZqcm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNDIzMTcsImV4cCI6MjA1NzgxODMxN30.GzwM3674qEbhofC6lEJPbWOxFGFVeofRwQkeE7QgD34';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Elementos da interface
const errorMessage = document.createElement('div');
errorMessage.style.cssText = `
    display: none;
    color: #e74c3c;
    margin-top: 1rem;
    text-align: center;
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 2000;
`;
document.body.appendChild(errorMessage);

// Funções auxiliares
function mostrarErro(mensagem) {
    errorMessage.textContent = mensagem;
    errorMessage.style.display = 'block';
    setTimeout(() => errorMessage.style.display = 'none', 5000);
}

function toggleLoading(button, loading) {
    if (button) {
        button.disabled = loading;
        button.style.opacity = loading ? '0.7' : '1';
    }
}

// Funções principais
async function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const button = document.querySelector('.login-button');

    if (!email || !senha) {
        mostrarErro('Por favor, preencha todos os campos');
        return;
    }

    toggleLoading(button, true);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) throw error;
        window.location.href = 'jogo.html';
    } catch (error) {
        mostrarErro('Erro ao fazer login: ' + error.message);
        toggleLoading(button, false);
    }
}

async function criarConta(email, senha) {
    const button = document.querySelector('.modal-criar-conta .login-button');

    if (!email || !senha) {
        mostrarErro('Por favor, preencha todos os campos');
        return;
    }

    toggleLoading(button, true);

    try {
        const { data, error: authError } = await supabase.auth.signUp({
            email: email,
            password: senha
        });

        if (authError) throw authError;

        const { error: dbError } = await supabase
            .from('usuarios')
            .insert([{
                id: data.user.id,
                is_subscribed: false,
                created_at: new Date().toISOString()
            }]);

        if (dbError) throw dbError;
        window.location.href = 'jogo.html';
    } catch (error) {
        mostrarErro('Erro ao criar conta: ' + error.message);
        toggleLoading(button, false);
    }
}

function mostrarModalCriarConta() {
    const modal = document.createElement('div');
    modal.className = 'modal-criar-conta';
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 90%;
        ">
            <h2 style="color: #333; text-align: center; margin-bottom: 2rem;">
                Criar Nova Conta
            </h2>
            <div class="form-group">
                <label for="novo-email">Email</label>
                <input type="email" id="novo-email" placeholder="Seu email">
            </div>
            <div class="form-group">
                <label for="nova-senha">Senha</label>
                <input type="password" id="nova-senha" placeholder="Sua senha">
            </div>
            <button class="login-button" onclick="confirmarCriarConta()">
                Criar Conta
            </button>
            <button style="
                background: #f0f0f0;
                color: #666;
                margin-top: 1rem;
                width: 100%;
                padding: 1rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            " onclick="this.parentElement.parentElement.remove()">
                Cancelar
            </button>
        </div>
    `;
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    document.body.appendChild(modal);
}

function confirmarCriarConta() {
    const email = document.getElementById('novo-email').value;
    const senha = document.getElementById('nova-senha').value;
    criarConta(email, senha);
}

// Verificar se usuário já está logado
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) window.location.href = 'jogo.html';
}); 